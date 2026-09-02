import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { fetchMyOrders, type MyOrder } from "@/lib/checkout";
import { money } from "@/data/shop";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account & Downloads — ReadyTrackers" },
      {
        name: "description",
        content: "Sign in to re-download your purchased spreadsheet templates any time.",
      },
      { property: "og:title", content: "Account & Downloads — ReadyTrackers" },
      { property: "og:description", content: "Re-download your purchased templates any time." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Signed out: the full-screen sign-up split, styled after
  // balanceextract.com/signup but with ReadyTrackers content.
  if (!user) {
    return <SignUpSplit />;
  }

  return <OrderHistory email={user.email ?? ""} onSignOut={signOut} />;
}

function SignUpSplit() {
  const { openAuthModal } = useAuth();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onEmailSignUp(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // A session means the AuthProvider already knows — Account re-renders
    // straight into the download history. No session means confirmation
    // is required and the buyer should check their inbox.
    if (data.session) {
      toast.success("Account created — welcome!");
    } else {
      toast.success("Check your email to confirm your account.");
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      setGoogleLoading(false);
      toast.error(res.error.message ?? "Could not sign in with Google.");
      return;
    }
    // Redirect flow: the browser navigates away to Google. Popup flow:
    // the session is already set and Account re-renders.
    if (res.redirected) return;
    setGoogleLoading(false);
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* ————— LEFT · form ————— */}
      <div className="flex min-h-screen flex-col px-6 py-8 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[1.5rem] font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start free with instant downloads. No credit card required.
          </p>

          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary/60 disabled:opacity-60"
          >
            {googleLoading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground"
                  aria-hidden
                />
                Connecting to Google…
              </>
            ) : (
              <>
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </>
            )}
          </button>

          <div className="my-6 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-5" onSubmit={onEmailSignUp}>
            <div>
              <label htmlFor="account-email" className="mb-1.5 block text-sm font-semibold text-foreground">
                Email
              </label>
              <input
                id="account-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
              />
            </div>

            <div>
              <label htmlFor="account-password" className="mb-1.5 block text-sm font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="account-password"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => openAuthModal("sign-in")}
              className="font-bold text-accent hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="mt-auto text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link to="/policies/terms-of-service" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/policies/privacy-policy" className="underline hover:text-foreground">
            Privacy
          </Link>
          .
        </p>
      </div>

      {/* ————— RIGHT · brand panel ————— */}
      <BrandPanel />
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-primary lg:block">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(1200px 600px at 90% -10%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%), radial-gradient(900px 500px at 0% 110%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 55%)",
        }}
        aria-hidden
      />
      <div className="grid-fintech absolute inset-0 opacity-20" aria-hidden />

      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            Instant download · Lifetime access
          </div>
          <h2 className="mt-6 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-background xl:text-[2.25rem]">
            Templates in.
            <br />
            <span className="text-background/70">Calm out.</span>
          </h2>

          <ul className="mt-8 space-y-3 text-sm text-background/85">
            {[
              "Hundreds of ready-made templates for budgeting, planning & your side hustle",
              "Buy once, keep forever — no subscriptions, no watermarks",
              "Works in Excel, Google Sheets & Notion — instant download after checkout",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                  <Check className="h-3 w-3 text-accent" />
                </span>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Excel", "Google Sheets", "Notion", "Canva", "PDF"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold text-background/80"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-background">
                  Smart_Budget_Spreadsheet.xlsx
                </div>
                <div className="font-mono text-[11px] text-background/60">Excel · 4 tabs</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-accent">
              <Check className="h-3 w-3" /> Downloaded
            </div>
          </div>
          <div className="divide-y divide-white/5 font-mono text-[12px]">
            {[
              ["Jan", "Housing", "$1,500.00", "text-accent"],
              ["Jan", "Groceries", "$384.00", "text-background/85"],
              ["Jan", "Transport", "$185.00", "text-background/85"],
            ].map(([date, desc, amt, cls]) => (
              <div key={desc} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-4">
                  <span className="w-14 text-background/55">{date}</span>
                  <span className="text-background/90">{desc}</span>
                </div>
                <span className={`font-semibold ${cls}`}>{amt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-xs text-background/60">
          Trusted by 62,000+ creators, coaches & small business owners.
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.5 6.6 2.5 12S6.7 21.7 12 21.7c6.9 0 9.5-4.8 9.5-7.3 0-.5-.1-.9-.1-1.3H12z"
      />
    </svg>
  );
}

function OrderHistory({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your orders");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Your downloads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {!error && orders === null && (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your orders…
          </div>
        )}

        {orders?.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card py-16 text-center shadow-soft">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No orders yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Templates you buy while signed in will show up here, ready to re-download any time.
            </p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.orderId} className="rounded-2xl bg-card p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Order #{order.orderId.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    {order.amountTotal != null && (
                      <span className="text-sm font-semibold text-foreground">
                        {money(order.amountTotal / 100)}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mt-4 space-y-3">
                  {order.items.map((item) => {
                    const download = order.downloads.find(
                      (d) => d.productSlug === item.productSlug,
                    );
                    const expired = download ? new Date(download.expiresAt) < new Date() : true;
                    return (
                      <li
                        key={`${order.orderId}-${item.productSlug}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.colorway ? `${item.colorway} · ` : ""}Qty {item.quantity}
                          </p>
                        </div>
                        {download && !expired ? (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="shrink-0 gap-1.5 rounded-full"
                          >
                            <a href={download.url}>
                              <Download size={14} /> Download
                            </a>
                          </Button>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {order.status === "refunded" ? "Refunded" : "Link expired"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-accent/12 text-accent",
    refunded: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        styles[status] ?? "bg-secondary text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
