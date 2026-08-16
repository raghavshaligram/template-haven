export type CheckoutItem = { slug: string; colorway?: string; qty?: number };

function functionsBase(): string | undefined {
  return import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
}

/** Creates a PayPal order for the given cart and returns its PayPal order id. */
export async function createPaypalOrder(items: CheckoutItem[]): Promise<string> {
  const base = functionsBase();
  if (!base) throw new Error("Checkout isn't configured yet");
  const res = await fetch(`${base}/functions/v1/paypal-create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
