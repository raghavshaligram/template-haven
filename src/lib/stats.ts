// Live, real review/sales/subscriber numbers — the replacement for what
// used to be hardcoded fields on Product. Backed by supabase/functions/
// product-stats. A brand-new store legitimately gets all-zero stats back;
// every caller here must render that as an honest empty state, never fall
// back to a placeholder number.

export type ProductStat = { reviewCount: number; ratingAvg: number; salesCount: number };
export type FeaturedReview = {
  productSlug: string;
  reviewerName: string;
  rating: number;
  body: string;
};
export type SiteStats = {
  totalReviews: number;
  ratingAvg: number;
  totalSalesCount: number;
  subscriberCount: number;
  bestSellerSlugs: string[];
  featuredReviews: FeaturedReview[];
};
export type ProductReview = {
  reviewerName: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type StatsResponse = {
  products: Record<string, ProductStat>;
  site: SiteStats;
  reviews?: ProductReview[];
};

const EMPTY_SITE: SiteStats = {
  totalReviews: 0,
  ratingAvg: 0,
  totalSalesCount: 0,
  subscriberCount: 0,
  bestSellerSlugs: [],
  featuredReviews: [],
};

function functionsBase(): string | undefined {
  return import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
}

/**
 * Fetches live stats. Pass a single `slug` to also get that product's full
 * review list back; pass `slugs` to scope the `products` map to a known
 * list (e.g. the current page's catalog). Fails soft to an all-zero result
 * — a stats outage should never break a page, it should just show the
 * same honest "nothing yet" state a genuinely new store would have.
 */
export async function fetchStats(opts?: {
  slug?: string;
  slugs?: string[];
}): Promise<StatsResponse> {
  const base = functionsBase();
  const empty: StatsResponse = { products: {}, site: EMPTY_SITE };
  if (!base) return empty;

  const params = new URLSearchParams();
  if (opts?.slug) params.set("slug", opts.slug);
  if (opts?.slugs?.length) params.set("slugs", opts.slugs.join(","));

  try {
    const res = await fetch(`${base}/functions/v1/product-stats?${params.toString()}`);
    if (!res.ok) return empty;
    const data = (await res.json()) as StatsResponse;
    return data.reviews
      ? { products: data.products ?? {}, site: data.site ?? EMPTY_SITE, reviews: data.reviews }
      : { products: data.products ?? {}, site: data.site ?? EMPTY_SITE };
  } catch {
    return empty;
  }
}

export async function submitReview(input: {
  email: string;
  orderRef: string;
  productSlug: string;
  rating: number;
  reviewerName: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const base = functionsBase();
  if (!base) return { ok: false, error: "Reviews aren't set up yet." };
  try {
    const res = await fetch(`${base}/functions/v1/submit-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok)
      return { ok: false, error: data.error ?? "Could not submit your review." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the server. Try again in a minute." };
  }
}

export async function subscribeToNewsletter(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const base = functionsBase();
  if (!base) return { ok: false, error: "Sign-up isn't set up yet." };
  try {
    const res = await fetch(`${base}/functions/v1/newsletter-subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) return { ok: false, error: data.error ?? "Could not subscribe." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the server. Try again in a minute." };
  }
}
