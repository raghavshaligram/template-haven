# Fulfillment setup — your own checkout & delivery

The repo contains a complete self-owned fulfillment system (your own
"Lemon Squeezy"): PayPal Checkout → order recorded → expiring download
tokens → buyer emailed links → files served from private storage. Same
PayPal Orders API v2 pattern used on balanceextract.com, adapted for guest
checkout — anyone with a cart can pay without an account, same trust model
Stripe had. Accounts are optional on top of that: a buyer can sign in
(email/password or Google) before or during checkout to get order history
and re-download access at `/account`; if they don't, they check out exactly
as before and get their files by email link only.

Everything is code. One-time setup below (~20 minutes), then every new
product only needs its ZIP uploaded and one catalog entry.

## How it works

```
Buy now / Checkout ──> /checkout page ──> PayPal Buttons render inline
                          │ createOrder ──> paypal-create-order (edge fn)
                          │                  ├─ creates the PayPal order
                          │                  └─ orders + order_items rows (status: pending)
                          │ buyer approves on PayPal
                          │ onApprove ──> paypal-capture-order (edge fn)
                          │                  ├─ captures the payment
                          │                  └─ fulfillOrder(): tokens + email
PayPal ── PAYMENT.CAPTURE.COMPLETED ──> paypal-webhook (edge fn)
                                           └─ fulfillOrder() again (idempotent —
                                              a no-op if capture-order already ran it;
                                              the safety net if its response never
                                              made it back to the browser)
Buyer ── /checkout/success ──> get-order (edge fn) ──> links shown on site
Buyer ── clicks link ──> download (edge fn) ──> signed URL ──> file
```

Prices are enforced server-side in `supabase/functions/_shared/catalog.ts` —
the browser only sends product slugs, so no one can tamper with amounts.
`fulfillOrder` (in `supabase/functions/_shared/fulfill.ts`) is idempotent:
whichever of capture-order/webhook lands first mints the tokens and sends
the email; the other becomes a no-op on the same order.

## One-time setup

1. **Enable Lovable Cloud** for this project (Lovable → your project →
   enable Cloud). This provisions the Supabase backend and auto-deploys
   everything in `supabase/` on your next push: the migration (tables +
   private `product-files` bucket) and the four PayPal edge functions.

2. **PayPal** (developer.paypal.com → Apps & Credentials, start in
   *Sandbox*):
   - Create a Sandbox app (or use the Default Application). Copy its
     **Client ID** and **Secret**.
   - Add secrets in Lovable Cloud → Settings → Secrets:
     `PAYPAL_ENV` = `sandbox`, `PAYPAL_CLIENT_ID_SANDBOX`,
     `PAYPAL_CLIENT_SECRET_SANDBOX`.
   - Sandbox → Apps & Credentials → your app → **Webhooks** → Add webhook:
     `https://<your-project-ref>.supabase.co/functions/v1/paypal-webhook`,
     subscribed to `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`,
     `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`,
     `PAYMENT.CAPTURE.REVERSED`. Copy the **Webhook ID** → add secret
     `PAYPAL_WEBHOOK_ID_SANDBOX`.
     (`CHECKOUT.ORDER.APPROVED` matters: it's the server-side safety net
     that captures a sale whose browser return leg never completed —
     e.g. PayPal ran as a full-page redirect and the buyer closed the
     tab. Without it that approval would just never become a payment.)

3. **Resend** (resend.com, free tier is plenty to start):
   - Add secret `RESEND_API_KEY`.
   - Optional: verify your domain and set secret `EMAIL_FROM`, e.g.
     `ReadyTrackers <orders@yourdomain.com>`. Until then emails send from
     the Resend sandbox address.

4. **Accounts** (optional — checkout works without doing this, but the
   "Sign in" prompts in the cart drawer and `/account` won't until you do):
   - Email/password is on by default in every Supabase project — nothing
     to configure. If you'd rather buyers confirm their email before their
     first sign-in counts, toggle it under Authentication → Sign In /
     Providers → Email → "Confirm email".
   - **Google**: in [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
     create an OAuth 2.0 Client ID (type: Web application). Add
     `https://<your-project-ref>.supabase.co/auth/v1/callback` as an
     authorized redirect URI. Copy the Client ID and Secret into Lovable
     Cloud → Authentication → Providers → Google, and toggle it on.
   - **Site URL**: Authentication → URL Configuration → set Site URL to
     your real domain, and add it (and any preview domains) under
     Redirect URLs — Google sign-in and email confirmation links both
     bounce through this.

5. **Upload product files**: Lovable Cloud → Storage → `product-files`
   bucket → upload each ZIP named exactly as its `fileKey` in
   `supabase/functions/_shared/catalog.ts` (e.g.
   `smart-budget-spreadsheet.zip`).

6. **Test in PayPal Sandbox**: developer.paypal.com → Sandbox → Accounts
   gives you a test buyer login (email + password). Go through checkout
   on your deployed site and pay with that sandbox buyer. Confirm: success
   page shows downloads, email arrives, link downloads the ZIP, and the
   order row appears in the `orders` table. If you signed in first, also
   confirm the order shows up at `/account`.

7. **Go live**: create a Live app in the same PayPal dashboard, add
   `PAYPAL_CLIENT_ID_LIVE`, `PAYPAL_CLIENT_SECRET_LIVE`, register a second
   webhook pointed at the same URL for the live app and add
   `PAYPAL_WEBHOOK_ID_LIVE`, then flip `PAYPAL_ENV` to `live`.

## Adding a new product (per-product routine)

1. Add the product to `src/data/shop.ts` (page copy, images, price).
2. Add a matching entry in `supabase/functions/_shared/catalog.ts`
   (slug → name, priceCents, fileKey). **Keep prices in sync.**
3. Upload `<fileKey>.zip` to the `product-files` bucket.
4. Push. Done — checkout, delivery and emails work automatically.

## Support operations (no admin panel needed)

- **Orders**: Lovable Cloud → Database → `orders` / `order_items`.
- **Resend a link**: find the order, copy its token from
  `download_tokens`, send `…/functions/v1/download?token=<token>`;
  or extend `expires_at` / raise `max_downloads` on the row.
- **Refunds**: refund in the PayPal dashboard — the webhook automatically
  marks the order `refunded` and expires its download tokens, so the
  links stop working. To do it manually, set the order's `status` to
  `refunded` and set `expires_at = now()` on its `download_tokens` rows.
- **Update a file**: replace the object in the bucket — all existing
  links serve the new file immediately.

## Notes & limits

- Free products bypass checkout by design (grab-the-file flow can be
  added later as a newsletter-gated link).
- The download page responses are plain HTML (expired/limit messages),
  branded minimally — fine for v1.
- Guest checkout, same trust model the Stripe flow had: there are no
  buyer accounts, so anyone who completes an order's PayPal approval can
  trigger its capture. What's actually protected server-side is the
  price (from `catalog.ts`, never the client) and fulfillment only ever
  running for an order this site itself created.
