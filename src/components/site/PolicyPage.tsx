import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Mail } from "lucide-react";
import {
  formatPolicyDate,
  POLICY_LAST_UPDATED,
  POLICY_REVIEW_NOTE,
  SUPPORT_EMAIL,
  type PolicyKey,
} from "@/data/policies";

const POLICY_NAV: { key: PolicyKey; label: string; to: string }[] = [
  { key: "privacy", label: "Privacy", to: "/policies/privacy-policy" },
  { key: "terms", label: "Terms of Service", to: "/policies/terms-of-service" },
  { key: "refund", label: "Refunds", to: "/policies/refund-policy" },
  { key: "delivery", label: "Digital Delivery", to: "/policies/delivery-policy" },
  { key: "cookies", label: "Cookies", to: "/policies/cookie-policy" },
];

/**
 * Shared shell for the five policy pages: title, honest last-updated date,
 * the draft-status banner, readable prose column, and cross-links so a
 * reader landing on one policy can find the others.
 */
export function PolicyPage({
  policyKey,
  title,
  intro,
  children,
  showReviewNote = true,
}: {
  policyKey: PolicyKey;
  title: string;
  intro?: string;
  children: ReactNode;
  /** Set false once these pages have been reviewed by counsel. */
  showReviewNote?: boolean;
}) {
  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated {formatPolicyDate(POLICY_LAST_UPDATED[policyKey])}
        </p>

        {showReviewNote && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground/85">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent" />
            <p>{POLICY_REVIEW_NOTE}</p>
          </div>
        )}

        {intro && <p className="mt-8 text-lg leading-relaxed text-foreground/85">{intro}</p>}

        <div className="mt-8">{children}</div>

        <div className="mt-14 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg">Questions about this policy?</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Email us and a real person will reply — usually within one business day.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80"
          >
            <Mail size={15} /> {SUPPORT_EMAIL}
          </a>
        </div>

        <nav className="mt-10 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Other policies
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {POLICY_NAV.filter((p) => p.key !== policyKey).map((p) => (
              <li key={p.key}>
                <Link to={p.to} className="text-muted-foreground hover:text-primary">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

/** Section heading inside a policy. */
export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="font-display text-xl leading-snug">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

/** Bulleted list with the site's list styling. */
export function PolicyList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed text-foreground/85">
          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
