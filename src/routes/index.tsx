import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, FileSpreadsheet, Files, PaintBucket, Zap } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { SpreadsheetMock } from "@/components/site/SpreadsheetMock";
import { Stars } from "@/components/site/Stars";
import { Newsletter } from "@/components/site/Newsletter";
import { Button } from "@/components/ui/button";
import { categories, getProductById, products, reviews } from "@/data/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReadyTrackers — Budget & Productivity Spreadsheet Templates" },
      {
        name: "description",
        content:
          "Spreadsheet templates that do the work for you — budgeting, debt payoff, business and planning tools for Excel & Google Sheets. Instant download.",
      },
      { property: "og:title", content: "ReadyTrackers — Spreadsheets That Do The Typing For You" },
      {
        property: "og:description",
        content: "Budget, debt, business and planning templates for Excel and Google Sheets.",
      },
    ],
  }),
  component: Home,
});

const STATS = [
  { value: "62,400+", label: "templates downloaded" },
  { value: "4.9", label: "average rating" },
  { value: "8", label: "templates & bundles" },
  { value: "0", label: "formulas you'll ever write" },
];

function Home() {
  const catalog = products.slice(0, 8);
  const featuredReviews = reviews.filter((r) => r.rating === 5).slice(0, 3);
  const countFor = (slug: string) => products.filter((p) => p.category === slug).length;

  return (
    <div>
      {/* ============ HERO — shop-wide, product-first ============ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(55%_45%_at_50%_0%,oklch(0.63_0.15_157/0.13),transparent_70%)]"
        />
        <div className="container-page relative pb-6 pt-14 text-center md:pt-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
            <Zap size={13} className="text-accent" />
            Excel & Google Sheets · Instant download · One-time purchase
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[2.7rem] leading-[1.04] md:text-[4rem]">
            Spreadsheets that do
            <br />
            <span className="text-accent">the work for you.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Budgeting, debt payoff, business and planning templates with every formula pre-built.
            Open the file, type in the blue cells, watch the dashboards update themselves.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-accent px-8 text-[15px] font-semibold text-accent-foreground hover:bg-accent/90"
            >
              <Link to="/collections/$slug" params={{ slug: "best-sellers" }}>
                Shop all templates <ArrowRight size={16} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-border bg-card px-8 text-[15px]"
            >
              <Link to="/collections/$slug" params={{ slug: "freebies" }}>
                Try one free
              </Link>
            </Button>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Stars rating={5} size={14} />
            <span className="font-semibold text-foreground">4.9</span>
            <span>from 12,000+ reviews</span>
          </div>

          {/* generic dashboard mockup — what every template's dashboard feels like */}
          <div className="relative mx-auto mt-12 max-w-4xl">
            <div
              aria-hidden
              className="absolute -inset-x-8 bottom-0 top-16 rounded-[2rem] bg-[radial-gradient(70%_60%_at_50%_30%,oklch(0.63_0.15_157/0.16),transparent_75%)] blur-2xl"
            />
            <div className="relative">
              <SpreadsheetMock />
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="border-y border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-foreground md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY ============ */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl md:text-4xl">Shop by category</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const n = countFor(c.slug);
            return (
              <Link
                key={c.slug}
                to={c.slug === "plr" ? "/plr" : "/collections/$slug"}
                params={{ slug: c.slug }}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
              >
                <div>
                  <h3 className="font-display text-lg">{c.name}</h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                  {n > 0 && (
                    <p className="mt-3 text-xs font-semibold text-accent">
                      {n} template{n > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                  <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ ALL TEMPLATES — equal billing ============ */}
      <section className="container-page pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">The templates</h2>
            <p className="mt-2 text-muted-foreground">
              Every one ships as Excel + Google Sheets, with a filled-in DEMO file.
            </p>
          </div>
          <Link
            to="/collections/$slug"
            params={{ slug: "best-sellers" }}
            className="shrink-0 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            Best sellers →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {catalog.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ============ EVERY TEMPLATE INCLUDES ============ */}
      <section className="container-page pb-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl">Every template includes</h2>
          <p className="mt-3 text-muted-foreground">
            The same standards across the whole shop — whichever template you pick.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Wide tile: pre-built formulas */}
          <div className="rounded-3xl border border-border bg-card p-7 md:col-span-2 md:p-9">
            <div className="flex items-center gap-2 text-accent">
              <Zap size={18} />
              <span className="text-sm font-semibold">Zero formulas to write</span>
            </div>
            <h3 className="mt-3 font-display text-2xl">Type in the blue cells — done</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Every calculation is pre-built and colour-coded: blue cells are yours, grey cells are
              formulas. Dashboards, charts and totals update themselves.
            </p>
            <div className="mt-7 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
              <div className="space-y-2 rounded-xl border border-border bg-secondary/50 p-3.5">
                {[
                  ["Groceries", "$384"],
                  ["Transport", "$185"],
                  ["Dining", "$96"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="rounded-md border border-accent/40 bg-accent/8 px-2.5 py-1 font-semibold text-foreground">
                      {v}
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-[10px] text-muted-foreground">You type these ↑</p>
              </div>
              <ArrowRight size={20} className="mx-auto hidden text-accent sm:block" />
              <div className="rounded-xl border border-border bg-secondary/50 p-3.5">
                <div className="flex h-16 items-end gap-1.5">
                  {[55, 30, 75, 45, 90, 60].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`flex-1 rounded-t-sm ${i === 4 ? "bg-accent" : "bg-primary/15"}`}
                    />
                  ))}
                </div>
                <p className="pt-2 text-[10px] text-muted-foreground">The sheet builds these ↑</p>
              </div>
            </div>
          </div>

          {/* Excel + Sheets */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-center gap-2 text-accent">
              <FileSpreadsheet size={18} />
              <span className="text-sm font-semibold">Both platforms</span>
            </div>
            <h3 className="mt-3 font-display text-xl">Excel + Google Sheets</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              An .xlsx file and a Sheets copy link in every download — same formulas, tested on
              both, mobile-friendly via the Sheets app.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-center text-xs font-semibold text-foreground">
                .xlsx
              </span>
              <span className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-center text-xs font-semibold text-foreground">
                Sheets
              </span>
            </div>
          </div>

          {/* DEMO + BLANK */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-center gap-2 text-accent">
              <Files size={18} />
              <span className="text-sm font-semibold">Two files, not one</span>
            </div>
            <h3 className="mt-3 font-display text-xl">DEMO + BLANK copies</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A filled-in demo so you see it working first, and a clean blank ready for your real
              numbers. No “now what?” moment.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="flex-1 rounded-lg border border-accent/40 bg-accent/8 px-3 py-2.5 text-center text-xs font-semibold text-foreground">
                DEMO · filled
              </span>
              <span className="flex-1 rounded-lg border border-dashed border-border px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">
                BLANK · yours
              </span>
            </div>
          </div>

          {/* One-time */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-center gap-2 text-accent">
              <BadgeCheck size={18} />
              <span className="text-sm font-semibold">Yours forever</span>
            </div>
            <h3 className="mt-3 font-display text-xl">One-time purchase</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No subscription, no account, no lock-in — and lifetime free updates to the template
              you bought.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground">
                Pay once
              </span>
              <span className="rounded-lg border border-border px-3 py-2 font-medium text-muted-foreground line-through">
                $9.99/mo
              </span>
            </div>
          </div>

          {/* Colorways */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-center gap-2 text-accent">
              <PaintBucket size={18} />
              <span className="text-sm font-semibold">Your look</span>
            </div>
            <h3 className="mt-3 font-display text-xl">Multiple colorways</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Most templates come in Light, Dark and Sage — pick the one you'll actually enjoy
              opening every week.
            </p>
            <div className="mt-6 flex gap-2.5">
              {["#F3EFE6", "#2B2B2B", "#2D5F4F"].map((hex) => (
                <span
                  key={hex}
                  className="h-8 w-8 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ DARK REVIEWS SECTION ============ */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_2fr]">
            <div>
              <p className="font-display text-6xl font-semibold">4.9</p>
              <Stars rating={5} size={18} className="mt-2" />
              <p className="mt-3 text-sm text-primary-foreground/70">
                12,000+ reviews across all templates
              </p>
              <p className="mt-8 border-l-2 border-accent pl-4 text-sm leading-relaxed text-primary-foreground/80">
                "Everything in the shop is something I use myself. If a tab doesn't earn its place,
                it doesn't ship." <span className="mt-1 block font-semibold">— Elena, founder</span>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {featuredReviews.map((r) => {
                const prod = getProductById(r.product_id);
                return (
                  <figure
                    key={r.id}
                    className="flex flex-col rounded-2xl bg-primary-foreground/[0.06] p-6 backdrop-blur"
                  >
                    <Stars rating={r.rating} size={14} />
                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-primary-foreground/90">
                      "{r.text}"
                    </blockquote>
                    <figcaption className="mt-4 text-xs text-primary-foreground/60">
                      <span className="font-semibold text-primary-foreground/90">
                        {r.reviewer_name}
                      </span>
                      {prod && <span> · {prod.name}</span>}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl md:text-4xl">One free template, no strings</h2>
          <p className="mt-3 text-muted-foreground">
            Subscribe and we'll send the Monthly Expense Tracker plus 15% off your first order.
          </p>
          <div className="mx-auto mt-7 max-w-md">
            <Newsletter compact />
          </div>
        </div>
      </section>
    </div>
  );
}
