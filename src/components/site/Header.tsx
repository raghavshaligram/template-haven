import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { products } from "@/data/shop";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NAV = [
  { label: "Best Sellers", to: "/collections/$slug", slug: "best-sellers" },
  { label: "Bundles", to: "/collections/$slug", slug: "bundles" },
  { label: "Personal Finance", to: "/collections/$slug", slug: "personal-finance" },
  { label: "Business Tools", to: "/collections/$slug", slug: "business-tools" },
  { label: "Organization", to: "/collections/$slug", slug: "organization" },
];

function searchProducts(q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return products
    .filter((p) => (p.name + " " + p.tags.join(" ")).toLowerCase().includes(t))
    .slice(0, 6);
}

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  const results = searchProducts(q);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-page flex h-9 items-center justify-center gap-2 text-center text-[12.5px] font-medium tracking-wide">
          <span aria-hidden>✦</span>
          <span>
            Instant download · Works in Excel &amp; Google Sheets · One-time purchase — no
            subscriptions
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="font-display text-xl font-semibold tracking-tight text-primary">
              Ledger&amp;Leaf
            </Link>
          </div>

          {/* Inline search (desktop) */}
          <div className="relative mx-auto hidden w-full max-w-xl md:block">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 transition-shadow focus-within:border-primary/60 focus-within:shadow-card">
              <Search size={17} className="shrink-0 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search budget, debt, planner…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search templates"
              />
            </div>
            {focused && q.trim() && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lift">
                {results.length > 0 ? (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={() => setQ("")}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary"
                    >
                      <img
                        src={p.images[0]}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-sm">{p.name}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {p.sale_price === 0 ? "Free" : `$${p.sale_price.toFixed(2)}`}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="p-3 text-sm text-muted-foreground">
                    No templates match that search.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4 md:ml-0">
            <button aria-label="Search" className="md:hidden" onClick={() => setSearchOpen(true)}>
              <Search size={20} className="text-foreground/80 hover:text-primary" />
            </button>
            <Link to="/cart" aria-label="Cart" className="relative">
              <ShoppingBag size={20} className="text-foreground/80 hover:text-primary" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {count}
                </span>
              )}
            </Link>
            <Link to="/account" aria-label="Account" className="hidden sm:block">
              <User size={20} className="text-foreground/80 hover:text-primary" />
            </Link>
          </div>
        </div>

        {/* Category nav row (desktop) */}
        <nav className="hidden border-t border-border/60 md:block">
          <div className="container-page flex h-11 items-center gap-7 text-sm">
            {NAV.map((n) => (
              <Link
                key={n.slug}
                to={n.to}
                params={{ slug: n.slug }}
                className="text-foreground/75 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary font-medium" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/plr"
              className="text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-medium" }}
            >
              PLR
            </Link>
            <Link
              to="/blog"
              className="text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-medium" }}
            >
              Blog
            </Link>
            <Link to="/collections/$slug" params={{ slug: "freebies" }} className="ml-auto">
              <span className="rounded-full bg-accent/12 px-3 py-1 font-semibold text-accent">
                Free templates →
              </span>
            </Link>
          </div>
        </nav>

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
            <Link to="/blog" onClick={() => setOpen(false)}>
              Blog
            </Link>
            <Link to="/account" onClick={() => setOpen(false)}>
              Account
            </Link>
          </nav>
        )}
      </header>

      {/* Mobile search dialog */}
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
                  <img
                    src={p.images[0]}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded object-cover"
                  />
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
    </>
  );
}
