import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a passwordless sign-in link. No password is ever set or stored —
 * clicking the emailed link both creates the account (first time) and
 * signs the person in.
 *
 * `shouldCreateUser: true` is what makes this double as sign-up, so a
 * first-time buyer doesn't have to register separately before they can
 * be sent a link.
 */
export async function sendMagicLink(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });
  if (error) throw error;
}

/**
 * Records marketing consent for the signed-in customer.
 *
 * Only ever called with an explicit true from a checkbox the person
 * ticked themselves. Stamps the time alongside it so there's an audit
 * trail of when consent was given, which is what GDPR actually asks you
 * to be able to demonstrate.
 */
export async function setMarketingConsent(consent: boolean): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("customer_profiles")
    .update({
      marketing_consent: consent,
      marketing_consent_at: consent ? new Date().toISOString() : null,
    })
    .eq("user_id", user.id);
  if (error) throw error;
}

/**
 * Attaches any past guest purchases made with this account's email.
 *
 * A database trigger already does this the moment the account is created,
 * so this is the belt-and-braces second pass for the case where an order
 * lands (or is fulfilled) after signup. Idempotent and safe to call on
 * every sign-in: it only touches orders that are still unclaimed and
 * match the caller's own verified address.
 *
 * Returns how many orders were newly attached.
 */
export async function claimGuestOrders(): Promise<number> {
  const { data, error } = await supabase.rpc("claim_guest_orders");
  if (error) {
    // Not fatal — the trigger is the primary path, and the account page
    // still works. Log rather than breaking the sign-in.
    console.error("claim_guest_orders failed:", error);
    return 0;
  }
  return typeof data === "number" ? data : 0;
}
