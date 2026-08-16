import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/shop";

type QuickViewCtx = {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
};

const QuickViewContext = createContext<QuickViewCtx | null>(null);

/**
 * One quick-view modal for the whole site, driven by context — the same
 * shape as CartProvider/CartDrawer. ProductCard instances (there can be
 * dozens on a single grid page) just call open(product) rather than each
 * owning its own Dialog, so there's a single portal/mount regardless of
 * how many cards are on screen.
 */
export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const value = useMemo<QuickViewCtx>(
    () => ({
      product,
      open: (p) => setProduct(p),
      close: () => setProduct(null),
    }),
    [product],
  );

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used inside QuickViewProvider");
  return ctx;
}
