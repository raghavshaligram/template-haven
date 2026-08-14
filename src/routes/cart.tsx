import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { startCheckout } from "@/lib/checkout";
import { money } from "@/data/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Ledger&Leaf" },
      { name: "description", content: "Review your spreadsheet templates and check out securely." },
      { property: "og:title", content: "Your Cart — Ledger&Leaf" },
      { property: "og:description", content: "Review your templates and check out securely." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, setQty, remove, clear } = useCart();

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl">Your cart</h1>

      {detailed.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card p-10 text-center shadow-soft">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button
            asChild
            className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link to="/collections/$slug" params={{ slug: "best-sellers" }}>
              Browse best sellers
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="space-y-4">
            {detailed.map(({ line, product }) => (
              <li
                key={`${line.productId}-${line.colorway}`}
                className="flex gap-4 rounded-2xl bg-card p-4 shadow-soft"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  loading="lazy"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="font-display text-lg hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">Colorway: {line.colorway}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) =>
                        setQty(line.productId, line.colorway, Number(e.target.value))
                      }
                      className="h-9 w-16 rounded-lg border border-input bg-background px-2 text-sm"
                      aria-label="Quantity"
                    />
                    <button
                      onClick={() => remove(line.productId, line.colorway)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-primary">{money(product.sale_price * line.qty)}</p>
              </li>
            ))}
            <li>
              <button
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear cart
              </button>
            </li>
          </ul>

          <aside className="h-fit rounded-2xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{money(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium">Instant download</span>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">{money(subtotal)}</span>
            </div>
            <Button
              className="mt-6 h-12 w-full rounded-full bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
              onClick={() =>
                startCheckout(
                  detailed.map(({ line, product }) => ({
                    slug: product.slug,
                    colorway: line.colorway,
                    qty: line.qty,
                  })),
                )
              }
            >
              Checkout securely
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Instant digital download — no physical item shipped.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
