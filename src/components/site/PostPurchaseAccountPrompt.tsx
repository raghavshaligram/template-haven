import { useState } from "react";
import { AlertTriangle, Loader2, MailCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { sendMagicLink } from "@/lib/customer";

/**
 * Post-purchase account upsell. Renders BELOW the downloads on the order
 * confirmation screen, and is strictly optional in every direction:
 *
 *  - The download above it already works. Nothing here gates it.
 *  - Dismissing is a real, full-width, same-size button — not a 10px grey
 *    link. If someone doesn't want an account, that path is as easy to
 *    take as the one we'd prefer.
 *  - The marketing checkbox is separate from account creation and starts
 *    unchecked. You can make an account and receive nothing; the two
 *    decisions never ride on each other.
 *  - There is no password field. The emailed link both creates the
 *    account and signs them in.
 *
 * The consent choice is carried through the magic link's redirect as a
 * query flag rather than written now, because there is no signed-in user
 * to attach it to until the link is actually clicked. /auth/callback
 * reads it back and records it against the new account.
 */
export function PostPurchaseAccountPrompt({
  defaultEmail,
  orderId,
}: {
  defaultEmail: string;
  orderId: string;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [marketingConsent, setMarketingConsent] = useState(false); // never pre-checked
  const [state, setState] = useState<"idle" | "sending" | "sent" | "dismissed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    try {
      const redirect = new URL("/auth/callback", window.location.origin);
      if (marketingConsent) redirect.searchParams.set("consent", "1");
      redirect.searchParams.set("order_id", orderId);
      await sendMagicLink(email.trim(), redirect.toString());
      setState("sent");
    } catch (err) {
      console.error("magic link request failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't send that link. Your download above still works.",
      );
      setState("error");
    }
  }

  if (state === "dismissed") {
    return (
      <p className="mt-10 text-center text-sm text-muted-foreground">
        No problem — your download is above, and a copy is in your inbox.
      </p>
    );
  }

  if (state === "sent") {
    return (
      <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
        <MailCheck size={28} className="mx-auto text-accent" />
        <h2 className="mt-3 font-display text-lg">Check your inbox</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          We sent a sign-in link to{" "}
          <span className="font-medium text-foreground">{email.trim()}</span>. Click it and your
          account is ready — no password to choose or remember.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Your download above still works whether or not you click it.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="account-prompt-heading"
      className="mt-10 rounded-2xl border border-border bg-card p-6"
    >
      <h2 id="account-prompt-heading" className="font-display text-lg">
        Keep access to this download anytime
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Create a free account to re-download without digging through your email, plus get notified
        when we drop new templates and deals.
      </p>

      <form onSubmit={handleSend} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="account-email" className="text-xs">
            Email
          </Label>
          <Input
            id="account-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-background"
          />
        </div>

        {/* Separate from account creation, and unchecked by default. Ticking
            it is a distinct affirmative act — consent is never implied by
            the act of making an account. */}
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground/85">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-[var(--accent)]"
          />
          <span>Send me deals and new template announcements</span>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <Button
            type="submit"
            disabled={state === "sending"}
            className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {state === "sending" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Send me a login link
          </Button>

          {/* Deliberately a real button at the same size and weight as the
              one above — declining should cost no more effort than
              accepting. */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setState("dismissed")}
            className="h-11 rounded-full border-border text-sm"
          >
            No thanks, just send my download
          </Button>
        </div>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        No password needed. You can unsubscribe from emails at any time — see our{" "}
        <Link
          to="/policies/privacy-policy"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}

/** Fired from /auth/callback once the link is actually redeemed. */
export function reportAccountCreated(withMarketingConsent: boolean): void {
  trackEvent(ANALYTICS_EVENTS.postPurchaseAccountCreated, { method: "magic_link" });
  // Two separate events on purpose: account creation and marketing opt-in
  // are different decisions and want to be measured independently.
  if (withMarketingConsent) {
    trackEvent(ANALYTICS_EVENTS.marketingOptIn, { source: "post_purchase" });
  }
}
