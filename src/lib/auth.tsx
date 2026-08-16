import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthModalMode = "sign-in" | "sign-up";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  /** True until the initial getSession() call resolves — lets callers
   *  avoid flashing a "signed out" state on first paint. */
  loading: boolean;
  modalOpen: boolean;
  modalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

/**
 * Accounts are optional everywhere in this app — this provider just tracks
 * whether someone happens to be signed in, and owns the shared AuthModal's
 * open/closed state so any component (header, cart drawer, account page)
 * can trigger sign-in/sign-up without mounting its own dialog. Mirrors the
 * CartProvider/QuickViewProvider pattern already used for the cart drawer
 * and quick view modal.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthModalMode>("sign-in");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
      // A session appearing (sign-in completed, including the redirect
      // back from Google) is the modal's own cue to close — no caller
      // needs to remember to do this themselves.
      if (newSession) setModalOpen(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      modalOpen,
      modalMode,
      openAuthModal: (mode = "sign-in") => {
        setModalMode(mode);
        setModalOpen(true);
      },
      closeAuthModal: () => setModalOpen(false),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, modalOpen, modalMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
