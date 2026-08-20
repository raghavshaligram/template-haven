import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { claimGuestOrders, setMarketingConsent } from "@/lib/customer";
import { reportAccountCreated } from "@/components/site/PostPurchaseAccountPrompt";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): { consent?: string; order_id?: string } => {
    const out: { consent?: string; order_id?: string } = {};
    if (typeof search["consent"] === "string") out.consent = search["consent"];
    if (typeof search["order_id"] === "string") out.order_id = search["order_id"];
    return out;
  },
  head: () => ({
    meta: [{ title: "Signing you in — ReadyTrackers" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallback,
});

/**
 * Where the emailed magic link lands. By the time this renders, the
 * Supabase client has already exchanged the token in the URL for a
 * session, so the work here is the follow-up: record the marketing choice
 * the person made back on the confirmation screen, attach any guest
 * orders bought with this address, then hand them to their dashboard.
 */
function AuthCallback() {
  const { consent } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // The client parses the token from the URL asynchronously on load;
      // onAuthStateChange is the reliable signal that it's finished.
      const session = await waitForSession();
      if (cancelled) return;

      if (!session) {
        setError(
          "That sign-in link has expired or was already used. Request a fresh one and it'll work.",
        );
        return;
      }

      const optedIn = consent === "1";
      if (optedIn) {
        try {
          await setMarketingConsent(true);
        } catch (err) {
          // A failed consent write must not block sign-in — they still get
          // their account and downloads; they just aren't on the list.
          console.error("could not record marketing consent:", err);
        }
      }

      // Belt-and-braces: the DB trigger already links guest orders at
      // signup, this covers an order fulfilled after that moment.
      try {
        await claimGuestOrders();
      } catch (err) {
        console.error("could not claim guest orders:", err);
      }

      reportAccountCreated(optedIn);

      if (!cancelled) navigate({ to: "/account", replace: true });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            <AlertTriangle size={32} className="mx-auto text-destructive" />
            <h1 className="mt-4 font-display text-2xl">This link didn't work</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your purchase is safe either way — the download links emailed to you still work.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/account">Go to your account</Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 size={32} className="mx-auto animate-spin text-accent" />
            <h1 className="mt-4 font-display text-2xl">Signing you in…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              One moment while we set up your account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** Resolves with the session once the URL token has been exchanged, or
 *  null if that hasn't happened within a few seconds. */
function waitForSession() {
  return new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(
    (resolve) => {
      let settled = false;
      const finish = (
        s: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"],
      ) => {
        if (settled) return;
        settled = true;
        sub.data.subscription.unsubscribe();
        clearTimeout(timer);
        resolve(s);
      };

      const sub = supabase.auth.onAuthStateChange((_e, s) => {
        if (s) finish(s);
      });

      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) finish(data.session);
      });

      const timer = setTimeout(() => finish(null), 8000);
    },
  ).then((s) => s);
}
