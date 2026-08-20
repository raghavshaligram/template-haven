import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Download, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchOrder } from "@/lib/checkout";
import { getProduct, money } from "@/data/shop";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout_/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: typeof search["order_id"] === "string" ? (search["order_id"] as string) : "",
  }),
  head: () => ({
    meta: [{ title: "Order complete — ReadyTrackers" }, { name: "robots", content: "noindex" }],
  }),
  component: SuccessPage,
});

type OrderData = NonNullable<Awaited<ReturnType<typeof fetchOrder>>>;

function SuccessPage() {
  const { order_id } = useSearch({ from: "/checkout_/success" });
  const { clear } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!order_id) {
      setState("error");
      return;
    }
    clear(); // payment done — empty the cart
    let attempts = 0;
    let cancelled = false;
    const poll = async () => {
      try {
        const data = await fetchOrder(order_id);
        if (cancelled) return;
        if (data) {
          setOrder(data);
          setState("ready");
          return;
        }
        // capture-order already fulfills the order synchronously in the
        // common case — this retry only matters if paypal-webhook ends up
        // being the one to land fulfillment instead. Retry up to ~30s.
        if (attempts++ < 15) setTimeout(poll, 2000);
        else setState("error");
      } catch {
        if (!cancelled) setState("error");
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_id]);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-lg">
        {state === "loading" && (
          <div className="text-center">
            <Loader2 size={36} className="mx-auto animate-spin text-accent" />
            <h1 className="mt-5 font-display text-2xl">Finishing up your order…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Payment received — preparing your download links. This takes a few seconds.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center">
            <Mail size={36} className="mx-auto text-accent" />
            <h1 className="mt-5 font-display text-2xl">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your order went through, and your download links are on their way to your inbox. If
              nothing arrives within a few minutes, check spam or contact us with your order email.
            </p>
            <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground">
              <Link to="/">Back to the shop</Link>
            </Button>
          </div>
        )}

        {state === "ready" && order && (
          <div>
            <div className="text-center">
              <CheckCircle2 size={40} className="mx-auto text-accent" />
              <h1 className="mt-4 font-display text-3xl">You're all set</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.email ? (
                  <>
                    A copy of these links was emailed to{" "}
                    <span className="font-medium text-foreground">{order.email}</span>.
                  </>
                ) : (
                  "Your downloads are ready below."
                )}{" "}
                Links stay active for 30 days.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {order.downloads.map((d) => {
                const prod = getProduct(d.productSlug);
                const item = order.items.find((i) => i.product_slug === d.productSlug);
                return (
                  <div
                    key={d.url}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    {prod && (
                      <img
                        src={prod.images[0]}
                        alt=""
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-lg border border-border object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {item?.product_name ?? d.productSlug}
                      </p>
                      {item?.colorway && (
                        <p className="text-xs text-muted-foreground">Colorway: {item.colorway}</p>
                      )}
                    </div>
                    <Button
                      asChild
                      className="rounded-full bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
                    >
                      <a href={d.url}>
                        <Download size={15} /> Download
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Total paid: {money((order.amountTotal ?? 0) / 100)} · Open the DEMO file first — it
              shows everything working before you touch your BLANK copy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
