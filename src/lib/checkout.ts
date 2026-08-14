import { toast } from "sonner";

export type CheckoutItem = { slug: string; colorway?: string; qty?: number };

/**
 * Starts a Stripe Checkout session via the create-checkout edge function
 * and redirects the browser to Stripe. Falls back to a toast when the
 * backend isn't configured yet (e.g. local dev without Lovable Cloud).
 */
export async function startCheckout(items: CheckoutItem[]): Promise<void> {
  const base = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  if (!base) {
    toast("Checkout isn't configured yet", {
      description: "Enable Lovable Cloud and set the Stripe secrets to go live.",
    });
    return;
  }
  try {
    const res = await fetch(`${base}/functions/v1/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, origin: window.location.origin }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      toast.error(data.error ?? "Could not start checkout. Please try again.");
      return;
    }
    window.location.href = data.url;
  } catch {
    toast.error("Could not reach checkout. Please try again.");
  }
}

/** Fetch an order summary for the success page. Returns null while pending. */
export async function fetchOrder(sessionId: string) {
  const base = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  if (!base) return null;
  const res = await fetch(
    `${base}/functions/v1/get-order?session_id=${encodeURIComponent(sessionId)}`,
  );
  if (res.status === 202) return null; // webhook hasn't landed yet
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
