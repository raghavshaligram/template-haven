import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, Youtube } from "lucide-react";
import founderImg from "@/assets/founder.jpg";
import { Newsletter } from "@/components/site/Newsletter";
import { products } from "@/data/shop";
import { fetchStats } from "@/lib/stats";

export const Route = createFileRoute("/about")({
  loader: async () => fetchStats(),
  head: () => ({
    meta: [
      { title: "About ReadyTrackers — Our Story" },
      {
        name: "description",
        content: "How a late-night budget spreadsheet became a shop of calm, beautiful templates.",
      },
      { property: "og:title", content: "About ReadyTrackers — Our Story" },
      {
        property: "og:description",
        content:
          "From one overdraft fee to a shop of templates we use ourselves. Here's the story.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { site } = Route.useLoaderData();

  const statTiles = [
    { stat: `${products.length}`, label: "Templates in the shop today" },
    { stat: `${site.totalReviews.toLocaleString()}`, label: "Verified customer reviews" },
    site.totalReviews > 0
      ? { stat: `${site.ratingAvg} / 5`, label: "Average rating across every template" }
      : { stat: "New", label: "Shop — templates added regularly" },
  ];

  return (
    <div className="container-page py-14">
      <section className="grid items-center gap-12 md:grid-cols-[1fr_0.8fr]">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">
            Built at a kitchen table, on purpose.
          </h1>
          <p className="mt-6 text-muted-foreground">
            In 2021 I was earning fine and still somehow surprised by my own bank balance. The
            budgeting apps wanted a subscription and my attention every day; I wanted one page that
            told me the truth on a Sunday.
          </p>
          <p className="mt-4 text-muted-foreground">
            So I built it. Then I built a debt tracker, because that was the next honest problem.
            Friends asked for copies, strangers asked next, and ReadyTrackers turned into a shop
            without ever really planning to be one.
          </p>
          <p className="mt-4 text-muted-foreground">
            Today it's a small team of three making templates we personally use. One-time prices, no
            subscriptions, no dark patterns — just tools that stay out of your way.
          </p>
          <p className="mt-6 font-display text-xl text-primary">— Elena, founder</p>
        </div>
        <img
          src={founderImg}
          alt="Elena, founder of ReadyTrackers, at her desk"
          loading="lazy"
          width={1024}
          height={1024}
          className="rounded-3xl shadow-soft"
        />
      </section>

      <section className="mt-16 grid gap-5 sm:grid-cols-3">
        {statTiles.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-8 text-center shadow-soft">
            <p className="font-display text-3xl text-primary">{s.stat}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section id="affiliate" className="mt-16 scroll-mt-24 rounded-3xl bg-secondary p-10">
        <h2 className="font-display text-2xl">Affiliate program</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Earn 30% on every sale you refer, with a 60-day cookie window and monthly payouts. Ideal
          for finance creators, planner communities and productivity newsletters.
        </p>
        <div className="mt-6 max-w-md">
          <Newsletter compact subscriberCount={site.subscriberCount} />
        </div>
      </section>

      <section id="contact" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl">Say hello</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Questions about a template, a bulk licence or a collaboration? We answer within one
          business day.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <a
            href="mailto:hello@example.com"
            className="inline-flex items-center gap-2 hover:text-primary"
          >
            <Mail size={16} /> hello@example.com
          </a>
          <a href="#" className="inline-flex items-center gap-2 hover:text-primary">
            <Instagram size={16} /> Instagram
          </a>
          <a href="#" className="inline-flex items-center gap-2 hover:text-primary">
            <Youtube size={16} /> YouTube
          </a>
          <a href="#" className="hover:text-primary">
            Pinterest
          </a>
          <a href="#" className="hover:text-primary">
            TikTok
          </a>
        </div>
      </section>
    </div>
  );
}
