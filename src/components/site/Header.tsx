import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { products } from "@/data/shop";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV = [
  { label: "Best Sellers", to: "/collections/$slug", slug: "best-sellers" },
  { label: "Bundles", to: "/collections/$slug", slug: "bundles" },
  { label: "Personal Finance", to: "/collections/$slug", slug: "personal-finance" },
  { label: "Business Tools", to: "/collections/$slug", slug: "business-tools" },
  { label: "Organization", to: "/collections/$slug", slug: "organization" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = q.trim()
    ? products.filter((p) => (p.name + p.tags.join(" ")).toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="font-display text-xl font-semibold tracking-tight text-primary">
            Ledger&amp;Leaf
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.slug}
              to={n.to}
              params={{ slug: n.slug }}
              className="text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/plr"
            className="text-foreground/80 transition-colors hover:text-primary"
            activeProps={{ className: "text-primary font-medium" }}
          >
            PLR
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Search" onClick={() => setSearchOpen(true)}>
            <Search size={19} className="text-foreground/80 hover:text-primary" />
          </button>
          <Link to="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={19} className="text-foreground/80 hover:text-primary" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link to="/account" aria-label="Account">
            <User size={19} className="text-foreground/80 hover:text-primary" />
          </Link>
        </div>
      </div>

      {open && (
        <nav className="container-page flex flex-col gap-3 border-t border-border py-4 text-sm md:hidden">
          {NAV.map((n) => (
            <Link key={n.slug} to={n.to} params={{ slug: n.slug }} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link to="/plr" onClick={() => setOpen(false)}>
            PLR
          </Link>
        </nav>
      )}

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Search templates</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try “budget” or “bundle”"
          />
          <ul className="max-h-72 space-y-1 overflow-auto">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary"
                >
                  <img src={p.images[0]} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />
                  <span className="text-sm">{p.name}</span>
                </Link>
              </li>
            ))}
            {q && results.length === 0 && (
              <li className="p-2 text-sm text-muted-foreground">No templates match that search.</li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
}
