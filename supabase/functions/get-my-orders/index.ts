// GET, requires a signed-in caller (verify_jwt = true, see config.toml) --
// order history + download links for the /account page. Guest orders
// (user_id null) never show up here since there's no account to attach
// them to; that's expected, they're only ever reachable via the emailed
// download links, same as before accounts existed.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";
import { getUserIdFromRequest } from "../_shared/auth.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  // verify_jwt = true already rejected anything without a valid token
  // before this code runs; this resolves *which* user it belongs to.
  const userId = await getUserIdFromRequest(req);
  if (!userId) return json({ error: "Unauthorized" }, 401);

  // Exclude 'pending' -- carts that were started but never completed
  // aren't real purchases and shouldn't clutter order history.
  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select("id, provider_order_id, amount_total, currency, status, created_at")
    .eq("user_id", userId)
    .neq("status", "pending")
    .order("created_at", { ascending: false });
  if (ordersErr) {
    console.error("get-my-orders: failed to load orders:", ordersErr);
    return json({ error: "Could not load your orders" }, 500);
  }
  if (!orders || orders.length === 0) return json({ orders: [] });

  const orderIds = orders.map((o) => o.id);
  const [{ data: items }, { data: tokens }] = await Promise.all([
    supabase
      .from("order_items")
      .select("order_id, product_slug, product_name, colorway, unit_amount, quantity")
      .in("order_id", orderIds),
    supabase
      .from("download_tokens")
      .select("order_id, token, product_slug, expires_at")
      .in("order_id", orderIds),
  ]);

  const fnBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
  const result = orders.map((o) => ({
    orderId: o.provider_order_id,
    amountTotal: o.amount_total,
    currency: o.currency,
    status: o.status,
    createdAt: o.created_at,
    items: (items ?? [])
      .filter((i) => i.order_id === o.id)
      .map((i) => ({
        productSlug: i.product_slug,
        productName: i.product_name,
        colorway: i.colorway,
        unitAmount: i.unit_amount,
        quantity: i.quantity,
      })),
    downloads: (tokens ?? [])
      .filter((t) => t.order_id === o.id)
      .map((t) => ({
        productSlug: t.product_slug,
        url: `${fnBase}/download?token=${t.token}`,
        expiresAt: t.expires_at,
      })),
  }));

  return json({ orders: result });
});
