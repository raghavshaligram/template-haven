// POST {email, orderRef, productSlug, rating, reviewerName, body} — the
// only way a row ever lands in public.reviews. A review can only be
// submitted by someone who can produce a real paid order's reference:
// orderRef is checked against the same short id already shown to buyers
// in their confirmation email (see _shared/fulfill.ts:
// `String(order.id).slice(0, 8).toUpperCase()`), so a genuine customer
// always has it without needing a separate lookup.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

type Body = {
  email?: string;
  orderRef?: string;
  productSlug?: string;
  rating?: number;
  reviewerName?: string;
  body?: string;
};

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let input: Body;
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const email = input.email?.trim().toLowerCase();
  const orderRef = input.orderRef?.trim().toUpperCase();
  const productSlug = input.productSlug?.trim();
  const rating = input.rating;
  const reviewerName = input.reviewerName?.trim();
  const body = input.body?.trim();

  if (!email || !orderRef || !productSlug || !reviewerName || !body) {
    return json({ error: "Missing required fields" }, 400);
  }
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return json({ error: "Rating must be 1-5" }, 400);
  }

  // Find a real, paid order for this email that includes this product,
  // then confirm the caller actually knows its reference. Scoping the
  // query to email + product first (rather than fetching every paid
  // order) keeps this cheap even with a large order table.
  const { data: candidates, error: ordersErr } = await supabase
    .from("orders")
    .select("id, order_items!inner(product_slug)")
    .eq("email", email)
    .eq("status", "paid")
    .eq("order_items.product_slug", productSlug);

  if (ordersErr) {
    console.error("submit-review: order lookup failed:", ordersErr);
    return json({ error: "Could not verify your order" }, 500);
  }

  const order = (candidates ?? []).find(
    (o) => String(o.id).replace(/-/g, "").slice(0, 8).toUpperCase() === orderRef,
  );
  if (!order) {
    return json(
      { error: "We couldn't find a paid order matching that email, order number, and product." },
      404,
    );
  }

  const { error: insertErr } = await supabase.from("reviews").insert({
    order_id: order.id,
    product_slug: productSlug,
    reviewer_name: reviewerName,
    rating,
    body,
  });

  if (insertErr) {
    // unique_violation — this order already reviewed this product.
    if (insertErr.code === "23505") {
      return json({ error: "You've already reviewed this product." }, 409);
    }
    console.error("submit-review: insert failed:", insertErr);
    return json({ error: "Could not save your review" }, 500);
  }

  return json({ ok: true });
});
