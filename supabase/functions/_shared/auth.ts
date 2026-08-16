// Resolves the signed-in buyer (if any) from a request's Authorization
// header, using the anon key rather than the service role -- this only
// ever proves who the token belongs to, never grants elevated access.
// Used by paypal-create-order (optional -- guest checkout has no header
// at all) and get-my-orders (required -- see that function).
import { createClient } from "npm:@supabase/supabase-js@2";

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length);
  if (!token) return null;

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );
  const { data, error } = await anonClient.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
