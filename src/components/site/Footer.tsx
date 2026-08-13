import { Link } from "@tanstack/react-router";
import { CreditCard, Instagram, Youtube } from "lucide-react";
import { Newsletter } from "./Newsletter";
import { categories } from "@/data/shop";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to={c.slug === "plr" ? "/plr" : "/collections/$slug"}
                  params={{ slug: c.slug }}
                  className="hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/collections/$slug" params={{ slug: "best-sellers" }} className="hover:text-primary">
                Best Sellers
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide">Resources</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/faq" className="hover:text-primary">FAQ &amp; Help</Link></li>
            <li><Link to="/faq" hash="digital-downloads" className="hover:text-primary">Digital downloads</Link></li>
            <li><Link to="/faq" hash="how-templates-work" className="hover:text-primary">How templates work</Link></li>
            <li><Link to="/faq" hash="access-issues" className="hover:text-primary">Access issues</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/about" hash="affiliate" className="hover:text-primary">Affiliate program</Link></li>
            <li><Link to="/about" hash="contact" className="hover:text-primary">Contact</Link></li>
            <li><Link to="/plr" className="hover:text-primary">Resell with PLR</Link></li>
          </ul>
          <h3 className="mb-3 mt-6 font-display text-sm font-semibold uppercase tracking-wide">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/faq" hash="refund-policy" className="hover:text-primary">Refund policy</Link></li>
            <li><Link to="/faq" hash="refund-policy" className="hover:text-primary">Terms of service</Link></li>
            <li><Link to="/faq" hash="refund-policy" className="hover:text-primary">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide">
            Stay organized
          </h3>
          <Newsletter />
          <div className="mt-6 flex items-center gap-4 text-muted-foreground">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
            <a href="#" aria-label="Pinterest" className="text-sm font-semibold">P</a>
            <a href="#" aria-label="TikTok" className="text-sm font-semibold">TT</a>
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col items-center gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={16} />
          <span>Visa · Mastercard · Amex · Apple Pay · Google Pay · PayPal</span>
        </div>
        <p>© {new Date().getFullYear()} Ledger&amp;Leaf. All rights reserved.</p>
      </div>
    </footer>
  );
}
