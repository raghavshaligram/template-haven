// POST — receives PAYMENT.CAPTURE.* events directly from PayPal's servers.
// The second, independent confirmation of a purchase alongside
// paypal-capture-order (see that function's comment for why both exist:
// this covers a payment that genuinely completed but whose response never
// made it back to the browser, e.g. the tab was closed mid-flow).
//
// CRITICAL: every incoming request is verified against PayPal's own
// signature-verification endpoint before anything in it is trusted. An
// unverified POST to this URL could otherwise claim any order was paid;
// verification is what makes this safe to expose publicly. This function
// must be deployed with verify_jwt = false (see supabase/config.toml) —
// PayPal's servers cannot supply a Supabase JWT.
//
// Required secrets (set via `supabase secrets set`, never hardcoded):
//   PAYPAL_ENV                       "sandbox" or "live" (defaults to sandbox)
//   PAYPAL_CLIENT_ID_SANDBOX / _LIVE
//   PAYPAL_CLIENT_SECRET_SANDBOX / _LIVE
//   PAYPAL_WEBHOOK_ID_SANDBOX / _LIVE
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from "npm:@supabase/supabase-js@2";
import { getAccessToken, paypalApiBase } from "../_shared/paypal.ts";
import { fulfillOrder } from "../_shared/fulfill.ts";
import { corsHeaders } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
  accessToken: string,
): Promise<boolean> {
  // Sandbox and live are registered as separate webhooks in PayPal's
  // dashboard, each with their own webhook id — same reason the client
  // id/secret are already split by environment.
  const env = Deno.env.get("PAYPAL_ENV") ?? "sandbox";
  const suffix = env === "live" ? "LIVE" : "SANDBOX";
  const webhookId =
    Deno.env.get(`PAYPAL_WEBHOOK_ID_${suffix}`) ?? Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) throw new Error(`Missing PAYPAL_WEBHOOK_ID_${suffix} (or PAYPAL_WEBHOOK_ID)`);

  const verifyRes = await fetch(`${paypalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  if (!verifyRes.ok) return false;
  const result = await verifyRes.json();
  return result.verification_status === "SUCCESS";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawBody = await req.text();

  try {
    const accessToken = await getAccessToken();
    const verified = await verifyWebhookSignature(req.headers, rawBody, accessToken);
    if (!verified) {
      console.error("PayPal webhook signature verification failed");
      return new Response("Signature verification failed", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type as string;
    const resource = event.resource ?? {};
    const orderId: string | undefined = resource.supplementary_data?.related_ids?.order_id;

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      // The buyer approved on PayPal but nothing has captured yet. In the
      // normal popup flow the browser's onApprove does the capture within
      // seconds and this event needs no action. But if the flow ran as a
      // full-page redirect and the return leg never completed (tab
      // closed, network dropped, old frontend without the redirect
      // handler), this event is the ONLY signal the sale exists — so
      // capture it server-side. Racing the browser is safe: whichever
      // capture lands second gets ORDER_ALREADY_CAPTURED and backs off,
      // and fulfillOrder is idempotent underneath both.
      const approvedOrderId: string | undefined = resource.id;
      if (!approvedOrderId) {
        return new Response("Acknowledged, no identifying id", { status: 200 });
      }
      const { data: orderRow } = await supabase
        .from("orders")
        .select("id, status")
        .eq("provider_order_id", approvedOrderId)
        .maybeSingle();
      if (!orderRow) return new Response("Acknowledged, unknown order", { status: 200 });
      if (orderRow.status !== "pending") return new Response("OK", { status: 200 });

      const captureRes = await fetch(
        `${paypalApiBase()}/v2/checkout/orders/${approvedOrderId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!captureRes.ok) {
        const body = await captureRes.text();
        if (body.includes("ORDER_ALREADY_CAPTURED")) {
          // The browser (or a webhook retry) beat us to it — the
          // PAYMENT.CAPTURE.COMPLETED event handles fulfillment.
          return new Response("OK", { status: 200 });
        }
        // Non-2xx tells PayPal to retry this event later — a transient
        // PayPal API error shouldn't permanently lose the sale.
        console.error("webhook capture of approved order failed:", captureRes.status, body);
        return new Response("Capture failed, retry", { status: 500 });
      }
      const captured = await captureRes.json();
      const captureStatus: string | undefined =
        captured.purchase_units?.[0]?.payments?.captures?.[0]?.status;
      if (captureStatus === "COMPLETED") {
        await fulfillOrder(supabase, orderRow.id, captured.payer?.email_address ?? null);
      }
      return new Response("OK", { status: 200 });
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      if (!orderId) {
        console.error("PAYMENT.CAPTURE.COMPLETED with no order_id; nothing to match against.");
        return new Response("Acknowledged, no identifying id", { status: 200 });
      }
      const { data: orderRow } = await supabase
        .from("orders")
        .select("id")
        .eq("provider_order_id", orderId)
        .maybeSingle();
      if (!orderRow) {
        // Not one of ours (or arrived before create-order's insert landed,
        // which PayPal's own retry policy will cover) — acknowledge so
        // PayPal doesn't keep retrying a request we can't act on.
        return new Response("Acknowledged, unknown order", { status: 200 });
      }
      const payerEmail: string | null = resource.payer?.email_address ?? null;
      await fulfillOrder(supabase, orderRow.id, payerEmail);
      return new Response("OK", { status: 200 });
    }

    if (eventType === "PAYMENT.CAPTURE.REFUNDED" || eventType === "PAYMENT.CAPTURE.REVERSED") {
      if (!orderId) return new Response("Acknowledged, no identifying id", { status: 200 });
      const { data: orderRow } = await supabase
        .from("orders")
        .select("id")
        .eq("provider_order_id", orderId)
        .maybeSingle();
      if (!orderRow) return new Response("Acknowledged, unknown order", { status: 200 });

      const { error: statusErr } = await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("id", orderRow.id);
      if (statusErr) console.error("Failed to mark order refunded:", statusErr);

      // A refund should actually cut off access — expire this order's
      // download links rather than leaving them live for their full
      // 30-day window.
      const { error: tokenErr } = await supabase
        .from("download_tokens")
        .update({ expires_at: new Date().toISOString() })
        .eq("order_id", orderRow.id);
      if (tokenErr) console.error("Failed to expire download tokens on refund:", tokenErr);

      return new Response("OK", { status: 200 });
    }

    // Not an event we act on — acknowledge it so PayPal doesn't retry.
    return new Response("Acknowledged, no action taken", { status: 200 });
  } catch (err) {
    console.error("paypal-webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
