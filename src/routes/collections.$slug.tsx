import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { categories, products, type Product } from "@/data/shop";
import { fetchStats, type StatsResponse } from "@/lib/stats";

const PER_PAGE = 6;

// "Best Sellers" is a real, earned collection now — membership comes from
// live completed-order sales counts (see src/lib/stats.ts), never a static
// flag. On a brand-new (or newly-fixed) store this list is legitimately
// empty; that's the correct, expected state, not a bug — see the
// empty-state render below.
function resolveMeta(slug: string): { name: string; description: string } | null {
  if (slug === "best-sellers") {
    return {
      name: "Best Sellers",
      description: "The templates our customers buy, use and tell their friends about.",
    };
  }
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return null;
  return { name: cat.name, description: cat.description };
}

function resolveItems(slug: string, stats: StatsResponse): Product[] {
  if (slug === "best-sellers") {
    const best = new Set(stats.site.bestSellerSlugs);
    return products.filter((p) => best.has(p.slug));
  }
  return products.filter((p) => p.category === slug);
}

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const meta = resolveMeta(params.slug);
    if (!meta) throw notFound();
    const candidateSlugs =
      params.slug === "best-sellers"
        ? products.map((p) => p.slug)
        : products.filter((p) => p.category === params.slug).map((p) => p.slug);
    const stats = await fetchStats({ slugs: candidateSlugs });
    return { name: meta.name, description: meta.description, stats };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — ReadyTrackers` : "Collection — ReadyTrackers";
    const description =
      loaderData?.description ?? "Spreadsheet templates for Excel and Google Sheets.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Collection,
});

function Collection() {
  const { slug } = Route.useParams();
  const { name, description, stats } = Route.useLoaderData();
  const items = useMemo(() => resolveItems(slug, stats), [slug, stats]);
  const bestSellerSlugs = useMemo(() => new Set(stats.site.bestSellerSlugs), [stats]);
  const [sort, setSort] = useState("best");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const list = [...items];
    if (sort === "newest") list.sort((a, b) => b.created.localeCompare(a.created));
    if (sort === "price-asc") list.sort((a, b) => a.sale_price - b.sale_price);
    if (sort === "price-desc") list.sort((a, b) => b.sale_price - a.sale_price);
    if (sort === "best") {
      list.sort(
        (a, b) =>
          (stats.products[b.slug]?.salesCount ?? 0) - (stats.products[a.slug]?.salesCount ?? 0),
      );
    }
    return list;
  }, [items, sort, stats.products]);

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const shown = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const isEmptyBestSellers = slug === "best-sellers" && sorted.length === 0;

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl">{name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </header>

      {isEmptyBestSellers ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="font-display text-xl">No best sellers yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            This list is earned from real orders, and we're a new shop — nobody's bought anything
            yet. Check back soon, or browse everything we've got below.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Browse all templates</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
            <p className="text-sm text-muted-foreground">{sorted.length} templates</p>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48 rounded-full bg-card">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best selling</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
            {shown.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                bestSeller={bestSellerSlugs.has(p.slug)}
                reviewCount={stats.products[p.slug]?.reviewCount ?? 0}
                ratingAvg={stats.products[p.slug]?.ratingAvg ?? 0}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  variant={n === page ? "default" : "outline"}
                  size="sm"
                  className="h-9 w-9 rounded-full p-0"
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
