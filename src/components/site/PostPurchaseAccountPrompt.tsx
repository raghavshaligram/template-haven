import { useState } from "react";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  FolderCheck,
  Loader2,
  MailCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
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
 *  - Dismissing is a real button at the same size and visual weight as
 *    the accept CTA — not a 10px grey link. If someone doesn't want an
 *    account, that path is as easy to take as the one we'd prefer.
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
      <div className="mt-10 flex items-center justify-center gap-2.5 rounded-2xl border border-border bg-secondary/40 px-5 py-4">
        <CheckCircle2 size={16} className="shrink-0 text-accent" />
        <p className="text-sm text-muted-foreground">
          No problem — your download is above, and a copy is in your inbox.
        </p>
      </div>
    );
  }

  if (state === "sent") {
    return (
      <div className="mt-10 overflow-hidden rounded-2xl border border-accent/25 bg-card shadow-soft">
        <div className="h-1 w-full bg-accent" />
        <div className="p-7 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 ring-8 ring-accent/5">
            <MailCheck size={24} className="text-accent" />
          </span>
          <h2 className="mt-4 font-display text-xl">Check your inbox</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{email.trim()}</span>.
          </p>

          <ol className="mx-auto mt-5 flex max-w-md items-stretch justify-center gap-2 text-left sm:gap-3">
            {[
              ["1", "Open the email"],
              ["2", "Click the link"],
              ["3", "You're in — no password"],
            ].map(([n, label]) => (
              <li
                key={n}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-xl bg-secondary/50 px-2 py-3 text-center"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  {n}
                </span>
                <span className="text-xs leading-snug text-foreground/80">{label}</span>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-xs text-muted-foreground">
            Your download above still works whether or not you click it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="account-prompt-heading"
      className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      {/* Soft tinted header band so the card reads as "optional extra",
          visually distinct from the transactional download list above. */}
      <div className="border-b border-border bg-gradient-to-r from-accent/10 via-secondary/60 to-transparent px-6 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15">
            <Sparkles size={18} className="text-accent" />
          </span>
          <div>
            <h2 id="account-prompt-heading" className="font-display text-lg leading-snug">
              Keep access to this download anytime
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Free account · no password · takes one click
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <ul className="grid gap-2.5 sm:grid-cols-3">
          <BenefitItem icon={<RefreshCw size={15} className="mt-0.5 shrink-0 text-accent" />}>
            Re-download anytime, no email digging
          </BenefitItem>
          <BenefitItem icon={<FolderCheck size={15} className="mt-0.5 shrink-0 text-accent" />}>
            Every order saved in one place
          </BenefitItem>
          <BenefitItem icon={<BellRing size={15} className="mt-0.5 shrink-0 text-accent" />}>
            New templates &amp; deals — only if you opt in
          </BenefitItem>
        </ul>

        <form onSubmit={handleSend} className="mt-6 space-y-4">
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
              className="h-11 rounded-xl bg-background"
            />
          </div>

          {/* Separate from account creation, and unchecked by default.
              Ticking it is a distinct affirmative act — consent is never
              implied by the act of making an account. */}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground/85 transition-colors has-[:checked]:border-accent/40 has-[:checked]:bg-accent/5">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-[var(--accent)]"
            />
            <span>
              Send me deals and new template announcements
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Optional — unsubscribe anytime with one click.
              </span>
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              type="submit"
              disabled={state === "sending"}
              className="h-11 flex-1 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {state === "sending" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Send me a login link
            </Button>

            {/* Deliberately a real button at the same size as the one
                beside it — declining should cost no more effort than
                accepting. */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setState("dismissed")}
              className="h-11 flex-1 rounded-full border-border text-sm"
            >
              No thanks, just send my download
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          No password needed. You can unsubscribe from emails at any time — see our{" "}
          <Link
            to="/policies/privacy-policy"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function BenefitItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-secondary/50 px-3.5 py-3">
      {icon}
      <span className="text-xs leading-snug text-foreground/85">{children}</span>
    </li>
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
