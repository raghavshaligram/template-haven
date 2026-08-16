import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { getProduct, money } from "@/data/shop";
import { PayPalCheckoutButton } from "@/components/site/PayPalCheckoutButton";
import type { CheckoutItem } from "@/lib/checkout";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { buy?: string; colorway?: string } => {
    const out: { buy?: string; colorway?: string } = {};
    if (typeof search["buy"] === "string") out.buy = search["buy"];
    if (typeof search["colorway"] === "string") out.colorway = search["colorway"];
    return out;
  },
  head: () => ({
    meta: [{ title: "Checkout — Ledger&Leaf" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { buy, colorway } = Route.useSearch();
  const { detailed } = useCart();

  // "Buy now" bypasses the persisted cart entirely — a single-item direct
  // purchase, matching how product.$slug.tsx's Buy now button behaves.
  const lines = useMemo(() => {
    if (buy) {
      const product = getProduct(buy);
      if (!product) return [];
      return [
        {
          product,
          colorway: colorway ?? product.colorway_variants[0]?.name ?? "Light",
          qty: 1,
        },
      ];
    }
    return detailed.map(({ line, product }) => ({
      product,
      colorway: line.colorway,
      qty: line.qty,
    }));
  }, [buy, colorway, detailed]);

  const items: CheckoutItem[] = lines.map((l) => ({
    slug: l.product.slug,
    colorway: l.colorway,
    qty: l.qty,
  }));
  const subtotal = lines.reduce((n, l) => n + l.product.sale_price * l.qty, 0);

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-16 text-center">
        <div>
          <h1 className="font-display text-2xl">Nothing to check out</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
          <Link to="/" className="mt-6 inline-block text-sm font-semibold text-accent">
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="order-2 lg:order-1">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm font-semibold text-foreground">Pay with PayPal</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You'll approve payment on PayPal, then land right back here — no account needed.
            </p>
            <PayPalCheckoutButton items={items} />
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck size={14} className="text-accent" /> Secure checkout via PayPal
            </p>
          </div>
        </div>

        <aside className="order-1 rounded-2xl border border-border bg-card p-6 shadow-soft lg:order-2">
          <p className="text-sm font-semibold text-foreground">Order summary</p>
          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={`${l.product.slug}-${l.colorway}`} className="flex items-center gap-3">
                <img
                  src={l.product.images[0]}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg border border-border object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{l.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.colorway} · Qty {l.qty}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {money(l.product.sale_price * l.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">{money(subtotal)}</span>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Instant digital download — no physical item shipped.
          </p>
        </aside>
      </div>
    </div>
  );
}
