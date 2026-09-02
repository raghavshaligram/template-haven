import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Palette, Store } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { money, products } from "@/data/shop";
import { fetchStats } from "@/lib/stats";

const plrSlugs = products.filter((p) => p.is_plr).map((p) => p.slug);

export const Route = createFileRoute("/plr")({
  loader: async () => fetchStats({ slugs: plrSlugs }),
  head: () => ({
    meta: [
      { title: "PLR Templates with Resell Rights — ReadyTrackers" },
      {
        name: "description",
        content:
          "Buy already-designed, proven spreadsheet templates with full commercial resell rights. Rebrand and sell them as your own.",
      },
      { property: "og:title", content: "PLR Templates with Resell Rights — ReadyTrackers" },
      {
        property: "og:description",
        content: "Download, customize with your branding, resell it as your own product.",
      },
    ],
  }),
  component: Plr,
});

function Plr() {
  const { site, products: liveProductStats } = Route.useLoaderData();
  const plrProducts = products.filter((p) => p.is_plr);
  const flagship = plrProducts[0];

  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container-page py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">Private Label Rights</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl leading-tight text-primary-foreground md:text-5xl">
            Already-designed, proven products — with resell rights included.
          </h1>
          <p className="mx-auto mt-5 max-w-xl opacity-85">
            Skip the design work entirely. Take our best-selling source files, put your brand on
            them, and sell them in your own shop at your own price.
          </p>
          {flagship && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="font-display text-3xl text-accent">
                {money(flagship.sale_price)}{" "}
                <span className="text-base text-primary-foreground/60 line-through">
                  {money(flagship.price)}
                </span>
              </p>
              <p className="text-xs opacity-70">
                One-time licence fee — priced above retail because you keep 100% of what you resell.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-2 rounded-full bg-accent px-8 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/product/$slug" params={{ slug: flagship.slug }}>
                  See what's inside <ArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="container-page grid gap-8 py-16 sm:grid-cols-3">
        {[
          {
            icon: Store,
            title: "1. Download",
            text: "Get the unlocked Excel and Google Sheets source files.",
          },
          {
            icon: Palette,
            title: "2. Customize",
            text: "Swap in your colours, logo, fonts and product name.",
          },
          {
            icon: BadgeCheck,
            title: "3. Resell",
            text: "List it as your own — no royalties, no revenue share.",
          },
        ].map((s) => (
          <div key={s.title} className="rounded-2xl bg-card p-6 shadow-soft">
            <s.icon className="text-primary" size={24} />
            <h2 className="mt-4 font-display text-lg">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </section>

      <section className="container-page pb-20">
        <h2 className="mb-6 font-display text-2xl">PLR licences</h2>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {plrProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              bestSeller={site.bestSellerSlugs.includes(p.slug)}
              reviewCount={liveProductStats[p.slug]?.reviewCount ?? 0}
              ratingAvg={liveProductStats[p.slug]?.ratingAvg ?? 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
