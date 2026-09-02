import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/site/Stars";
import { useCart } from "@/lib/cart";
import { useQuickView } from "@/lib/quick-view";
import { discountPct, money, type Product } from "@/data/shop";
import { fetchStats } from "@/lib/stats";

/**
 * A short, grid-friendly preview of a product — image, price, colorway,
 * Add to cart / Buy now — so someone browsing a listing page never has to
 * open the full product page just to buy. Mounted once in __root.tsx,
 * opened from any ProductCard via useQuickView().open(product).
 */
export function QuickViewModal() {
  const { product, close } = useQuickView();
  const { add, openCart, buyNow } = useCart();

  // Keep rendering the last product while the dialog's close animation
  // plays — useQuickView().product goes null immediately on close, but
  // Dialog's open={false} transition still needs something to show.
  const [displayProduct, setDisplayProduct] = useState<Product | null>(null);
  const [colorway, setColorway] = useState("");
  const [img, setImg] = useState(0);
  // Real numbers only, fetched live for whichever product is open — this
  // modal has no SSR loader of its own, so it asks product-stats directly
  // rather than ever falling back to a hardcoded rating/review/bestseller
  // value. Defaults to the honest zero/false state until the fetch resolves.
  const [liveStats, setLiveStats] = useState({ reviewCount: 0, ratingAvg: 0, bestSeller: false });

  useEffect(() => {
    if (product) {
      setDisplayProduct(product);
      setColorway(product.colorway_variants[0]?.name ?? "");
      setImg(0);
      setLiveStats({ reviewCount: 0, ratingAvg: 0, bestSeller: false });
      let cancelled = false;
      fetchStats({ slug: product.slug }).then((s) => {
        if (cancelled) return;
        const stat = s.products[product.slug];
        setLiveStats({
          reviewCount: stat?.reviewCount ?? 0,
          ratingAvg: stat?.ratingAvg ?? 0,
          bestSeller: s.site.bestSellerSlugs.includes(product.slug),
        });
      });
      return () => {
        cancelled = true;
      };
    }
    return undefined;
  }, [product]);

  const p = displayProduct;
  if (!p) return null;

  const off = discountPct(p);

  function handleAddToCart() {
    add(p!.id, colorway);
    close();
    openCart();
  }

  function handleBuyNow() {
    buyNow(p!.id, colorway);
    close();
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="grid gap-0 sm:grid-cols-2">
          {/* Gallery */}
          <div className="bg-secondary/40 p-5 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <img
                src={p.images[img]}
                alt={p.name}
                width={640}
                height={640}
                className="aspect-square w-full object-cover"
              />
            </div>
            {p.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {p.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImg(i)}
                    className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === img ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col p-5 sm:p-6">
            {liveStats.bestSeller && (
              <span className="w-fit rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                Bestseller
              </span>
            )}
            <h2 className="mt-2 font-display text-xl leading-snug">{p.name}</h2>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {liveStats.reviewCount > 0 ? (
                <>
                  <Stars rating={liveStats.ratingAvg} size={13} />
                  <span className="tabular-nums">{liveStats.ratingAvg.toFixed(1)}</span>
                  <span>({liveStats.reviewCount.toLocaleString()})</span>
                </>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{money(p.sale_price)}</span>
              {p.sale_price < p.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {money(p.price)}
                  </span>
                  {off > 0 && (
                    <span className="text-xs font-semibold text-accent">Save {off}%</span>
                  )}
                </>
              )}
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>

            {p.colorway_variants.length > 1 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-medium text-foreground">
                  Colorway: <span className="text-muted-foreground">{colorway}</span>
                </p>
                <div className="flex items-center gap-2">
                  {p.colorway_variants.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => setColorway(c.name)}
                      className="grid h-7 w-7 place-items-center rounded-full border-2 transition-colors"
                      style={{
                        borderColor: colorway === c.name ? "var(--primary)" : "transparent",
                      }}
                    >
                      <span
                        className="grid h-5 w-5 place-items-center rounded-full border border-border/80"
                        style={{ backgroundColor: c.hex }}
                      >
                        {colorway === c.name && (
                          <Check
                            size={11}
                            className={c.hex === "#FFFFFF" ? "text-foreground" : "text-white"}
                          />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2.5">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Add to cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                className="h-10 rounded-full border-border text-sm"
              >
                Buy now
              </Button>
            </div>

            <Link
              to="/product/$slug"
              params={{ slug: p.slug }}
              onClick={close}
              className="mt-4 text-center text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
