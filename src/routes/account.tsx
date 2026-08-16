import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Download, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { fetchMyOrders, type MyOrder } from "@/lib/checkout";
import { money } from "@/data/shop";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account & Downloads — Ledger&Leaf" },
      {
        name: "description",
        content: "Sign in to re-download your purchased spreadsheet templates any time.",
      },
      { property: "og:title", content: "Account & Downloads — Ledger&Leaf" },
      { property: "og:description", content: "Re-download your purchased templates any time." },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, loading, openAuthModal, signOut } = useAuth();

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-page flex justify-center py-20">
        <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-soft">
          <h1 className="font-display text-3xl">Your downloads</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to see your past orders and re-download your templates any time — or find them
            again from the link we emailed you at checkout.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              onClick={() => openAuthModal("sign-in")}
              className="h-11 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              onClick={() => openAuthModal("sign-up")}
              className="h-11 rounded-full"
            >
              Create an account
            </Button>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Accounts are optional — you can always check out as a guest.
          </p>
        </div>
      </div>
    );
  }

  return <OrderHistory email={user.email ?? ""} onSignOut={signOut} />;
}

function OrderHistory({ email, onSignOut }: { email: string; onSignOut: () => Promise<void> }) {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your orders");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Your downloads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
        </div>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {!error && orders === null && (
          <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your orders…
          </div>
        )}

        {orders?.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card py-16 text-center shadow-soft">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No orders yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Templates you buy while signed in will show up here, ready to re-download any time.
            </p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.orderId} className="rounded-2xl bg-card p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Order #{order.orderId.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    {order.amountTotal != null && (
                      <span className="text-sm font-semibold text-foreground">
                        {money(order.amountTotal / 100)}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mt-4 space-y-3">
                  {order.items.map((item) => {
                    const download = order.downloads.find(
                      (d) => d.productSlug === item.productSlug,
                    );
                    const expired = download ? new Date(download.expiresAt) < new Date() : true;
                    return (
                      <li
                        key={`${order.orderId}-${item.productSlug}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.colorway ? `${item.colorway} · ` : ""}Qty {item.quantity}
                          </p>
                        </div>
                        {download && !expired ? (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="shrink-0 gap-1.5 rounded-full"
                          >
                            <a href={download.url}>
                              <Download size={14} /> Download
                            </a>
                          </Button>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {order.status === "refunded" ? "Refunded" : "Link expired"}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-accent/12 text-accent",
    refunded: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        styles[status] ?? "bg-secondary text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
