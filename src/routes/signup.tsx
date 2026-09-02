import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, FileSpreadsheet, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SpreadsheetMock } from "@/components/site/SpreadsheetMock";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — ReadyTrackers" },
      {
        name: "description",
        content:
          "Start free with ReadyTrackers. Instant downloads of calm, beautiful templates — no credit card required.",
      },
      { property: "og:title", content: "Create your account — ReadyTrackers" },
      {
        property: "og:description",
        content: "Start free — no credit card required.",
      },
    ],
  }),
  component: Signup,
});

const FORMATS = ["Excel", "Google Sheets", "Notion", "Canva", "PDF"];

const PITCH = [
  "Hundreds of ready-made templates for budgeting, planning & your side hustle",
  "Buy once, keep forever — no subscriptions, no watermarks",
  "Works in Excel, Google Sheets & Notion — downloads land instantly after checkout",
];

function Signup() {
  const { session, openAuthModal } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Could not sign up with Google.");
      setBusy(false);
      return;
    }
    // Redirect flow: the browser navigates away to Google. Popup flow:
    // the session is already set and AuthProvider updates the page.
    if (result.redirected) return;
    setBusy(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // Email confirmation may be required by the project's Auth settings —
    // if there's no session yet, the buyer needs to check their inbox.
    if (!data.session) setCheckEmail(true);
  }

  return (
    <div className="container-page py-14 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ————— form column ————— */}
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
          <h1 className="font-display text-4xl leading-[1.05] md:text-[2.75rem]">
            Create your account
          </h1>
          <p className="mt-3 text-muted-foreground">
            Start free with instant downloads. No credit card required.
          </p>

          {session ? (
            <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <Mail className="h-8 w-8 text-accent" />
              <p className="font-display text-lg font-semibold">You're signed in</p>
              <p className="text-sm text-muted-foreground">
                Head to your account to grab your free downloads.
              </p>
              <Button asChild className="mt-2 h-10 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                <Link to="/account">Go to my account</Link>
              </Button>
            </div>
          ) : checkEmail ? (
            <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
              <Mail className="h-8 w-8 text-accent" />
              <p className="font-display text-lg font-semibold">Check your inbox</p>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to {email}. Click it to finish creating your account.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleGoogle}
                className="h-11 w-full gap-2 rounded-full text-sm"
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 py-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={busy}
                  className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => openAuthModal("sign-in")}
                  className="font-medium text-foreground hover:text-primary"
                >
                  Sign in
                </button>
              </p>

              <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                By creating an account you agree to our{" "}
                <Link
                  to="/policies/terms-of-service"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/policies/privacy-policy"
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        {/* ————— pitch column ————— */}
        <aside className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <div className="rounded-3xl border border-border bg-secondary/40 p-6 sm:p-8">
            <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              Instant download · Lifetime access
            </span>
            <h2 className="mt-4 font-display text-3xl leading-[1.1] md:text-4xl">
              Templates in.
              <br />
              <span className="text-accent">Calm out.</span>
            </h2>
            <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-foreground/85">
              {PITCH.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Smart_Budget_Spreadsheet.xlsx</p>
              <p className="text-xs text-muted-foreground">Excel · 4 tabs</p>
            </div>
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold text-accent">
              Downloaded
            </span>
          </div>

          <div className="mt-3">
            <SpreadsheetMock compact title="Smart Budget Spreadsheet" />
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Trusted by 62,000+ creators, coaches & small business owners.
          </p>
        </aside>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09C3.24 21.3 7.28 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.37l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.63l4.01 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
