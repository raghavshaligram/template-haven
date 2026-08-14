// POST { items: [{ slug, colorway?, qty? }], origin }
// -> { url } Stripe Checkout URL (or { free: true, url } for $0 orders)
import Stripe from "npm:stripe@14.25.0";
import { CATALOG } from "../_shared/catalog.ts";
import { json, preflight } from "../_shared/http.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

type CartItem = { slug: string; colorway?: string; qty?: number };

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { items, origin } = (await req.json()) as { items: CartItem[]; origin?: string };
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "Cart is empty" }, 400);
    }
    const site = origin && /^https?:\/\//.test(origin) ? origin : Deno.env.get("SITE_URL") ?? "";

    const line_items = [];
    const meta: { slug: string; colorway: string; qty: number }[] = [];
    for (const it of items) {
      const cat = CATALOG[it.slug];
      if (!cat) return json({ error: `Unknown product: ${it.slug}` }, 400);
      const qty = Math.min(Math.max(Math.trunc(it.qty ?? 1), 1), 10);
      const colorway = (it.colorway ?? "Light").slice(0, 40);
      meta.push({ slug: it.slug, colorway, qty });
      if (cat.priceCents > 0) {
        line_items.push({
          quantity: qty,
          price_data: {
            currency: "usd",
            unit_amount: cat.priceCents,
            product_data: {
              name: cat.name,
              description: `Colorway: ${colorway} · Instant digital download`,
            },
          },
        });
      }
    }

    // All-free carts skip Stripe entirely (handled client-side via /checkout/success?free=1)
    if (line_items.length === 0) {
      return json({ error: "Free items don't need checkout — use the free download link." }, 400);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata: { items: JSON.stringify(meta).slice(0, 4900) },
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cart`,
      automatic_tax: { enabled: false },
    });

    return json({ url: session.url });
  } catch (e) {
    console.error("create-checkout error:", e);
    return json({ error: "Could not start checkout" }, 500);
  }
});
