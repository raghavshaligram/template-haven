import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/lib/consent";

/**
 * First-visit cookie choice. Shows only while the visitor is undecided;
 * once they pick, the choice persists and this disappears until they
 * change it from the Cookie Policy page.
 *
 * Declining is a plain, equally-weighted button rather than a buried link —
 * a banner where "reject" is harder to find than "accept" is the pattern
 * EU regulators have repeatedly ruled against.
 */
export function CookieBanner() {
  const { choice, accept, decline } = useConsent();

  // null = undecided. Anything else means they've chosen; stay hidden.
  if (choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-border bg-background/95 p-4 shadow-lift backdrop-blur sm:p-5"
    >
      <div className="container-page flex flex-col gap-4 sm:flex-row sm:items-center">
        <Cookie size={20} className="hidden shrink-0 text-accent sm:block" />
        <p className="flex-1 text-sm leading-relaxed text-foreground/85">
          We'd like to use analytics cookies to understand which templates people find useful.
          They're optional — decline and the site works exactly the same.{" "}
          <Link
            to="/policies/cookie-policy"
            className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
          >
            What we'd track
          </Link>
        </p>
        <div className="flex shrink-0 gap-2.5">
          <Button
            variant="outline"
            onClick={decline}
            className="h-10 flex-1 rounded-full px-5 text-sm sm:flex-none"
          >
            Decline
          </Button>
          <Button
            onClick={accept}
            className="h-10 flex-1 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:flex-none"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
