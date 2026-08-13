import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChevronDown, Play } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/site/Stars";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCart } from "@/lib/cart";
import {
  discountPct,
  getProduct,
  getProductById,
  money,
  products,
  reviewsFor,
} from "@/data/shop";

const REVIEWS_PER_PAGE = 3;

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { name: product.name, tagline: product.tagline };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Ledger&Leaf` : "Template — Ledger&Leaf";
    const description =
      loaderData?.tagline ?? "Spreadsheet template for Excel and Google Sheets.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug)!;
  const { add } = useCart();

  const [img, setImg] = useState(0);
  const [colorway, setColorway] = useState(product.colorway_variants[0]!.name);
  const [reviewPage, setReviewPage] = useState(1);

  const productReviews = reviewsFor(product.id);
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const alsoBought = products.filter((p) => p.id !== product.id && !p.is_plr).slice(0, 2);
  const off = discountPct(product);

  const breakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const n = productReviews.filter((r) => r.rating === star).length;
      return { star, n, pct: productReviews.length ? (n / productReviews.length) * 100 : 0 };
    });
  }, [productReviews]);

  const pages = Math.max(1, Math.ceil(productReviews.length / REVIEWS_PER_PAGE));
  const shownReviews = productReviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE,
  );

  function addToCart(message = "Added to your cart") {
    add(product.id, colorway);
    toast.success(message, { description: `${product.name} — ${colorway}` });
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl bg-secondary shadow-soft">
            <img
              src={product.images[img]}
              alt={`${product.name} preview ${img + 1}`}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="mt-4 flex gap-3">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setImg(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${
                  i === img ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={src} alt="" loading="lazy" width={80} height={80} className="h-full w-full object-cover" />
              </button>
            ))}
            <button
              aria-label="Play walkthrough video"
              onClick={() => toast("Walkthrough video coming soon")}
              className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-transparent"
            >
              <img
                src={product.images[0]}
                alt=""
                loading="lazy"
                width={80}
                height={80}
                className="h-full w-full object-cover brightness-75"
              />
              <Play size={20} className="absolute inset-0 m-auto text-background" />
            </button>
          </div>
        </div>

        {/* Buy box */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl">{product.name}</h1>
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Stars rating={product.rating_avg} />
            <span>
              {product.rating_avg} · {product.review_count.toLocaleString()} reviews
            </span>
          </a>

          <div className="mt-5 flex items-center gap-3">
            <span className="font-display text-3xl text-primary">{money(product.sale_price)}</span>
            {product.sale_price < product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{money(product.price)}</span>
                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <div className="mt-7">
            <p className="mb-2 text-sm font-medium">
              Colorway: <span className="text-muted-foreground">{colorway}</span>
            </p>
            <div className="flex gap-3">
              {product.colorway_variants.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColorway(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  className={`h-9 w-9 rounded-full border-2 ${
                    colorway === c.name ? "border-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => addToCart()}
              className="h-12 rounded-full bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
            >
              Add to cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full"
              onClick={() => addToCart("Straight to checkout")}
              asChild={false}
            >
              Buy now
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Check size={16} className="text-primary" />
            Instant digital download — no physical item shipped.
          </p>

          {product.is_bundle && (
            <div className="mt-8 rounded-2xl bg-card p-5 shadow-soft">
              <h2 className="font-display text-lg">What's included</h2>
              <ul className="mt-4 space-y-3">
                {product.bundle_components.map((id) => {
                  const c = getProductById(id);
                  if (!c) return null;
                  return (
                    <li key={id} className="flex items-center gap-3">
                      <img
                        src={c.images[0]}
                        alt={c.name}
                        loading="lazy"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <Link
                          to="/product/$slug"
                          params={{ slug: c.slug }}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Sold separately for {money(c.sale_price)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <section className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-card p-8 shadow-soft">
          <h2 className="font-display text-2xl">{product.description.headline}</h2>
          {product.description.sections.map((s) => (
            <div key={s.title} className="mt-6">
              <h3 className="font-display text-lg text-primary">{s.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg text-primary">What you'll receive</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {product.description.receive.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg text-primary">After your purchase</h3>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                {product.description.after.map((a, i) => (
                  <li key={a}>
                    {i + 1}. {a}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <Collapsible className="mt-8 border-t border-border pt-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium">
              Disclaimers &amp; compatibility
              <ChevronDown size={16} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2 text-sm text-muted-foreground">
              {product.description.disclaimers.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Frequently bought together */}
        <aside className="h-fit rounded-3xl bg-secondary p-6">
          <h2 className="font-display text-xl">Frequently bought together</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add both and take an extra 15% off at checkout.
          </p>
          <div className="mt-5 grid gap-4">
            {alsoBought.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </aside>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl">Reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="h-fit rounded-2xl bg-card p-6 shadow-soft">
            <p className="font-display text-4xl">{product.rating_avg}</p>
            <Stars rating={product.rating_avg} size={18} />
            <p className="mt-1 text-xs text-muted-foreground">
              Based on {product.review_count.toLocaleString()} reviews
            </p>
            <div className="mt-4 space-y-2">
              {breakdown.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-muted-foreground">{b.star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">{b.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ul className="space-y-4">
              {shownReviews.map((r) => (
                <li key={r.id} className="rounded-2xl bg-card p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.reviewer_name}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <Stars rating={r.rating} className="mt-1" />
                  <p className="mt-3 text-sm text-muted-foreground">{r.text}</p>
                </li>
              ))}
              {shownReviews.length === 0 && (
                <li className="text-sm text-muted-foreground">No written reviews yet.</li>
              )}
            </ul>
            {pages > 1 && (
              <div className="mt-6 flex gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    size="sm"
                    variant={n === reviewPage ? "default" : "outline"}
                    className="h-9 w-9 rounded-full p-0"
                    onClick={() => setReviewPage(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mt-16">
        <h2 className="font-display text-2xl">You may also like</h2>
        <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
