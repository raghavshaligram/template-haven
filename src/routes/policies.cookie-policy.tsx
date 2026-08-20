import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { PolicyPage, PolicySection } from "@/components/site/PolicyPage";
import { Button } from "@/components/ui/button";
import { RETENTION, SHOP_NAME, SUPPORT_EMAIL } from "@/data/policies";
import { analyticsConfigured } from "@/lib/analytics";
import { useConsent } from "@/lib/consent";

export const Route = createFileRoute("/policies/cookie-policy")({
  head: () => ({
    meta: [
      { title: `Cookie Policy — ${SHOP_NAME}` },
      {
        name: "description",
        content: "What cookies this site uses, and how to change your choice at any time.",
      },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <PolicyPage
      policyKey="cookies"
      title="Cookie Policy"
      intro="A short, honest list of what this site stores in your browser — and a button to change your mind whenever you like."
    >
      <ConsentControls />

      <PolicySection title="Cookies we use without asking">
        <p>
          These are the ones the site genuinely can't work without, so they don't require consent.
          None of them track you across other websites.
        </p>
        <CookieTable
          rows={[
            {
              name: "Your cookie choice",
              purpose:
                "Remembers whether you accepted or declined analytics, so we don't ask on every page.",
              duration: "Until you clear it",
            },
            {
              name: "Your cart",
              purpose:
                "Remembers what you've added so it's still there if you close the tab. Stored in your browser only — we never see it.",
              duration: "Until you clear it",
            },
            {
              name: "Sign-in session",
              purpose:
                "Keeps you signed in, if you chose to create an account. Not set for guests.",
              duration: "Until you sign out",
            },
          ]}
        />
      </PolicySection>

      <PolicySection title="Analytics cookies — only with your consent">
        {analyticsConfigured() ? (
          <>
            <p>
              We use Google Analytics 4 to understand which templates and pages people find useful.
              It sets cookies that record things like which pages you viewed, how you arrived, your
              approximate location (country or city level, from a shortened IP address), and what
              kind of device you're using.
            </p>
            <p>
              It does not tell us your name, email, or anything you typed. We use it in aggregate,
              to answer questions like "is anyone reading the debt payoff guide" — never to identify
              an individual visitor.
            </p>
            <CookieTable
              rows={[
                {
                  name: "_ga",
                  purpose:
                    "Distinguishes one visitor from another so visits aren't double-counted.",
                  duration: "2 years",
                },
                {
                  name: "_ga_*",
                  purpose: "Keeps track of a single browsing session.",
                  duration: "2 years",
                },
              ]}
            />
            <p>Analytics data is retained for {RETENTION.analytics}, then deleted automatically.</p>
          </>
        ) : (
          <>
            <p className="rounded-xl border border-border bg-secondary/50 p-4">
              <strong className="font-semibold text-foreground">
                We are not currently running any analytics at all.
              </strong>{" "}
              No Google Analytics, no tracking pixels, no advertising cookies — nothing optional is
              loaded on this site today.
            </p>
            <p>
              We may add Google Analytics 4 later to understand which templates people find useful.
              The consent controls above are already wired up, so if we do, it will stay switched
              off until you accept — and this page will be updated to list exactly what it sets
              before anything is turned on.
            </p>
          </>
        )}
      </PolicySection>

      <PolicySection title="What we don't do">
        <p>
          No advertising cookies. No remarketing or retargeting pixels. No social media trackers. No
          selling of behavioural data to anyone, for any reason.
        </p>
      </PolicySection>

      <PolicySection title="Managing cookies in your browser">
        <p>
          Beyond the controls on this page, every browser lets you view and delete cookies, and
          block them entirely, in its privacy settings. Blocking the strictly necessary ones may
          stop the cart or sign-in from working, but nothing will break irreparably.
        </p>
        <p>
          Questions about any of this? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-accent hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

/** Live consent state plus the controls to change it. */
function ConsentControls() {
  const { choice, accept, decline } = useConsent();

  const label =
    choice === "granted"
      ? "You've accepted analytics cookies."
      : choice === "denied"
        ? "You've declined analytics cookies."
        : "You haven't chosen yet — nothing optional is loaded until you do.";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg">Your current choice</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-foreground/85">
        {choice === "granted" ? (
          <Check size={16} className="shrink-0 text-accent" />
        ) : choice === "denied" ? (
          <X size={16} className="shrink-0 text-muted-foreground" />
        ) : null}
        {label}
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button
          onClick={accept}
          disabled={choice === "granted"}
          className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Accept analytics
        </Button>
        <Button
          variant="outline"
          onClick={decline}
          disabled={choice === "denied"}
          className="h-10 rounded-full px-5 text-sm"
        >
          Decline analytics
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Declining also clears any analytics cookies already set.
      </p>
    </div>
  );
}

function CookieTable({ rows }: { rows: { name: string; purpose: string; duration: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="mt-2 w-full min-w-[34rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2.5 pr-4 font-semibold text-foreground">Cookie</th>
            <th className="py-2.5 pr-4 font-semibold text-foreground">What it does</th>
            <th className="py-2.5 font-semibold text-foreground">Lasts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border/60 align-top">
              <td className="py-3 pr-4 font-medium text-foreground">{r.name}</td>
              <td className="py-3 pr-4 text-foreground/80">{r.purpose}</td>
              <td className="py-3 whitespace-nowrap text-muted-foreground">{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
