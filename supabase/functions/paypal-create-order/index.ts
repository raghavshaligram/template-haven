// POST { items: [{ slug, colorway?, qty? }] } -> { orderId }
//
// Creates a PayPal Order (Orders API v2, one-time payment) for the cart,
// then immediately writes it to our own orders/order_items tables as
// 'pending'. That's the guest-checkout equivalent of the custom_id-based
// ownership check balanceextract.com uses (see that repo's
// paypal-create-order/paypal-capture-order comments): ReadyTrackers has no
// accounts, so instead of "does this order belong to the calling user",
// paypal-capture-order and paypal-webhook only ever fulfill an order that
// genuinely exists here as 'pending' — an id that was never created
// through this function can't be capture-fulfilled.
//
// Prices come only from CATALOG (never the client) — same rule
// create-checkout followed for Stripe. A tampered request body naming a
// lower price has no effect; the amount charged is computed here.
import { createClient } from "npm:@supabase/supabase-js@2";
import { CATALOG } from "../_shared/catalog.ts";
import { getAccessToken, paypalApiBase } from "../_shared/paypal.ts";
import { json, preflight } from "../_shared/http.ts";
import { getUserIdFromRequest } from "../_shared/auth.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

type CartItem = { slug: string; colorway?: string; qty?: number };

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { items } = (await req.json()) as { items: CartItem[] };
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "Cart is empty" }, 400);
    }

    // Accounts are optional (see the accounts migration) -- checkout never
    // requires a session. If the buyer happens to be signed in, this
    // resolves to their user id and the order gets linked to their
    // account for order history/re-download; if not (no header, expired
    // token, whatever), it's null and the order stays exactly as guest
    // checkout has always worked.
    const userId = await getUserIdFromRequest(req);

    // Where PayPal should send the buyer back if the flow runs as a
    // full-page redirect rather than a popup (see application_context
    // below). The browser sends Origin on this cross-origin POST; if it's
    // ever absent the URLs are simply omitted and PayPal falls back to
    // its default behavior.
    const origin = req.headers.get("origin");

    let amountCents = 0;
    const orderItems: {
      product_slug: string;
      product_name: string;
      colorway: string;
      unit_amount: number;
      quantity: number;
    }[] = [];
    const nameParts: string[] = [];

    for (const it of items) {
      const cat = CATALOG[it.slug];
      if (!cat) return json({ error: `Unknown product: ${it.slug}` }, 400);
      const qty = Math.min(Math.max(Math.trunc(it.qty ?? 1), 1), 10);
      const colorway = (it.colorway ?? "Light").slice(0, 40);
      amountCents += cat.priceCents * qty;
      orderItems.push({
        product_slug: it.slug,
        product_name: cat.name,
        colorway,
        unit_amount: cat.priceCents,
        quantity: qty,
      });
      nameParts.push(cat.name);
    }

    // All-free carts skip checkout entirely (handled client-side via the
    // free download link) — same rule create-checkout followed.
    if (amountCents === 0) {
      return json({ error: "Free items don't need checkout — use the free download link." }, 400);
    }

    const accessToken = await getAccessToken();
    const amountUsd = (amountCents / 100).toFixed(2);
    const orderRes = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `ReadyTrackers — ${nameParts.join(", ")}`.slice(0, 127),
            amount: { currency_code: "USD", value: amountUsd },
          },
        ],
        // Digital product, nothing to ship. Set this ONCE, at order level via
        // application_context: it is funding-source-agnostic, so it covers both
        // the PayPal-wallet flow and the "Debit or Credit Card" guest flow.
        //
        // Do NOT also send payment_source.paypal.experience_context.shipping_preference:
        // PayPal rejects orders carrying shipping_preference in both places with
        // 422 INCOMPATIBLE_PARAMETER_VALUE. And payment_source.paypal alone doesn't
        // bind to the card path, which is how the guest card form ends up asking
        // for a shipping address after payment details.
        //
        // return_url/cancel_url: only used when PayPal downgrades from its
        // popup to a full-page redirect (popups blocked, some 3-D Secure
        // challenges, the hosted guest-card flow). PayPal sends the buyer
        // back to return_url with ?token=<orderId>&PayerID=… appended;
        // the storefront's PayPalRedirectReturn component picks those up
        // and completes the capture. Without an explicit return leg, a
        // redirect-flow approval just strands the buyer.
        application_context: {
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          ...(origin ? { return_url: `${origin}/`, cancel_url: `${origin}/` } : {}),
        },
      }),
    });

    if (!orderRes.ok) {
      const body = await orderRes.text();
      console.error("PayPal create-order failed:", orderRes.status, body);
      return json({ error: "Could not start checkout" }, 502);
    }

    const order = await orderRes.json();
    const orderId: string = order.id;

    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        provider: "paypal",
        provider_order_id: orderId,
        amount_total: amountCents,
        currency: "usd",
        status: "pending",
        user_id: userId,
      })
      .select("id")
      .single();
    if (orderErr || !orderRow) {
      console.error("Failed to record pending order:", orderErr);
      return json({ error: "Could not start checkout" }, 500);
    }

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItems.map((it) => ({ ...it, order_id: orderRow.id })));
    if (itemsErr) {
      console.error("Failed to record order items:", itemsErr);
      return json({ error: "Could not start checkout" }, 500);
    }

    return json({ orderId });
  } catch (e) {
    console.error("paypal-create-order error:", e);
    return json({ error: "Could not start checkout" }, 500);
  }
});
