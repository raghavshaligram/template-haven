import { supabase } from "@/integrations/supabase/client";

export type CheckoutItem = { slug: string; colorway?: string; qty?: number };

function functionsBase(): string | undefined {
  return import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
}

/** Attaches the signed-in buyer's bearer token when there is a session —
 *  omitted entirely for guests, who check out exactly as before. */
async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Creates a PayPal order for the given cart and returns its PayPal order id.
 *  Links the order to the caller's account if they're signed in. */
export async function createPaypalOrder(items: CheckoutItem[]): Promise<string> {
  const base = functionsBase();
  if (!base) throw new Error("Checkout isn't configured yet");
  const res = await fetch(`${base}/functions/v1/paypal-create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ items }),
  });
  const data = (await res.json()) as { orderId?: string; error?: string };
  if (!res.ok || !data.orderId) throw new Error(data.error ?? "Could not start checkout");
  return data.orderId;
}

/** Captures an approved PayPal order. Resolves true only once PayPal reports it COMPLETED. */
export async function capturePaypalOrder(orderId: string): Promise<boolean> {
  const base = functionsBase();
  if (!base) throw new Error("Checkout isn't configured yet");
  const res = await fetch(`${base}/functions/v1/paypal-capture-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
  const data = (await res.json()) as { status?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Could not confirm this payment");
  return data.status === "COMPLETED";
}

/** Fetch an order summary for the success page. Returns null while pending. */
export async function fetchOrder(orderId: string) {
  const base = functionsBase();
  if (!base) return null;
  const res = await fetch(`${base}/functions/v1/get-order?order_id=${encodeURIComponent(orderId)}`);
  if (res.status === 202) return null; // fulfillment hasn't landed yet
  if (!res.ok) throw new Error("order lookup failed");
  return (await res.json()) as {
    email: string | null;
    amountTotal: number;
    currency: string;
    status: string;
    items: {
      product_slug: string;
      product_name: string;
      colorway: string | null;
      unit_amount: number;
      quantity: number;
    }[];
    downloads: { productSlug: string; url: string; expiresAt: string }[];
  };
}

export type MyOrder = {
  orderId: string;
  amountTotal: number | null;
  currency: string;
  status: string;
  createdAt: string;
  items: {
    productSlug: string;
    productName: string;
    colorway: string | null;
    unitAmount: number;
    quantity: number;
  }[];
  downloads: { productSlug: string; url: string; expiresAt: string }[];
};

/** Order history + re-download links for the signed-in buyer's /account
 *  page. Requires a session — throws if there isn't one. */
export async function fetchMyOrders(): Promise<MyOrder[]> {
  const base = functionsBase();
  if (!base) throw new Error("Not configured yet");
  const headers = await authHeader();
  if (!headers["Authorization"]) throw new Error("Not signed in");
  const res = await fetch(`${base}/functions/v1/get-my-orders`, { headers });
  if (!res.ok) throw new Error("Could not load your orders");
  const data = (await res.json()) as { orders: MyOrder[] };
  return data.orders;
}
