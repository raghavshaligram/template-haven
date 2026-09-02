import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, Lightbulb, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Stars } from "@/components/site/Stars";
import { getPost, relatedPosts, type BlogBlock } from "@/data/blog";
import { getProduct, money } from "@/data/shop";
import { coverArt } from "@/lib/blog-covers";
import { fetchStats, type StatsResponse } from "@/lib/stats";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    // Real numbers for any product embedded via a "cta" block — never fall
    // back to a hardcoded rating/review count on this page either.
    const ctaSlugs = post.blocks.filter((b) => b.type === "cta").map((b) => b.slug);
    const stats = await fetchStats({ slugs: ctaSlugs });
    return { title: post.title, meta: post.meta_description, stats };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} | The Tracker` : "The Tracker | ReadyTrackers";
    const description = loaderData?.meta ?? "Budgeting guides from ReadyTrackers.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Block({ block, stats }: { block: BlogBlock; stats: StatsResponse }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-10 font-display text-2xl">{block.text}</h2>;
    case "p":
      return <p className="mt-5 leading-relaxed text-foreground/85">{block.text}</p>;
    case "list":
      return (
        <ul className="mt-5 space-y-2.5">
          {block.items.map((it) => (
            <li key={it} className="flex gap-2.5 leading-relaxed text-foreground/85">
              <Check size={17} className="mt-1 shrink-0 text-accent" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="mt-7 rounded-2xl border border-accent/40 bg-accent/8 p-5">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Lightbulb size={17} className="text-accent" /> {block.title}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{block.text}</p>
        </div>
      );
    case "cta": {
      const prod = getProduct(block.slug);
      if (!prod) return null;
      const stat = stats.products[block.slug];
      const reviewCount = stat?.reviewCount ?? 0;
      const ratingAvg = stat?.ratingAvg ?? 0;
      return (
        <Link
          to="/product/$slug"
          params={{ slug: block.slug }}
          className="group mt-10 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center"
        >
          <img
            src={prod.images[0]}
            alt={prod.name}
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {block.heading}
            </p>
            <p className="mt-1 font-display text-lg">{prod.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{block.text}</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              {reviewCount > 0 ? (
                <>
                  <Stars rating={ratingAvg} size={13} />
                  <span className="text-muted-foreground">
                    {ratingAvg} ({reviewCount.toLocaleString()})
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">No reviews yet</span>
              )}
              <span className="font-bold text-foreground">{money(prod.sale_price)}</span>
            </div>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-1.5 self-start rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors group-hover:bg-accent/90 sm:self-center">
            See the template <ArrowRight size={15} />
          </span>
        </Link>
      );
    }
  }
}

function ArticlePage() {
  const { slug } = Route.useParams();
  const { stats } = Route.useLoaderData();
  const post = getPost(slug)!;
  const related = relatedPosts(post);

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post.title, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "ReadyTrackers" },
    articleSection: post.cluster,
  };

  return (
    <div className="container-page py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden>/</span>
        <Link to="/blog" className="hover:text-foreground">
          Blog
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground/70">{post.cluster}</span>
        <span aria-hidden>/</span>
        <span className="line-clamp-1 text-foreground/70">{post.title}</span>
      </nav>

      <article className="mx-auto max-w-2xl">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-accent/12 px-2.5 py-1 font-semibold text-accent">
            {post.cluster}
          </span>
          <span className="text-muted-foreground">{fmtDate(post.date)}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock size={12} /> {post.reading_minutes} min read
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl leading-tight md:text-[2.6rem]">{post.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>

        {/* Author + share */}
        <div className="mt-6 flex items-center justify-between border-y border-border py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {post.author[0]}
            </span>
            <div className="text-sm">
              <p className="font-semibold text-foreground">{post.author}</p>
              <p className="text-xs text-muted-foreground">Founder, ReadyTrackers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent/50 hover:text-foreground"
          >
            <Share2 size={13} /> Share
          </button>
        </div>

        {/* Cover */}
        <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-secondary/40">
          <img src={coverArt[post.cover]} alt="" className="aspect-[16/9] w-full object-cover" />
        </div>

        {/* Body */}
        <div className="mt-2 text-[16.5px]">
          {post.blocks.map((b, i) => (
            <Block key={i} block={b} stats={stats} />
          ))}
        </div>
      </article>

      {/* Related — same cluster */}
      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl border-t border-border pt-10">
          <h2 className="font-display text-2xl">Keep reading</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <span className="w-fit rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {p.cluster}
                </span>
                <h3 className="mt-3 font-display text-lg leading-snug">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Read <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
