// POST { orderId } -> { status }
//
// Called by the browser's onApprove callback once the buyer has approved
// payment on PayPal's side. Captures the order (this is the step that
// actually moves money), verifies PayPal itself reports it COMPLETED, and
// only then hands off to fulfillOrder to mint download tokens and email
// the buyer.
//
// Two safety checks beyond "the client said it worked":
//   1. orderId must match a row we already wrote as 'pending' in
//      paypal-create-order. Ledger&Leaf has no accounts, so this is the
//      guest-checkout equivalent of balanceextract.com's custom_id check
//      — it stops this endpoint being used to "capture" an arbitrary
//      PayPal order id that didn't originate from our own checkout.
//   2. The capture response's status is checked directly — an order can
//      be approved but still fail to capture (insufficient funds, a
//      declined card backing the PayPal balance, etc.), and only a
//      genuinely COMPLETED capture triggers fulfillment.
//
// This is the primary fulfillment path. paypal-webhook is a second,
// independent confirmation of the same event straight from PayPal's
// servers — it exists specifically to cover the case where this function
// runs but the response never makes it back to a closed browser tab, so a
// real payment doesn't silently fail to unlock anything. fulfillOrder is
// shared by both and is idempotent, so it's safe for both to run.
import { createClient } from "npm:@supabase/supabase-js@2";
import { getAccessToken, paypalApiBase } from "../_shared/paypal.ts";
import { fulfillOrder } from "../_shared/fulfill.ts";
import { json, preflight } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId || typeof orderId !== "string") {
      return json({ error: "Missing orderId" }, 400);
    }

    const { data: orderRow, error: lookupErr } = await supabase
      .from("orders")
      .select("id, status")
      .eq("provider_order_id", orderId)
      .maybeSingle();
    if (lookupErr) {
      console.error("paypal-capture-order: order lookup failed:", lookupErr);
      return json({ error: "Could not confirm this order" }, 500);
    }
    if (!orderRow) {
      // Not an order we created — refuse rather than capturing (and
      // paying out on) an id supplied from outside our own checkout flow.
      console.error("paypal-capture-order: unknown provider_order_id:", orderId);
      return json({ error: "Order not found" }, 404);
    }

    if (orderRow.status !== "pending") {
      // Already resolved — either this endpoint already captured it (a
      // retry after a slow/lost response, a double-click before the
      // button UI disables, etc.) or the webhook beat us to it. Calling
      // PayPal's capture API again here would get rejected
      // (ORDER_ALREADY_CAPTURED) and read as a scary "something went
      // wrong" to a buyer whose payment actually went through the first
      // time. Report the outcome we already know instead.
      return json({ status: orderRow.status === "paid" ? "COMPLETED" : orderRow.status });
    }

    const accessToken = await getAccessToken();
    const captureRes = await fetch(`${paypalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureRes.ok) {
      const body = await captureRes.text();
      console.error("PayPal capture failed:", captureRes.status, body);
      return json({ error: "Could not confirm this payment" }, 502);
    }

    const captured = await captureRes.json();
    const purchaseUnit = captured.purchase_units?.[0];
    const captureStatus: string | undefined = purchaseUnit?.payments?.captures?.[0]?.status;
    const payerEmail: string | null = captured.payer?.email_address ?? null;

    if (captureStatus !== "COMPLETED") {
      // Approved but not actually captured — e.g. a declined funding
      // source. Nothing to fulfill; the buyer sees PayPal's own error.
      return json({ status: captureStatus ?? "unknown" });
    }

    await fulfillOrder(supabase, orderRow.id, payerEmail);

    return json({ status: "COMPLETED" });
  } catch (e) {
    console.error("paypal-capture-order error:", e);
    return json({ error: "Internal error" }, 500);
  }
});
