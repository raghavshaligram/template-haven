import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { capturePaypalOrder, createPaypalOrder, type CheckoutItem } from "@/lib/checkout";

type Props = {
  items: CheckoutItem[];
  /** Called right after a successful capture, before navigating to the
   *  success page — lets the cart drawer close itself instead of sitting
   *  open behind the new route. */
  onApproved?: () => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: Record<string, unknown>) => { render: (container: HTMLElement) => void };
    };
  }
}

type Status = "loading" | "ready" | "unavailable" | "processing" | "error";

/**
 * Renders PayPal's Buttons (PayPal balance + PayPal-hosted card entry) for
 * the given cart and drives the create-order -> approve -> capture-order
 * flow. Ported from the PayPal integration on balanceextract.com, trimmed
 * to PayPal-only (no Venmo/Google Pay — see
 * supabase/functions/paypal-create-order for why) and adapted for guest
 * checkout: no auth header, cart items are passed in as a prop instead of
 * read from a signed-in session.
 *
 * On approval, capture happens server-side (paypal-capture-order), which
 * also mints download tokens and sends the order email — by the time this
 * component navigates to /checkout/success, fulfillment has already run.
 */
export function PayPalCheckoutButton({ items, onApproved }: Props) {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Guards against ever calling .render() twice into this instance's own
  // container (belt-and-suspenders alongside rendering into the element
  // itself rather than a selector — see renderPayPalButtons below).
  const renderedRef = useRef(false);
  // Guards against onApprove running twice concurrently for the same
  // approval (a stray double-click on PayPal's own iframe before our
  // "processing" state has a chance to visually block it, a slow network
  // response the buyer retries, etc.) — without this, a second capture
  // call for an order that's already mid-capture races the first one.
  const capturingRef = useRef(false);
  const navigate = useNavigate();

  // The PayPal SDK's Buttons instance is only created once (see the empty
  // dependency array below) — reading items/onApproved through refs, kept
  // fresh every render, means createOrder always sends whatever the cart
  // actually holds at click time even if it changed after the buttons
  // first rendered (e.g. the drawer's qty controls edited a line while it
  // was open), without needing to re-render PayPal's own button UI.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const onApprovedRef = useRef(onApproved);
  useEffect(() => {
    onApprovedRef.current = onApproved;
  }, [onApproved]);

  useEffect(() => {
    let cancelled = false;

    function loadScript(id: string, src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const existing = document.getElementById(id);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    }

    async function init() {
      // Ask our own edge function for the Client ID rather than hardcoding
      // sandbox-vs-live selection in the frontend — keeps real config
      // server-side, and lets the same build work against either
      // environment depending only on which secrets are set.
      let result: { data: { configured?: boolean; clientId?: string } | null; ok: boolean };
      try {
        const base = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
        if (!base) throw new Error("not configured");
        const res = await Promise.race([
          fetch(`${base}/functions/v1/paypal-config`),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
        result = { data: await res.json(), ok: res.ok };
      } catch (err) {
        console.error("paypal-config request failed:", err);
        if (!cancelled) setStatus("unavailable");
        return;
      }
      if (cancelled) return;

      if (!result.ok || !result.data?.configured || !result.data?.clientId) {
        console.error("paypal-config returned no usable config:", result.data);
        setStatus("unavailable");
        return;
      }
      const clientId = result.data.clientId;

      try {
        // disable-funding=paylater: PayPal's SDK otherwise adds Pay Later
        // automatically for eligible US buyers without being asked to —
        // this store never opted into offering it.
        await loadScript(
          "paypal-sdk-script",
          `https://www.paypal.com/sdk/js?client-id=${clientId}&intent=capture&disable-funding=paylater`,
        );
      } catch (err) {
        console.error("PayPal SDK failed to load:", err);
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) return;
      renderPayPalButtons();
    }

    function renderPayPalButtons() {
      if (!window.paypal || !containerRef.current) {
        setStatus("error");
        return;
      }
      if (renderedRef.current) return;
      renderedRef.current = true;
      setStatus("ready");
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
          async createOrder() {
            try {
              return await createPaypalOrder(itemsRef.current);
            } catch (err) {
              const message = err instanceof Error ? err.message : "Could not start checkout.";
              setErrorMessage(message);
              setStatus("error");
              throw err;
            }
          },
          async onApprove(data: { orderID: string }) {
            if (capturingRef.current) return;
            capturingRef.current = true;
            setStatus("processing");
            try {
              const completed = await capturePaypalOrder(data.orderID);
              if (!completed) {
                setErrorMessage(
                  "PayPal didn't complete this payment (it may have been declined). No charge was made — please try again or use a different payment method.",
                );
                setStatus("error");
                return;
              }
            } catch (err) {
              console.error("paypal-capture-order failed:", err);
              setErrorMessage(
                "Your payment may have gone through, but we couldn't confirm it on our side. Please contact us so we can check and fix this manually.",
              );
              setStatus("error");
              return;
            } finally {
              capturingRef.current = false;
            }
            onApprovedRef.current?.();
            navigate({ to: "/checkout/success", search: { order_id: data.orderID } });
          },
          onCancel() {
            setStatus("ready");
          },
          onError() {
            setErrorMessage("Something went wrong starting checkout. Please try again.");
            setStatus("error");
          },
        })
        // Render into the element itself, not a selector string — a
        // selector like "#paypal-checkout-button-container" would resolve
        // to whichever matching element comes first in the document,
        // which silently doubles up the buttons if more than one
        // PayPalCheckoutButton instance is ever mounted at once (e.g. the
        // cart drawer left open behind a direct checkout page visit).
        .render(containerRef.current);
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "unavailable") {
    return (
      <p className="mt-5 text-xs text-muted-foreground">
        Checkout isn't live yet — check back soon, or reach out via Contact if you'd like to be
        notified.
      </p>
    );
  }

  return (
    <div className="mt-5">
      {status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading checkout…
        </div>
      )}
      {status === "processing" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment…
        </div>
      )}
      {status === "error" && errorMessage && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}
      {/* Dimmed and inert while a capture is in flight — PayPal's iframe
          buttons render here and stay clickable by default; without this,
          an impatient buyer can click "Pay" again mid-capture and race a
          second capture attempt against the first. */}
      <div
        ref={containerRef}
        className={status === "processing" ? "pointer-events-none opacity-40" : undefined}
      />
    </div>
  );
}
