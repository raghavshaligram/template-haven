import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Newsletter({
  compact = false,
  stacked = false,
  className,
}: {
  compact?: boolean;
  stacked?: boolean;
  className?: string;
}) {
  const [email, setEmail] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setEmail("");
    toast.success("You're on the list — check your inbox for the free tracker.");
  }

  return (
    <form onSubmit={submit} className={cn("w-full", className)}>
      {!compact && (
        <p className="mb-3 text-sm text-muted-foreground">
          Join 40,000+ subscribers and get the Free Monthly Expense Tracker plus 15% off your first order.
        </p>
      )}
      <div className={cn("flex flex-col gap-2", !stacked && "sm:flex-row")}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          className="h-11 w-full rounded-full bg-card"
        />
        <Button
          type="submit"
          className={cn(
            "h-11 whitespace-nowrap rounded-full bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90",
            stacked && "w-full",
          )}
        >
          Get the freebie
        </Button>
      </div>
    </form>
  );
}
