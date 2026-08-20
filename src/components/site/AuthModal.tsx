import { useState } from "react";
import { AlertTriangle, Loader2, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";


/**
 * Shared sign-in/sign-up dialog — one instance mounted in __root.tsx,
 * opened from anywhere (header, cart drawer, /account) via
 * useAuth().openAuthModal(). Closes itself automatically once a session
 * appears (see AuthProvider's onAuthStateChange).
 */
export function AuthModal() {
  const { modalOpen, modalMode, closeAuthModal, openAuthModal } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  function reset() {
    setPassword("");
    setBusy(false);
    setError(null);
    setCheckEmail(false);
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Could not sign in with Google.");
      setBusy(false);
      return;
    }
    // Redirect flow: the browser navigates away to Google. Popup flow:
    // the session is already set and AuthProvider closes the modal.
    if (result.redirected) return;
    setBusy(false);
  }


  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (modalMode === "sign-up") {
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
      // Email confirmation may or may not be required depending on the
      // project's Auth settings — if it is, there's no session yet and
      // the buyer needs to check their inbox rather than seeing an
      // unexplained non-close.
      if (!data.session) {
        setCheckEmail(true);
      }
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <Dialog
      open={modalOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeAuthModal();
          reset();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">
            {modalMode === "sign-up" ? "Create your account" : "Sign in"}
          </DialogTitle>
        </DialogHeader>

        {checkEmail ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Mail className="h-8 w-8 text-accent" />
            <p className="text-sm text-foreground">Check your inbox</p>
            <p className="text-xs text-muted-foreground">
              We sent a confirmation link to {email}. Click it to finish creating your account.
            </p>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={handleGoogle}
              className="h-10 gap-2 rounded-full text-sm"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleEmailPassword} className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={modalMode === "sign-up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                className="h-10 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                {modalMode === "sign-up" ? "Create account" : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              {modalMode === "sign-up" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      openAuthModal("sign-in");
                    }}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      openAuthModal("sign-up");
                    }}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
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
