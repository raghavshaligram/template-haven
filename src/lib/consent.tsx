import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { disableAnalytics, loadAnalytics, setConsentDefaultDenied } from "@/lib/analytics";

export type ConsentChoice = "granted" | "denied";

type ConsentCtx = {
  /** null = the visitor hasn't chosen yet, so the banner should show. */
  choice: ConsentChoice | null;
  /** True only when analytics cookies are actively permitted. */
  analyticsAllowed: boolean;
  accept: () => void;
  decline: () => void;
  /** Clears the stored choice so the banner reappears — used by the
   *  "change your mind" control on the Cookie Policy page. */
  reopen: () => void;
};

const ConsentContext = createContext<ConsentCtx | null>(null);
const STORAGE_KEY = "ledgerleaf-cookie-consent";

/**
 * Owns the visitor's cookie choice and is the ONLY thing that ever starts
 * analytics. Mounted once in __root.tsx, above everything else, so no part
 * of the app can load a tag behind its back.
 *
 * Same provider shape as CartProvider/AuthProvider elsewhere in the app.
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    // Default-deny first, before reading storage — so if anything else on
    // the page injects a Google tag, it is already told "denied".
    setConsentDefaultDenied();

    let stored: ConsentChoice | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "granted" || raw === "denied") stored = raw;
    } catch {
      /* storage blocked — treat as undecided, banner shows, nothing loads */
    }

    setChoice(stored);
    if (stored === "granted") loadAnalytics();
  }, []);

  const value = useMemo<ConsentCtx>(
    () => ({
      choice,
      analyticsAllowed: choice === "granted",
      accept: () => {
        try {
          localStorage.setItem(STORAGE_KEY, "granted");
        } catch {
          /* ignore */
        }
        setChoice("granted");
        loadAnalytics();
      },
      decline: () => {
        try {
          localStorage.setItem(STORAGE_KEY, "denied");
        } catch {
          /* ignore */
        }
        setChoice("denied");
        disableAnalytics();
      },
      reopen: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setChoice(null);
        disableAnalytics();
      },
    }),
    [choice],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider");
  return ctx;
}
