// GET — returns what the frontend needs to load PayPal's JS SDK: the
// Client ID (public by design, meant for a browser <script> tag — unlike
// the Client Secret, which never leaves this and the other server-side
// functions) and which environment is active.
//
// Keeping the sandbox-vs-live switch here, server-side, means the
// frontend never has to know or care which environment it's pointed at —
// one deploy, one env var flip (PAYPAL_ENV), no frontend code change.
// Mirrors the paypal-config function on balanceextract.com.
//
// Required secrets (set via `supabase secrets set`, never hardcoded):
//   PAYPAL_ENV                       "sandbox" or "live" (defaults to sandbox)
//   PAYPAL_CLIENT_ID_SANDBOX / _LIVE
import { json, preflight } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const env = Deno.env.get("PAYPAL_ENV") ?? "sandbox";
  const suffix = env === "live" ? "LIVE" : "SANDBOX";
  const clientId = Deno.env.get(`PAYPAL_CLIENT_ID_${suffix}`);

  // Not an error — checkout being unconfigured is a real, valid state
  // (e.g. before live credentials are set), and the frontend uses this
  // exact response shape to fall back to a "checkout isn't live yet"
  // message instead of rendering a broken button.
  if (!clientId) return json({ configured: false });

  return json({ configured: true, clientId, env });
});
