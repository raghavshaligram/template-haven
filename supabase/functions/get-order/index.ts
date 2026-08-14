// GET ?session_id=cs_... — order summary + download links for the success page.
// Retries make this safe to call immediately after redirect, since the
// webhook may land a second or two after the buyer does.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) return json({ error: "Bad session id" }, 400);

  const { data: order } = await supabase
    .from("orders")
    .select("id, email, amount_total, currency, status, created_at")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (!order) return json({ pending: true }, 202);

  const [{ data: items }, { data: tokens }] = await Promise.all([
    supabase
      .from("order_items")
      .select("product_slug, product_name, colorway, unit_amount, quantity")
      .eq("order_id", order.id),
    supabase
      .from("download_tokens")
      .select("token, product_slug, expires_at")
      .eq("order_id", order.id),
  ]);

  const fnBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
  const downloads = (tokens ?? []).map((t) => ({
    productSlug: t.product_slug,
    url: `${fnBase}/download?token=${t.token}`,
    expiresAt: t.expires_at,
  }));

  return json({
    email: order.email,
    amountTotal: order.amount_total,
    currency: order.currency,
    status: order.status,
    items: items ?? [],
    downloads,
  });
});
