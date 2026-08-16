import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Download,
  FileSpreadsheet,
  Heart,
  Palette,
  Play,
  Share2,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/site/Stars";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/lib/cart";
import {
  discountPct,
  getCategory,
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
    return {
      name: product.name,
      tagline: product.tagline,
      meta: product.meta_description ?? product.tagline,
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Ledger&Leaf` : "Template — Ledger&Leaf";
    const description = loaderData?.meta ?? "Spreadsheet template for Excel and Google Sheets.";
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
  const { add, openCart, buyNow } = useCart();

  const [img, setImg] = useState(0);
  const [colorway, setColorway] = useState(product.colorway_variants[0]!.name);
  const [reviewPage, setReviewPage] = useState(1);
  const [fav, setFav] = useState(false);

  const category = getCategory(product.category);

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: product.name, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  const productReviews = reviewsFor(product.id);
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const alsoBought = products.filter((p) => p.id !== product.id && !p.is_plr).slice(0, 2);
  const off = discountPct(product);

  const included = product.whats_included ?? product.description.receive;
  const howItWorks = product.how_it_works ?? product.description.after;

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

  function addToCart() {
    add(product.id, colorway);
    // Slide the cart open right away instead of a toast + a separate click
    // to check out — the drawer itself is the confirmation, and it's a
    // one-step checkout (PayPal button included) from here.
    openCart();
  }

  return (
    <div className="container-page py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        {category ? (
          <Link
            to="/collections/$slug"
            params={{ slug: category.slug }}
            className="hover:text-foreground"
          >
            {category.name}
          </Link>
        ) : (
          <span>Templates</span>
        )}
        <span aria-hidden>/</span>
        <span className="line-clamp-1 text-foreground/70">{product.name}</span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] xl:gap-14">
        {/* ================= LEFT — gallery + all the detail ================= */}
        <div>
          {/* Main image */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
            <img
              src={product.images[img]}
              alt={`${product.name} preview ${img + 1}`}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
            {product.best_seller && (
              <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                Bestseller
              </span>
            )}
            <button
              type="button"
              aria-label={fav ? "Remove from favorites" : "Add to favorites"}
              onClick={() => {
                setFav((v) => !v);
                toast.success(fav ? "Removed from favorites" : "Saved to favorites");
              }}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground/70 shadow-sm backdrop-blur transition hover:text-foreground"
            >
              <Heart size={17} className={fav ? "fill-accent text-accent" : ""} />
            </button>
          </div>

          {/* Thumbnails BELOW, horizontal */}
          <div className="mt-3 flex gap-2.5">
            {product.images.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setImg(i)}
                aria-label={`View image ${i + 1}`}
                className={`aspect-square w-16 overflow-hidden rounded-lg border-2 transition ${
                  i === img ? "border-foreground" : "border-border hover:border-foreground/40"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
            <button
              aria-label="Play walkthrough video"
              onClick={() => toast("Walkthrough video coming soon")}
              className="relative aspect-square w-16 overflow-hidden rounded-lg border-2 border-border hover:border-foreground/40"
            >
              <img
                src={product.images[0]}
                alt=""
                loading="lazy"
                width={64}
                height={64}
                className="h-full w-full object-cover brightness-[0.55]"
              />
              <Play size={16} className="absolute inset-0 m-auto text-background" />
            </button>
          </div>

          {/* Highlights — slim rows, no boxes */}
          <div className="mt-7 space-y-2.5 border-t border-border pt-6">
            <p className="text-sm font-semibold text-foreground">Highlights</p>
            {[
              { icon: Download, text: "Instant digital download — DEMO + BLANK files" },
              { icon: FileSpreadsheet, text: "Works in Excel (.xlsx) and Google Sheets" },
              {
                icon: Palette,
                text: `${product.colorway_variants.length} colorway${product.colorway_variants.length > 1 ? "s" : ""}: ${product.colorway_variants.map((c) => c.name).join(", ")}`,
              },
              { icon: BadgeCheck, text: "One-time purchase with lifetime free updates" },
            ].map((h) => (
              <div key={h.text} className="flex items-center gap-3 text-sm text-foreground/85">
                <h.icon size={16} className="shrink-0 text-accent" />
                {h.text}
              </div>
            ))}
          </div>

          {/* Everything else as calm accordions */}
          <Accordion
            type="multiple"
            defaultValue={["details"]}
            className="mt-6 border-t border-border"
          >
            <AccordionItem value="details">
              <AccordionTrigger className="text-[15px] font-semibold hover:no-underline">
                Item details
              </AccordionTrigger>
              <AccordionContent className="space-y-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">{product.description.headline}</p>
                {product.description.sections.map((s) => (
                  <div key={s.title}>
                    <p className="mb-2 font-semibold text-foreground">{s.title}</p>
                    <ul className="space-y-1.5">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {product.perfect_for && (
                  <div>
                    <p className="mb-2 font-semibold text-foreground">Perfect for</p>
                    <ul className="space-y-1.5">
                      {product.perfect_for.map((p) => (
                        <li key={p} className="flex gap-2">
                          <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="included">
              <AccordionTrigger className="text-[15px] font-semibold hover:no-underline">
                What's included
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                  {included.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger className="text-[15px] font-semibold hover:no-underline">
                Delivery &amp; getting started
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <ol className="space-y-1.5">
                  {howItWorks.map((step, i) => (
                    <li key={step} className="flex gap-2.5">
                      <span className="font-semibold text-foreground">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="space-y-1 border-t border-border pt-3 text-xs">
                  {product.description.disclaimers.map((d) => (
                    <p key={d}>{d}</p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {product.faqs && (
              <AccordionItem value="faqs">
                <AccordionTrigger className="text-[15px] font-semibold hover:no-underline">
                  FAQs
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {product.faqs.map((f) => (
                    <div key={f.q}>
                      <p className="text-sm font-semibold text-foreground">{f.q}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Meet your seller — compact */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
              E
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Ledger&amp;Leaf</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Store size={12} /> 62,400+ sales · <Stars rating={5} size={11} /> 4.9
              </p>
            </div>
            <Link
              to="/about"
              hash="contact"
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium hover:border-foreground/40"
            >
              Message
            </Link>
          </div>
        </div>

        {/* ================= RIGHT — compact sticky buy box ================= */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          {/* price leads */}
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-display text-[2rem] font-bold leading-none text-foreground">
              {money(product.sale_price)}
            </span>
            {product.sale_price < product.price && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {money(product.price)}
                </span>
                <span className="text-sm font-semibold text-accent">{off}% off</span>
              </>
            )}
          </div>

          {/* modest title */}
          <h1 className="mt-3 text-[17px] font-medium leading-snug text-foreground">
            {product.hero_title ?? product.name}
          </h1>

          {/* seller + rating line */}
          <a
            href="#reviews"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="font-medium text-foreground">Ledger&amp;Leaf</span>
            <Stars rating={product.rating_avg} size={13} />
            <span>({product.review_count.toLocaleString()})</span>
          </a>

          {/* variant dropdown */}
          {product.colorway_variants.length > 1 && (
            <div className="mt-5">
              <p className="mb-1.5 text-sm font-medium text-foreground">Colorway</p>
              <Select value={colorway} onValueChange={setColorway}>
                <SelectTrigger className="h-11 w-full rounded-lg border-border bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.colorway_variants.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-border"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-5 flex flex-col gap-2.5">
            <Button
              size="lg"
              onClick={() => addToCart()}
              className="h-12 rounded-full bg-primary text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add to cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-border text-sm"
              onClick={() => buyNow(product.id, colorway)}
            >
              Buy now
            </Button>
          </div>

          {/* slim reassurance rows */}
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Download size={15} className="text-accent" /> Instant download — link on the
              confirmation page &amp; emailed
            </p>
            <p className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-accent" /> One-time purchase · no subscription
            </p>
          </div>

          {/* favorite / share — quiet text actions */}
          <div className="mt-4 flex gap-5 text-sm">
            <button
              type="button"
              onClick={() => {
                setFav((v) => !v);
                toast.success(fav ? "Removed from favorites" : "Saved to favorites");
              }}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Heart size={15} className={fav ? "fill-accent text-accent" : ""} />
              {fav ? "Saved" : "Add to favorites"}
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Share2 size={15} /> Share
            </button>
          </div>

          {/* bundle nudge — slim */}
          {product.bundle_callout && (
            <Link
              to="/product/$slug"
              params={{ slug: product.bundle_callout.slug }}
              className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/8 px-4 py-3 text-sm transition-colors hover:border-accent"
            >
              <span className="font-medium text-foreground">{product.bundle_callout.text}</span>
              <ArrowRight size={16} className="shrink-0 text-accent" />
            </Link>
          )}

          {/* frequently bought together — compact rows */}
          {alsoBought.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">Frequently bought together</p>
              <div className="mt-3 space-y-2.5">
                {alsoBought.map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-secondary"
                  >
                    <img
                      src={p.images[0]}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg border border-border object-cover"
                    />
                    <span className="flex-1 text-sm leading-snug text-foreground">{p.name}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {money(p.sale_price)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= Reviews ================= */}
      <section id="reviews" className="mt-16 scroll-mt-24 border-t border-border pt-10">
        <h2 className="font-display text-2xl">Reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="h-fit rounded-xl border border-border bg-card p-6">
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
                <li key={r.id} className="rounded-xl border border-border bg-card p-5">
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

      {/* ================= Related ================= */}
      <section className="mt-16">
        <h2 className="font-display text-2xl">You may also like</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
