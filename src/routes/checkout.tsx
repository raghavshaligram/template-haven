import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/data/shop";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { buy?: string; colorway?: string } => {
    const out: { buy?: string; colorway?: string } = {};
    if (typeof search["buy"] === "string") out.buy = search["buy"];
    if (typeof search["colorway"] === "string") out.colorway = search["colorway"];
    return out;
  },
  head: () => ({
    meta: [{ title: "ReadyTrackers" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutRedirect,
});

/**
 * This standalone page predates the cart drawer — checkout has lived
 * entirely inside the drawer (see CartDrawer.tsx) since that feature
 * shipped, and nothing in the app links here anymore. Kept only as a
 * redirect for any stale bookmark/link: it opens the same drawer instead
 * of rendering its own disconnected checkout UI, which could otherwise
 * end up mounted *alongside* the drawer (two separate PayPalCheckoutButton
 * instances at once) and confuse an already-confusing situation further.
 */
function CheckoutRedirect() {
  const { buy, colorway } = Route.useSearch();
  const { buyNow, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const product = buy ? getProduct(buy) : undefined;
    if (product) {
      buyNow(product.id, colorway ?? product.colorway_variants[0]?.name ?? "Light");
    } else {
      openCart();
    }
    navigate({ to: "/", replace: true });
    // Only ever run once, on arrival — buyNow/openCart/navigate identity
    // doesn't matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
