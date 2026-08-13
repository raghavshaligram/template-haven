import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Download, Sparkles, Star } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import founderImg from "@/assets/founder.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { Stars } from "@/components/site/Stars";
import { Newsletter } from "@/components/site/Newsletter";
import { Button } from "@/components/ui/button";
import { bestSellers, categories, getProductById, products, reviews } from "@/data/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledger&Leaf — Budget & Productivity Spreadsheet Templates" },
      {
        name: "description",
        content:
          "Beautiful Excel and Google Sheets templates for budgeting, debt payoff and planning. One-time purchase, instant download.",
      },
      {
        property: "og:title",
        content: "Ledger&Leaf — Spreadsheet Templates That Actually Get Used",
      },
      {
        property: "og:description",
        content:
          "Budget, debt and planning templates for Excel and Google Sheets. Instant digital download.",
      },
    ],
  }),
  component: Home,
});

const CHIPS = [
  { label: "Best Sellers", slug: "best-sellers" },
  { label: "Personal Finance", slug: "personal-finance" },
  { label: "Business Tools", slug: "business-tools" },
  { label: "Organization", slug: "organization" },
  { label: "Bundles", slug: "bundles" },
  { label: "Free", slug: "freebies" },
];

function Home() {
  const featured = (() => {
    const bs = bestSellers();
    const seen = new Set(bs.map((p) => p.id));
    const fill = products.filter((p) => !seen.has(p.id) && !p.is_plr);
    return [...bs, ...fill].slice(0, 8);
  })();

  const featuredReviews = reviews.filter((r) => r.rating === 5).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary-soft/50 to-background">
        <div className="container-page grid items-center gap-10 py-14 md:grid-cols-[1.05fr_1fr] md:py-20">
          <div>
            <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
              <Sparkles size={13} className="text-accent" />
              Excel + Google Sheets templates
            </span>
            <h1 className="font-display text-[2.6rem] leading-[1.05] text-foreground md:text-[3.9rem]">
              Money tools that are calm, beautiful and easy to keep using.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Pre-built spreadsheet templates for budgeting, debt payoff and everyday planning — the
              system is already done before you sit down.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-accent px-8 text-[15px] font-semibold text-accent-foreground shadow-card hover:bg-accent/90"
              >
                <Link to="/collections/$slug" params={{ slug: "best-sellers" }}>
                  Shop best sellers
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-border bg-card px-8 text-[15px]"
              >
                <Link to="/collections/$slug" params={{ slug: "freebies" }}>
                  Start with a freebie
                </Link>
              </Button>
            </div>

            {/* social proof */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex -space-x-2">
                {["#2D5F4F", "#E8A94A", "#7C9885", "#C6743E", "#4B6A5A"].map((c, i) => (
                  <span
                    key={i}
                    className="grid h-8 w-8 place-items-center rounded-full border-2 border-background text-[11px] font-semibold text-white"
                    style={{ backgroundColor: c }}
                  >
                    {["M", "T", "G", "J", "S"][i]}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1.5">
                  <Stars rating={5} size={15} />
                  <span className="font-semibold text-foreground">4.9</span>
                </div>
                <p className="text-muted-foreground">Loved by 62,400+ planners</p>
              </div>
            </div>
          </div>

          {/* hero image with floating rating card */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/60 shadow-lift">
              <img
                src={heroImg}
                alt="Desk flat lay with a laptop showing a budget spreadsheet"
                width={1536}
                height={1024}
                className="product-media aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-3 hidden items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 pr-4 shadow-lift backdrop-blur sm:flex">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Star size={18} className="fill-accent text-accent" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">Instant download</p>
                <p className="text-xs text-muted-foreground">Files in your inbox in seconds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-b border-border/60 bg-card">
        <div className="container-page flex items-center gap-2.5 overflow-x-auto py-4">
          <span className="mr-1 hidden shrink-0 text-sm font-medium text-muted-foreground sm:block">
            Browse:
          </span>
          {CHIPS.map((c) => (
            <Link
              key={c.slug}
              to={c.slug === "plr" ? "/plr" : "/collections/$slug"}
              params={{ slug: c.slug }}
              className="shrink-0 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-background">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Clock, title: "Save time", text: "Pre-built and ready in minutes." },
            { icon: Download, title: "Instant download", text: "Yours the moment you buy." },
            { icon: Sparkles, title: "One-time purchase", text: "No subscriptions, ever." },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <b.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular templates */}
      <section className="container-page py-12">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Popular right now</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The templates our customers reach for first.
            </p>
          </div>
          <Link
            to="/collections/$slug"
            params={{ slug: "best-sellers" }}
            className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-6">
        <h2 className="mb-7 font-display text-3xl">Shop by collection</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c) => c.slug !== "freebies")
            .map((c) => (
              <Link
                key={c.slug}
                to={c.slug === "plr" ? "/plr" : "/collections/$slug"}
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="product-media h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-background">
                  <div>
                    <h3 className="font-display text-xl text-background">{c.name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-background/85">
                      {c.description}
                    </p>
                  </div>
                  <span className="shrink-0 translate-x-0 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground transition-transform group-hover:translate-x-0.5">
                    Shop →
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-6 border-y border-border/60 bg-secondary/50">
        <div className="container-page py-14">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl">Loved by 62,400+ planners</h2>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Stars rating={5} size={16} />
              <span className="font-semibold text-foreground">4.9</span>
              <span>average from 12,000+ reviews</span>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredReviews.map((r) => {
              const prod = getProductById(r.product_id);
              return (
                <figure
                  key={r.id}
                  className="flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-card"
                >
                  <Stars rating={r.rating} size={15} />
                  <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/90">
                    “{r.text}”
                  </blockquote>
                  <figcaption className="mt-4 border-t border-border/60 pt-4 text-sm">
                    <span className="font-semibold text-foreground">{r.reviewer_name}</span>
                    {prod && <span className="text-muted-foreground"> · {prod.name}</span>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="container-page grid items-center gap-10 py-16 md:grid-cols-[0.75fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-secondary shadow-soft">
          <img
            src={founderImg}
            alt="Ledger&Leaf founder at her desk"
            width={1024}
            height={1024}
            className="product-media aspect-[4/5] w-full object-cover"
          />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Made by someone who uses it
          </span>
          <h2 className="mt-2 font-display text-3xl">Hi, I'm Elena</h2>
          <p className="mt-4 text-muted-foreground">
            I built the first version of this budget sheet for myself, on a Tuesday night, after a
            third overdraft fee I could not explain. It wasn't clever — it was just clear. A friend
            asked for a copy, then her sister did, and here we are.
          </p>
          <p className="mt-4 text-muted-foreground">
            Everything in the shop is something I use myself. If a tab doesn't earn its place, it
            doesn't ship.
          </p>
          <p className="mt-6 font-display text-xl text-primary">— Elena</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground md:py-14">
          <h2 className="font-display text-3xl text-primary-foreground">
            One free template, no strings
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
            Subscribe and we'll send the Monthly Expense Tracker plus 15% off your first order.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <Newsletter compact />
          </div>
        </div>
      </section>
    </div>
  );
}
