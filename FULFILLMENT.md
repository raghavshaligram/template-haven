# Fulfillment setup — your own checkout & delivery

The repo contains a complete self-owned fulfillment system (your own
"Lemon Squeezy"): Stripe Checkout → webhook → order recorded → expiring
download tokens → buyer emailed links → files served from private storage.

Everything is code. One-time setup below (~20 minutes), then every new
product only needs its ZIP uploaded and one catalog entry.

## How it works

```
Buy now / Checkout ──> create-checkout (edge fn) ──> Stripe Checkout page
                                                          │  pays
Stripe ── checkout.session.completed ──> stripe-webhook (edge fn)
                                           ├─ orders + order_items rows
                                           ├─ download_tokens (30 days / 25 uses)
                                           └─ Resend email with links
Buyer ── /checkout/success ──> get-order (edge fn) ──> links shown on site
Buyer ── clicks link ──> download (edge fn) ──> signed URL ──> file
```

Prices are enforced server-side in `supabase/functions/_shared/catalog.ts` —
the browser only sends product slugs, so no one can tamper with amounts.

## One-time setup

1. **Enable Lovable Cloud** for this project (Lovable → your project →
   enable Cloud). This provisions the Supabase backend and auto-deploys
   everything in `supabase/` on your next push: the migration (tables +
   private `product-files` bucket) and the four edge functions.

2. **Stripe** (stripe.com → Developers → API keys, start in *test mode*):
   - Add secret `STRIPE_SECRET_KEY` (sk_test_… for now) in Lovable Cloud →
     Settings → Secrets.
   - Developers → Webhooks → Add endpoint:
     `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`
     with the single event `checkout.session.completed`.
   - Copy the webhook signing secret → add secret `STRIPE_WEBHOOK_SECRET`.

3. **Resend** (resend.com, free tier is plenty to start):
   - Add secret `RESEND_API_KEY`.
   - Optional: verify your domain and set secret `EMAIL_FROM`, e.g.
     `Ledger&Leaf <orders@yourdomain.com>`. Until then emails send from
     the Resend sandbox address.

4. **Site URL**: add secret `SITE_URL` = your deployed site origin
   (e.g. `https://ledgerandleaf.com`). Used for checkout redirects.

5. **Upload product files**: Lovable Cloud → Storage → `product-files`
   bucket → upload each ZIP named exactly as its `fileKey` in
   `supabase/functions/_shared/catalog.ts` (e.g.
   `smart-budget-spreadsheet.zip`).

6. **Test in Stripe test mode**: buy something with card
   `4242 4242 4242 4242`, any future expiry/CVC. Confirm: success page
   shows downloads, email arrives, link downloads the ZIP, and the order
   row appears in the `orders` table. Then swap `STRIPE_SECRET_KEY` +
   webhook to live-mode values.

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
- **Refunds**: refund in the Stripe dashboard; optionally set the order's
  `status` to `refunded`.
- **Update a file**: replace the object in the bucket — all existing
  links serve the new file immediately.

## Notes & limits

- Free products bypass checkout by design (grab-the-file flow can be
  added later as a newsletter-gated link).
- The download page responses are plain HTML (expired/limit messages),
  branded minimally — fine for v1.
- `automatic_tax` is off. If/when you cross tax thresholds, flip
  `automatic_tax: { enabled: true }` in `create-checkout` and configure
  Stripe Tax.
