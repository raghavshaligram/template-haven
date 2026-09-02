// POST {email} — the real mechanism behind what used to be a hardcoded
// "Join 40,000+ subscribers" line with no backing list at all. Idempotent:
// re-subscribing the same address is a no-op, not an error.
import { createClient } from "npm:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let input: { email?: string };
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const { error } = await supabase
    .from("subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("newsletter-subscribe: upsert failed:", error);
    return json({ error: "Could not subscribe right now" }, 500);
  }

  return json({ ok: true });
});
