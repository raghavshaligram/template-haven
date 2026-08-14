// Stripe webhook: on checkout.session.completed, record the order,
// mint expiring download tokens, and email the buyer their links.
import Stripe from "npm:stripe@14.25.0";
import { createClient } from "npm:@supabase/supabase-js@2";
import { CATALOG, TOKEN_MAX_DOWNLOADS, TOKEN_TTL_DAYS } from "../_shared/catalog.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (e) {
    console.error("Webhook signature verification failed:", e);
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  try {
    // Idempotent: if we've already processed this session, exit cleanly.
    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (existing) return new Response("already processed", { status: 200 });

    const email = session.customer_details?.email ?? session.customer_email ?? null;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        stripe_session_id: session.id,
        email,
        amount_total: session.amount_total,
        currency: session.currency ?? "usd",
        status: "paid",
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const items: { slug: string; colorway: string; qty: number }[] = JSON.parse(
      session.metadata?.items ?? "[]",
    );

    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 3600 * 1000).toISOString();
    const tokens: { productName: string; token: string }[] = [];

    for (const it of items) {
      const cat = CATALOG[it.slug];
      if (!cat) continue;
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_slug: it.slug,
        product_name: cat.name,
        colorway: it.colorway,
        unit_amount: cat.priceCents,
        quantity: it.qty,
      });
      const { data: tok, error: tokErr } = await supabase
        .from("download_tokens")
        .insert({
          order_id: order.id,
          product_slug: it.slug,
          file_key: cat.fileKey,
          expires_at: expiresAt,
          max_downloads: TOKEN_MAX_DOWNLOADS,
        })
        .select()
        .single();
      if (tokErr) throw tokErr;
      tokens.push({ productName: cat.name, token: tok.token });
    }

    // Email the buyer their download links via Resend.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (email && resendKey && tokens.length > 0) {
      const fnBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
      const rows = tokens
        .map(
          (t) =>
            `<tr><td style="padding:10px 0;font:600 15px Arial,sans-serif;color:#23262F">${t.productName}</td>` +
            `<td style="padding:10px 0;text-align:right"><a href="${fnBase}/download?token=${t.token}" ` +
            `style="background:#12B76A;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font:600 13px Arial,sans-serif">Download</a></td></tr>`,
        )
        .join("");
      const html =
        `<div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#23262F">` +
        `<h1 style="font-size:22px;margin:0 0 6px">Your templates are ready 🎉</h1>` +
        `<p style="color:#6b7280;font-size:14px;margin:0 0 22px">Thanks for your purchase from Ledger&amp;Leaf. ` +
        `Your download links are below — they stay active for ${TOKEN_TTL_DAYS} days, so save the files somewhere safe.</p>` +
        `<table width="100%" style="border-top:1px solid #e5e7eb">${rows}</table>` +
        `<p style="color:#6b7280;font-size:12px;margin-top:26px">Each product includes DEMO + BLANK files for Excel, plus Google Sheets instructions. ` +
        `Lost the files later? Just reply to this email with your order number.</p></div>`;

      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("EMAIL_FROM") ?? "Ledger&Leaf <orders@resend.dev>",
          to: [email],
          subject: "Your Ledger&Leaf downloads",
          html,
        }),
      });
      if (!resp.ok) console.error("Resend email failed:", await resp.text());
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("stripe-webhook error:", e);
    // Non-2xx makes Stripe retry — safe because processing is idempotent.
    return new Response("processing error", { status: 500 });
  }
});
