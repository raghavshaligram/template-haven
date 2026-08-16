import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { money } from "@/data/shop";
import { PayPalCheckoutButton } from "@/components/site/PayPalCheckoutButton";
import type { CheckoutItem } from "@/lib/checkout";

/**
 * The site-wide cart drawer: slides out on "Add to cart" / "Buy now" /
 * clicking the header cart icon, and doubles as one-step checkout — the
 * PayPal button renders right here, so paying never requires navigating to
 * a separate cart or checkout page first.
 */
export function CartDrawer() {
  const { drawerOpen, closeCart, checkoutDetailed, isBuyNow, setQty, remove } = useCart();

  const items: CheckoutItem[] = checkoutDetailed.map(({ line, product }) => ({
    slug: product.slug,
    colorway: line.colorway,
    qty: line.qty,
  }));
  const subtotal = checkoutDetailed.reduce(
    (n, { line, product }) => n + product.sale_price * line.qty,
    0,
  );

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display">{isBuyNow ? "Checkout" : "Your cart"}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5">
            {checkoutDetailed.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            ) : (
              <ul className="space-y-4">
                {checkoutDetailed.map(({ line, product }) => (
                  <li key={`${line.productId}-${line.colorway}`} className="flex gap-3">
                    <img
                      src={product.images[0]}
                      alt=""
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{line.colorway}</p>
                      {isBuyNow ? (
                        <p className="mt-1 text-xs text-muted-foreground">Qty {line.qty}</p>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQty(line.productId, line.colorway, line.qty - 1)}
                            className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-sm">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(line.productId, line.colorway, line.qty + 1)}
                            className="grid h-6 w-6 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(line.productId, line.colorway)}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                            aria-label="Remove from cart"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {money(product.sale_price * line.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {checkoutDetailed.length > 0 && (
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-primary">{money(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Instant digital download — no physical item shipped.
              </p>

              <div className="mt-1">
                <PayPalCheckoutButton items={items} onApproved={closeCart} />
              </div>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck size={13} className="text-accent" /> Secure checkout via PayPal
              </p>

              {!isBuyNow && (
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="mt-4 block text-center text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Edit cart on a full page
                </Link>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
