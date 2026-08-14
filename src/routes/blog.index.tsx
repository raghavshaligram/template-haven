import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { clusters, posts } from "@/data/blog";
import { coverArt } from "@/lib/blog-covers";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "The Ledger — budgeting guides & spreadsheet how-tos | Ledger&Leaf" },
      {
        name: "description",
        content:
          "Practical guides on budgeting, irregular income, and making spreadsheets do the work — from the makers of the Smart Budget Spreadsheet.",
      },
      { property: "og:title", content: "The Ledger — guides from Ledger&Leaf" },
      {
        property: "og:description",
        content: "Budgeting basics, irregular income systems, and spreadsheet how-tos.",
      },
    ],
  }),
  component: BlogIndex,
});

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BlogIndex() {
  const [active, setActive] = useState<string>("All");
  const shown = active === "All" ? posts : posts.filter((p) => p.cluster === active);
  const [featured, ...rest] = shown;

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground/70">Blog</span>
      </nav>

      <header className="max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl">The Ledger</h1>
        <p className="mt-3 text-muted-foreground md:text-lg">
          Practical guides on budgeting, irregular income, and making spreadsheets do the work — no
          jargon, no 40-minute reads.
        </p>
      </header>

      {/* Cluster chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        {["All", ...clusters].map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/75 hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured post */}
      {featured && (
        <Link
          to="/blog/$slug"
          params={{ slug: featured.slug }}
          className="group mt-8 grid overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover lg:grid-cols-[1fr_1.1fr]"
        >
          <div className="relative overflow-hidden bg-secondary/40">
            <img
              src={coverArt[featured.cover]}
              alt=""
              className="h-full max-h-80 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] lg:max-h-none"
            />
          </div>
          <div className="flex flex-col justify-center p-7 md:p-10">
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded-full bg-accent/12 px-2.5 py-1 font-semibold text-accent">
                {featured.cluster}
              </span>
              <span className="text-muted-foreground">{fmtDate(featured.date)}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock size={12} /> {featured.reading_minutes} min read
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl leading-snug md:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
              Read the guide <ArrowRight size={15} />
            </span>
          </div>
        </Link>
      )}

      {/* Post grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link
            key={p.slug}
            to="/blog/$slug"
            params={{ slug: p.slug }}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-secondary/40">
              <img
                src={coverArt[p.cover]}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="rounded-full bg-accent/12 px-2 py-0.5 font-semibold text-accent">
                  {p.cluster}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock size={11} /> {p.reading_minutes} min
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg leading-snug">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <span className="mt-auto pt-4 text-xs text-muted-foreground">{fmtDate(p.date)}</span>
            </div>
          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="mt-10 text-muted-foreground">No posts in this cluster yet — soon.</p>
      )}
    </div>
  );
}
