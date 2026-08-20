/**
 * Single source of truth for everything the policy pages assert about the
 * business. Every legal page reads from here, so changing the support
 * address or the trading name is one edit, not five — and the pages can't
 * silently disagree with each other.
 *
 * ⚠️ These pages are an unreviewed starting draft. See POLICY_REVIEW_NOTE.
 */

/** Trading name used throughout the policies. */
export const SHOP_NAME = "ReadyTrackers";

/**
 * Support / privacy contact. Used on all five policy pages.
 * ⚠️ This mailbox must exist and be monitored before the site takes a real
 * payment — several policies below promise a reply to it.
 */
export const SUPPORT_EMAIL = "support@readytrackers.com";

/**
 * Payment processor. PayPal only — Stripe was fully removed, and there is
 * no subscription billing anywhere (one-time purchases only).
 */
export const PAYMENT_PROCESSOR = "PayPal";

/**
 * ⚠️ NEEDS A REAL DECISION BEFORE PUBLISHING.
 *
 * "Global customers" is not itself a governing law — a contract has to name
 * one forum. India is used here because that is where the business is
 * operated from. The consumer-rights carve-out in the Terms is what makes
 * that workable for EU/UK/AU buyers, whose mandatory local protections
 * apply regardless of what this says.
 *
 * If the business is (or becomes) formally registered somewhere else, this
 * must change to match the registered entity.
 */
export const GOVERNING_LAW_COUNTRY = "India";

/**
 * Per-policy revision dates.
 *
 * Deliberately NOT `new Date()`. Rendering today's date would make every
 * page claim it was revised today, every day — which is worse than a stale
 * date, because it is an actively false statement on a legal page. Instead
 * each policy carries its real last-revision date here, in one file, so
 * editing a policy and bumping its date are adjacent one-line changes.
 *
 * Format: ISO yyyy-mm-dd. Rendered via formatPolicyDate() below.
 */
export const POLICY_LAST_UPDATED = {
  privacy: "2026-08-20",
  terms: "2026-08-20",
  refund: "2026-08-20",
  delivery: "2026-08-20",
  cookies: "2026-08-20",
} as const;

export type PolicyKey = keyof typeof POLICY_LAST_UPDATED;

/** Renders an ISO date as e.g. "20 August 2026". */
export function formatPolicyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  // Construct in UTC so the displayed date can't shift by a day depending
  // on the reader's timezone.
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Shown at the top of every policy page while these remain unreviewed.
 * Delete this banner (and the prop that renders it) once a lawyer or a
 * policy generator has signed the pages off.
 */
export const POLICY_REVIEW_NOTE =
  "This is a working draft, not reviewed legal copy. It should be checked against a policy generator or by legal counsel before this site processes live payments.";

/** How long we keep things. Referenced by the Privacy Policy. */
export const RETENTION = {
  orders: "7 years",
  downloadLinks: "30 days",
  marketingEmail: "until you unsubscribe",
  analytics: "14 months",
} as const;
