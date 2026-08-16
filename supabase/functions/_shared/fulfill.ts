// Shared fulfillment: mint download tokens + send the order confirmation
// email. Called from both paypal-capture-order (the primary, client-driven
// confirmation) and paypal-webhook (an independent, server-to-server
// confirmation of the same event) — see each function's own comment for
// why both exist; this is the one place their behavior has to agree.
//
// Idempotent by design: the UPDATE below only succeeds for the caller that
// actually transitions the order from 'pending' to 'paid'. Whichever of
// capture-order/webhook lands second finds zero rows and returns without
// minting a second batch of tokens or sending a second email — this is
// what makes it safe for both paths to call this on the same order.
import { CATALOG, TOKEN_MAX_DOWNLOADS, TOKEN_TTL_DAYS } from "./catalog.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any; // avoid pulling the full supabase-js types into every caller

export async function fulfillOrder(
  supabase: SupabaseClient,
  orderId: string,
  email: string | null,
): Promise<void> {
  const { data: claimed, error: claimErr } = await supabase
    .from("orders")
    .update({ status: "paid", email })
    .eq("id", orderId)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (claimErr) {
    console.error("fulfillOrder: failed to claim order:", claimErr);
    throw claimErr;
  }
  // Either already fulfilled by the other confirmation path, or not a
  // pending order at all (unknown id) — nothing to do either way.
  if (!claimed) return;

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("product_slug, product_name, colorway, unit_amount, quantity")
    .eq("order_id", orderId);
  if (itemsErr) {
    console.error("fulfillOrder: failed to load order_items:", itemsErr);
    throw itemsErr;
  }

  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 3600 * 1000).toISOString();
  const tokens: { productName: string; token: string }[] = [];

  for (const item of items ?? []) {
    const cat = CATALOG[item.product_slug];
    if (!cat) continue;
    const { data: tok, error: tokErr } = await supabase
      .from("download_tokens")
      .insert({
        order_id: orderId,
        product_slug: item.product_slug,
        file_key: cat.fileKey,
        expires_at: expiresAt,
        max_downloads: TOKEN_MAX_DOWNLOADS,
      })
      .select()
      .single();
    if (tokErr) {
      console.error("fulfillOrder: failed to mint download token:", tokErr);
      throw tokErr;
    }
    tokens.push({ productName: item.product_name, token: tok.token });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!email || !resendKey || tokens.length === 0) return;

  const fnBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
  const orderRef = String(claimed.id).slice(0, 8).toUpperCase();
  const totalStr =
    claimed.amount_total != null
      ? `$${(claimed.amount_total / 100).toFixed(2)} ${String(claimed.currency ?? "usd").toUpperCase()}`
      : "";
  const rows = tokens
    .map(
      (t) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid #ECEEF2;font:600 15px Arial,sans-serif;color:#23262F">${t.productName}</td>` +
        `<td style="padding:12px 0;border-bottom:1px solid #ECEEF2;text-align:right"><a href="${fnBase}/download?token=${t.token}" ` +
        `style="background:#12B76A;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:999px;font:600 13px Arial,sans-serif;display:inline-block">Download&nbsp;files</a></td></tr>`,
    )
    .join("");
  const html =
    `<div style="background:#F7F8FA;padding:28px 12px">` +
    `<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5E7EC;border-radius:16px;overflow:hidden">` +
    // header band
    `<div style="background:#23262F;padding:18px 28px">` +
    `<span style="display:inline-block;width:9px;height:9px;background:#12B76A;border-radius:50%;margin-right:8px"></span>` +
    `<span style="font:700 16px Arial,sans-serif;color:#ffffff;vertical-align:1px">Ledger&amp;Leaf</span></div>` +
    // body
    `<div style="padding:30px 28px;font-family:Arial,sans-serif;color:#23262F">` +
    `<h1 style="font-size:22px;margin:0 0 8px">Your templates are ready 🎉</h1>` +
    `<p style="color:#6B7280;font-size:14px;line-height:1.6;margin:0 0 22px">` +
    `Thanks for your order! Everything you bought is below — download the ZIP, unzip it, ` +
    `and you're two minutes from a working budget.</p>` +
    `<table width="100%" style="border-top:1px solid #ECEEF2;border-collapse:collapse">${rows}</table>` +
    // getting started
    `<div style="background:#E7F8F0;border:1px solid #12B76A;border-radius:12px;padding:14px 16px;margin-top:22px">` +
    `<p style="font:700 13px Arial,sans-serif;margin:0 0 6px;color:#23262F">Start here (2 minutes)</p>` +
    `<p style="font:400 13px Arial,sans-serif;color:#374151;line-height:1.65;margin:0">` +
    `1. Unzip the download.&nbsp; 2. <b>Open the DEMO file first</b> — it's pre-filled so you can see everything working.&nbsp; ` +
    `3. Open the BLANK file, answer the 6 questions on the <b>Start Here</b> tab.&nbsp; ` +
    `4. Prefer Google Sheets? The link + instructions are in the PDF inside your download.</p></div>` +
    // fine print
    `<p style="color:#6B7280;font-size:12px;line-height:1.7;margin:24px 0 0">` +
    `Order <b>#${orderRef}</b>${totalStr ? ` · ${totalStr}` : ""} · Links stay active for ${TOKEN_TTL_DAYS} days — save the files somewhere safe.<br>` +
    `Lost a file later, link expired, or something broken? Just reply to this email with your ` +
    `order number and we'll sort it out — usually within one business day.</p>` +
    `</div>` +
    // footer
    `<div style="border-top:1px solid #ECEEF2;padding:14px 28px;background:#FAFAFB">` +
    `<p style="font:400 11px Arial,sans-serif;color:#9CA3AF;margin:0">` +
    `Ledger&amp;Leaf · Spreadsheets that do the work for you · One-time purchase, no subscription.</p></div>` +
    `</div></div>`;

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") ?? "Ledger&Leaf <orders@resend.dev>",
      to: [email],
      subject: `Your Ledger&Leaf downloads — order #${orderRef}`,
      html,
    }),
  });
  if (!resp.ok) console.error("fulfillOrder: Resend email failed:", await resp.text());
}
