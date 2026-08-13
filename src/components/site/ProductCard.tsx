import { Link } from "@tanstack/react-router";
import { Stars } from "./Stars";
import { discountPct, money, type Product } from "@/data/shop";

export function ProductCard({ product }: { product: Product }) {
  const hover = product.images[1] ?? product.images[0];
  const off = discountPct(product);

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block rounded-2xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        <img
          src={hover}
          alt=""
          aria-hidden
          loading="lazy"
          width={1024}
          height={1024}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
            {off}% off
          </span>
        )}
        {product.sale_price === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
            Free
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-display text-base leading-snug text-foreground">{product.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Stars rating={product.rating_avg} size={13} />
          <span>({product.review_count.toLocaleString()})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-primary">{money(product.sale_price)}</span>
          {product.sale_price < product.price && (
            <span className="text-sm text-muted-foreground line-through">{money(product.price)}</span>
          )}
        </div>
        {product.colorway_variants.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.colorway_variants.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
