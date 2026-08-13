import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ShieldCheck, Users } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import founderImg from "@/assets/founder.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { Newsletter } from "@/components/site/Newsletter";
import { Button } from "@/components/ui/button";
import { bestSellers, categories, testimonials } from "@/data/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledger&Leaf — Budget & Productivity Spreadsheet Templates" },
      {
        name: "description",
        content:
          "Beautiful Excel and Google Sheets templates for budgeting, debt payoff and planning. One-time purchase, instant download.",
      },
      { property: "og:title", content: "Ledger&Leaf — Spreadsheet Templates That Actually Get Used" },
      {
        property: "og:description",
        content: "Budget, debt and planning templates for Excel and Google Sheets. Instant digital download.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [quote, setQuote] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQuote((q) => (q + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-soft/40">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-card px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              Excel + Google Sheets
            </p>
            <h1 className="font-display text-4xl leading-tight text-foreground md:text-6xl">
              Money tools that are calm, beautiful and genuinely easy to keep using.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Pre-built spreadsheet templates for budgeting, debt payoff and everyday planning — so
              the system is already done before you sit down.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-accent px-8 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/collections/$slug" params={{ slug: "best-sellers" }}>
                  Shop best sellers
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link to="/collections/$slug" params={{ slug: "freebies" }}>
                  Start with a freebie
                </Link>
              </Button>
            </div>
          </div>
          <img
            src={heroImg}
            alt="Sage green desk flat lay with a laptop showing a budget spreadsheet"
            width={1536}
            height={1024}
            className="rounded-3xl shadow-lift"
          />
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-card">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
          {[
            { icon: Clock, title: "Save Time", text: "Pre-built and ready to use in minutes." },
            { icon: ShieldCheck, title: "One-time Purchase", text: "No subscriptions, ever." },
            { icon: Users, title: "Trusted by Thousands", text: "62,400+ people bought our templates." },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <b.icon className="mt-0.5 shrink-0 text-primary" size={22} />
              <div>
                <p className="font-display text-base">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Best sellers</h2>
            <p className="mt-1 text-sm text-muted-foreground">The templates our customers reach for first.</p>
          </div>
          <Link
            to="/collections/$slug"
            params={{ slug: "best-sellers" }}
            className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {bestSellers().map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-8">
        <h2 className="mb-8 font-display text-3xl">Shop by collection</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c) => c.slug !== "freebies")
            .map((c) => (
              <Link
                key={c.slug}
                to={c.slug === "plr" ? "/plr" : "/collections/$slug"}
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-2xl shadow-soft"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/45" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-background">
                  <h3 className="font-display text-xl text-background">{c.name}</h3>
                  <p className="text-xs opacity-90">{c.description}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-primary p-10 text-center text-primary-foreground shadow-lift md:p-14">
          <p className="font-display text-2xl leading-relaxed md:text-3xl">
            “{testimonials[quote].quote}”
          </p>
          <p className="mt-6 text-sm opacity-80">
            {testimonials[quote].name} — {testimonials[quote].role}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                aria-label={`Show quote ${i + 1}`}
                onClick={() => setQuote(i)}
                className={`h-2 rounded-full transition-all ${
                  i === quote ? "w-6 bg-accent" : "w-2 bg-primary-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="container-page grid items-center gap-10 py-8 md:grid-cols-[0.8fr_1fr]">
        <img
          src={founderImg}
          alt="Ledger&Leaf founder at her desk"
          loading="lazy"
          width={1024}
          height={1024}
          className="rounded-3xl shadow-soft"
        />
        <div>
          <h2 className="font-display text-3xl">Hi, I'm Elena</h2>
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
      <section className="container-page py-16">
        <div className="rounded-3xl bg-secondary p-10 text-center">
          <h2 className="font-display text-3xl">One free template, no strings</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
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
