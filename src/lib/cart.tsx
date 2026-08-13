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
};

const CartContext = createContext<CartCtx | null>(null);
const KEY = "ledgerleaf-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
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

  const value = useMemo<CartCtx>(() => {
    const detailed = lines
      .map((line) => ({ line, product: getProductById(line.productId) }))
      .filter((x): x is { line: CartLine; product: Product } => Boolean(x.product));

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
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
