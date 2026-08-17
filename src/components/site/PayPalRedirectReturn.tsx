import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capturePaypalOrder } from "@/lib/checkout";
import { useCart } from "@/lib/cart";

// PayPal's Buttons flow normally runs in a popup, so the page (and the
// onApprove callback that calls paypal-capture-order) survives the whole
// journey. But several real situations downgrade it to a FULL-PAGE
// redirect instead: popups blocked, some 3-D Secure challenges, and the
// hosted guest-card flow. In those cases the buyer approves payment on
// paypal.com and is redirected back here with ?token=<orderId>&PayerID=…
// — a brand-new page load where no onApprove exists. Without this
// handler the approval just evaporates: the order is never captured, the
// buyer never reaches the success page, and (because the drawer restores
// its state) they appear to be dumped straight back into checkout after
// paying. This component, mounted once in __root.tsx, is that missing
// return leg: spot the params, capture the order, land on /checkout/success.
//
// Module-level so a StrictMode double-mount can't fire two captures (the
// backend is idempotent about it now, but there's no reason to race).
let handledReturn = false;

export function PayPalRedirectReturn() {
  const { closeCart, openCart } = useCart();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "confirming" | "error">("idle");

  useEffect(() => {
    if (handledReturn) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerId = params.get("PayerID");
    if (!token) return;
    handledReturn = true;

    if (!payerId) {
      // token without PayerID is PayPal's cancel-and-return case — the
      // buyer backed out on PayPal's page. Clean the URL and reopen the
      // cart so they can pick up where they left off (or walk away).
      window.history.replaceState({}, "", window.location.pathname);
      openCart();
      return;
    }

    setState("confirming");
    void (async () => {
      try {
        const completed = await capturePaypalOrder(token);
        if (!completed) {
          setState("error");
          return;
        }
        // closeCart() also clears the persisted Buy-now line (so the
        // drawer stops restoring a checkout that already happened) —
        // /checkout/success clears the main cart itself.
        closeCart();
        navigate({ to: "/checkout/success", search: { order_id: token }, replace: true });
        setState("idle");
      } catch (err) {
        console.error("paypal redirect-return capture failed:", err);
        setState("error");
      }
    })();
    // Run exactly once, on the page load that carried the params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "idle") return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/95 px-4 backdrop-blur-sm">
      {state === "confirming" ? (
        <div className="text-center">
          <Loader2 size={36} className="mx-auto animate-spin text-accent" />
          <h1 className="mt-5 font-display text-2xl">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You approved the payment on PayPal — hold on while we finish up your order.
          </p>
        </div>
      ) : (
        <div className="max-w-md text-center">
          <AlertTriangle size={36} className="mx-auto text-destructive" />
          <h1 className="mt-5 font-display text-2xl">We couldn't confirm your payment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your payment may have gone through, but we couldn't confirm it on our side. If your
            download email doesn't arrive within a few minutes, please contact us and we'll sort it
            out.
          </p>
          <Button
            className="mt-6 rounded-full"
            variant="outline"
            onClick={() => {
              window.history.replaceState({}, "", window.location.pathname);
              setState("idle");
            }}
          >
            Back to the shop
          </Button>
        </div>
      )}
    </div>
  );
}
