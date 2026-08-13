import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <div className="container-page flex justify-center py-20">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-soft">
        <h1 className="font-display text-3xl">Your downloads</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the email you used at checkout to grab your files again.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast("Accounts aren't connected yet", {
              description: "Ask me to enable logins and I'll set up secure accounts.",
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-full bg-accent font-semibold text-accent-foreground hover:bg-accent/90"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
