// GET — real, live numbers to replace what used to be hardcoded on the
// storefront (rating_avg/review_count/best_seller on Product, plus the
// site-wide "62,400+ sales"/"12,000+ reviews"/"40,000+ subscribers" copy).
// Everything here is computed from actual rows — reviews tied to paid
// orders, order_items on paid orders, real subscriber signups. A
// brand-new store legitimately returns zeros; that's the correct,
// expected answer, not a bug.
//
// Query params (all optional):
//   ?slug=<product_slug>   — include the full review list for one product
//   ?slugs=a,b,c           — restrict the `products` map to these slugs
//                            (omit both to get every product with any data)
// `site` aggregates are always included — they're cheap and every page
// that shows a site-wide number needs them.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const FEATURED_REVIEWS_LIMIT = 6;
const BEST_SELLERS_LIMIT = 3;

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const url = new URL(req.url);
  const singleSlug = url.searchParams.get("slug") ?? undefined;
  const slugsParam = url.searchParams.get("slugs");
  const wantedSlugs = slugsParam
    ? slugsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const [
    { data: reviews, error: reviewsErr },
    { data: paidOrders, error: ordersErr },
    { count: subscriberCount, error: subsErr },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("product_slug, reviewer_name, rating, body, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("id, order_items(product_slug, quantity)").eq("status", "paid"),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
  ]);

  if (reviewsErr || ordersErr || subsErr) {
    console.error("product-stats: query failed:", reviewsErr ?? ordersErr ?? subsErr);
    return json({ error: "Could not load stats" }, 500);
  }

  // ---- per-product aggregates ----
  const productMap: Record<
    string,
    { reviewCount: number; ratingAvg: number; ratingSum: number; salesCount: number }
  > = {};
  const ensure = (slug: string) =>
    (productMap[slug] ??= { reviewCount: 0, ratingAvg: 0, ratingSum: 0, salesCount: 0 });

  for (const r of reviews ?? []) {
    const p = ensure(r.product_slug);
    p.reviewCount += 1;
    p.ratingSum += r.rating;
  }
  let totalSalesCount = 0;
  for (const o of paidOrders ?? []) {
    for (const item of o.order_items ?? []) {
      const p = ensure(item.product_slug);
      p.salesCount += item.quantity ?? 1;
      totalSalesCount += item.quantity ?? 1;
    }
  }
  for (const slug of Object.keys(productMap)) {
    const p = productMap[slug];
    p.ratingAvg = p.reviewCount > 0 ? Math.round((p.ratingSum / p.reviewCount) * 10) / 10 : 0;
  }

  const relevantSlugs = wantedSlugs ?? Object.keys(productMap);
  const products: Record<string, { reviewCount: number; ratingAvg: number; salesCount: number }> =
    {};
  for (const slug of relevantSlugs) {
    const p = productMap[slug] ?? { reviewCount: 0, ratingAvg: 0, salesCount: 0 };
    products[slug] = { reviewCount: p.reviewCount, ratingAvg: p.ratingAvg, salesCount: p.salesCount };
  }

  const bestSellerSlugs = Object.entries(productMap)
    .filter(([, p]) => p.salesCount > 0)
    .sort((a, b) => b[1].salesCount - a[1].salesCount)
    .slice(0, BEST_SELLERS_LIMIT)
    .map(([slug]) => slug);

  const featuredReviews = (reviews ?? [])
    .filter((r) => r.rating >= 4)
    .slice(0, FEATURED_REVIEWS_LIMIT)
    .map((r) => ({
      productSlug: r.product_slug,
      reviewerName: r.reviewer_name,
      rating: r.rating,
      body: r.body,
    }));

  const totalReviews = (reviews ?? []).length;
  const ratingAvg =
    totalReviews > 0
      ? Math.round(((reviews ?? []).reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

  const response: Record<string, unknown> = {
    products,
    site: {
      totalReviews,
      ratingAvg,
      totalSalesCount,
      subscriberCount: subscriberCount ?? 0,
      bestSellerSlugs,
      featuredReviews,
    },
  };

  if (singleSlug) {
    response.reviews = (reviews ?? [])
      .filter((r) => r.product_slug === singleSlug)
      .map((r) => ({
        reviewerName: r.reviewer_name,
        rating: r.rating,
        body: r.body,
        createdAt: r.created_at,
      }));
  }

  return json(response);
});
