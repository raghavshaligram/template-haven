// GET ?token=<uuid> — validate an order's download token, count the download,
// and redirect to a short-lived signed URL for the private file.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/http.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

function page(title: string, body: string, status = 400): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
      `<div style="max-width:480px;margin:80px auto;font-family:Arial,sans-serif;color:#23262F;text-align:center">` +
      `<h1 style="font-size:20px">${title}</h1><p style="color:#6b7280;font-size:14px">${body}</p></div>`,
    { status, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
  );
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token");
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return page("Invalid link", "This download link looks malformed. Check the link in your email.");
  }

  const { data: t, error } = await supabase
    .from("download_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !t) {
    return page("Link not found", "This download link doesn't exist. Contact us with your order email and we'll help.");
  }
  if (new Date(t.expires_at).getTime() < Date.now()) {
    return page("Link expired", "This link has expired. Reply to your order email and we'll send a fresh one.");
  }
  if (t.download_count >= t.max_downloads) {
    return page("Download limit reached", "This link hit its download limit. Reply to your order email and we'll reset it.");
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from("product-files")
    .createSignedUrl(t.file_key, 300, { download: true });

  if (signErr || !signed?.signedUrl) {
    console.error("sign error:", signErr);
    return page("File unavailable", "We couldn't fetch your file just now. Try again in a minute.", 500);
  }

  await supabase
    .from("download_tokens")
    .update({ download_count: t.download_count + 1 })
    .eq("token", token);

  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: signed.signedUrl },
  });
});
