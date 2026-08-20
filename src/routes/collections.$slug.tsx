import { useMemo, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
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

const PER_PAGE = 6;

function resolve(slug: string): { name: string; description: string; items: Product[] } | null {
  if (slug === "best-sellers") {
    return {
      name: "Best Sellers",
      description: "The templates our customers buy, use and tell their friends about.",
      items: products.filter((p) => p.best_seller),
    };
  }
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return null;
  return {
    name: cat.name,
    description: cat.description,
    items: products.filter((p) => p.category === slug),
  };
}

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const data = resolve(params.slug);
    if (!data) throw notFound();
    return { name: data.name, description: data.description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — ReadyTrackers` : "Collection — ReadyTrackers";
    const description = loaderData?.description ?? "Spreadsheet templates for Excel and Google Sheets.";
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
  const data = resolve(slug)!;
  const [sort, setSort] = useState("best");
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    const list = [...data.items];
    if (sort === "newest") list.sort((a, b) => b.created.localeCompare(a.created));
    if (sort === "price-asc") list.sort((a, b) => a.sale_price - b.sale_price);
    if (sort === "price-desc") list.sort((a, b) => b.sale_price - a.sale_price);
    if (sort === "best") list.sort((a, b) => b.review_count - a.review_count);
    return list;
  }, [data.items, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const shown = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="container-page py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl">{data.name}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{data.description}</p>
      </header>

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
          <ProductCard key={p.id} product={p} />
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
    </div>
  );
}
