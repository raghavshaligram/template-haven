/**
 * Consent-gated analytics loader.
 *
 * The important property here: nothing analytics-related touches the page
 * until loadAnalytics() is called, and loadAnalytics() is only ever called
 * from the consent store after the visitor has actively accepted. A cookie
 * banner that renders but doesn't actually withhold the tag is decoration,
 * not compliance.
 *
 * GA4 is not configured on this site yet (no Measurement ID, no domain).
 * That is fine — this module is inert without one. To turn analytics on
 * later, set VITE_GA4_MEASUREMENT_ID (e.g. "G-XXXXXXXXXX") in the
 * environment and redeploy. No other code changes are needed; the gating
 * below already applies.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_SCRIPT_ID = "ga4-script";

function measurementId(): string | undefined {
  const id = import.meta.env["VITE_GA4_MEASUREMENT_ID"] as string | undefined;
  return id && id.trim() ? id.trim() : undefined;
}

/** True when a Measurement ID is configured, i.e. there is anything to gate. */
export function analyticsConfigured(): boolean {
  return Boolean(measurementId());
}

function ensureGtagStub(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    // Equivalent to the vendor snippet's `function gtag(){dataLayer.push(arguments)}`
    // — gtag.js reads each dataLayer entry array-like, and a real array
    // satisfies that just as the `arguments` object does. Written this way
    // so no inline <script> is needed (avoids tripping a strict CSP).
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }
}

/**
 * Tell Google Consent Mode that everything is denied until told otherwise.
 * Safe to call before any tag exists — the signal simply queues on
 * dataLayer. This matters if a tag ever gets injected outside this app
 * (Lovable, GTM, a marketing script): it arrives already default-denied
 * rather than tracking on load.
 */
export function setConsentDefaultDenied(): void {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
}

/**
 * Load GA4 and mark analytics storage granted. Called only after the
 * visitor accepts. Idempotent — repeat calls are a no-op.
 * Returns false when no Measurement ID is configured (nothing loaded).
 */
export function loadAnalytics(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const id = measurementId();
  if (!id) return false;

  ensureGtagStub();
  window.gtag?.("consent", "update", { analytics_storage: "granted" });

  if (document.getElementById(GA_SCRIPT_ID)) return true;

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  window.gtag?.("js", new Date());
  // anonymize_ip trims the visitor's IP before storage — one of the
  // concrete measures the Privacy Policy claims we take.
  window.gtag?.("config", id, { anonymize_ip: true });
  return true;
}

/**
 * Withdraw consent: signal denial and clear the cookies GA already set.
 * The script tag itself can't be unloaded from a live page, so the honest
 * behaviour is to stop it storing anything and bin what exists; a reload
 * then starts clean because loadAnalytics() won't run again.
 */
export function disableAnalytics(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  ensureGtagStub();
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  clearAnalyticsCookies();
}

function clearAnalyticsCookies(): void {
  const hostname = window.location.hostname;
  // Cover the host and its parent domain — GA commonly sets on ".example.com".
  const domains = [hostname, `.${hostname}`, `.${hostname.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }
}
