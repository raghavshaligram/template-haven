import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Stars } from "./Stars";
import { discountPct, money, type Product } from "@/data/shop";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const hover = product.images[1] ?? product.images[0];
  const off = discountPct(product);
  const [saved, setSaved] = useState(false);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="product-media h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-0"
        />
        <img
          src={hover}
          alt=""
          aria-hidden
          loading="lazy"
          width={1024}
          height={1024}
          className="product-media absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {/* unifying wash so every product photo reads as one cohesive set */}
        <span className="product-wash" aria-hidden />

        {/* badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {product.best_seller && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-sm">
              Bestseller
            </span>
          )}
          {product.sale_price === 0 ? (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-background shadow-sm">
              Free
            </span>
          ) : (
            off > 0 && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground shadow-sm">
                {off}% off
              </span>
            )
          )}
        </div>

        {/* wishlist */}
        <button
          type="button"
          aria-label={saved ? "Remove from saved" : "Save for later"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSaved((v) => !v);
          }}
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-background/85 text-foreground/70 opacity-0 shadow-sm backdrop-blur transition-all duration-200 hover:text-primary group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Heart size={16} className={cn(saved && "fill-accent text-accent")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stars rating={product.rating_avg} size={12} />
          <span className="tabular-nums">{product.rating_avg.toFixed(1)}</span>
          <span className="text-muted-foreground/70">
            ({product.review_count.toLocaleString()})
          </span>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <span className="text-[15px] font-bold text-foreground">{money(product.sale_price)}</span>
          {product.sale_price < product.price && (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {money(product.price)}
              </span>
              {off > 0 && (
                <span className="text-[11px] font-semibold text-primary">Save {off}%</span>
              )}
            </>
          )}
        </div>
        {product.colorway_variants.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1.5">
            {product.colorway_variants.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full border border-border/80 shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="ml-0.5 text-[11px] text-muted-foreground">
              {product.colorway_variants.length} colors
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
