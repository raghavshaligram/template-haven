import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProductById, type Product } from "@/data/shop";

export type CartLine = { productId: string; colorway: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  add: (productId: string, colorway: string) => void;
  remove: (productId: string, colorway: string) => void;
  setQty: (productId: string, colorway: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: { line: CartLine; product: Product }[];

  // Cart drawer — the one-step checkout UI that slides out on "Add to
  // cart"/"Buy now" instead of navigating to a separate page.
  drawerOpen: boolean;
  /** Opens the drawer showing the persisted cart. */
  openCart: () => void;
  closeCart: () => void;
  /** Opens the drawer for a single-item direct purchase, bypassing (and
   *  not modifying) the persisted cart — the drawer's "Buy now" mode. */
  buyNow: (productId: string, colorway: string) => void;
  /** True while the drawer is showing a buyNow() override rather than the
   *  persisted cart — the drawer uses this to hide qty/remove controls,
   *  since a direct buy is a single fixed line. */
  isBuyNow: boolean;
  /** What the drawer's checkout button should actually purchase: the
   *  buyNow() override line if set, otherwise the full persisted cart. */
  checkoutDetailed: { line: CartLine; product: Product }[];
};

const CartContext = createContext<CartCtx | null>(null);
const KEY = "ledgerleaf-cart";
// sessionStorage (not localStorage) — a "Buy now" is meant to be
// throwaway once the tab closes, unlike the persisted cart. This only
// exists so it survives the *same-tab* full-page reload that Google's
// OAuth redirect causes: someone hits Buy now, decides to sign in first
// from the drawer, and should land back in the same checkout rather than
// having their single-item purchase silently vanish.
const BUY_NOW_KEY = "ledgerleaf-buy-now";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [buyNowLine, setBuyNowLine] = useState<CartLine | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    try {
      const raw = sessionStorage.getItem(BUY_NOW_KEY);
      if (raw) {
        setBuyNowLine(JSON.parse(raw));
        setDrawerOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  useEffect(() => {
    try {
      if (buyNowLine) sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(buyNowLine));
      else sessionStorage.removeItem(BUY_NOW_KEY);
    } catch {
      /* ignore */
    }
  }, [buyNowLine]);

  const value = useMemo<CartCtx>(() => {
    const detailed = lines
      .map((line) => ({ line, product: getProductById(line.productId) }))
      .filter((x): x is { line: CartLine; product: Product } => Boolean(x.product));

    const buyNowProduct = buyNowLine ? getProductById(buyNowLine.productId) : undefined;
    const isBuyNow = Boolean(buyNowLine && buyNowProduct);
    const checkoutDetailed =
      buyNowLine && buyNowProduct ? [{ line: buyNowLine, product: buyNowProduct }] : detailed;

    return {
      lines,
      detailed,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: detailed.reduce((n, d) => n + d.product.sale_price * d.line.qty, 0),
      add: (productId, colorway) =>
        setLines((prev) => {
          const hit = prev.find((l) => l.productId === productId && l.colorway === colorway);
          return hit
            ? prev.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l))
            : [...prev, { productId, colorway, qty: 1 }];
        }),
      remove: (productId, colorway) =>
        setLines((prev) =>
          prev.filter((l) => !(l.productId === productId && l.colorway === colorway)),
        ),
      setQty: (productId, colorway, qty) =>
        setLines((prev) =>
          prev.map((l) =>
            l.productId === productId && l.colorway === colorway
              ? { ...l, qty: Math.max(1, qty) }
              : l,
          ),
        ),
      clear: () => setLines([]),

      drawerOpen,
      isBuyNow,
      checkoutDetailed,
      openCart: () => {
        setBuyNowLine(null);
        setDrawerOpen(true);
      },
      closeCart: () => {
        setDrawerOpen(false);
        setBuyNowLine(null);
      },
      buyNow: (productId, colorway) => {
        setBuyNowLine({ productId, colorway, qty: 1 });
        setDrawerOpen(true);
      },
    };
  }, [lines, drawerOpen, buyNowLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
