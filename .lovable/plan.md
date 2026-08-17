# Fix: PayPal checkout fails to start

## What's happening

Clicking PayPal shows "Something went wrong starting checkout." The backend log for `paypal-create-order` shows PayPal rejecting the order with a 422:

```text
/payment_source/paypal/experience_context/shipping_preference -> INCOMPATIBLE_PARAMETER_VALUE
/application_context/shipping_preference               -> INCOMPATIBLE_PARAMETER_VALUE
```

The order request currently sends the "no shipping needed" setting **twice** — once in the newer `payment_source.paypal.experience_context` block and once in the legacy `application_context` block. PayPal's Orders v2 API refuses orders that contain both; they are treated as redundant/conflicting, so no order is ever created.

## The fix

In `supabase/functions/paypal-create-order/index.ts`, remove the legacy `application_context` block and keep only `payment_source.paypal.experience_context` with `shipping_preference: "NO_SHIPPING"` and `contact_preference: "NO_CONTACT_INFO"`. Update the surrounding comment (it currently explains why both were sent) to note that PayPal rejects the duplicate and that `experience_context` is the supported field.

Then redeploy `paypal-create-order`.

## Note on the guest-card path

The removed `application_context` was there to suppress the shipping page on the "Debit or Credit Card" flow. With current Orders v2, the buttons SDK applies the order-level experience context to that flow too, so no shipping step should appear. After deploy I'll run a sandbox checkout through both the PayPal wallet button and the card button and confirm neither asks for a shipping address; if the card path still prompts, I'll add the card-specific `payment_source.card.experience_context` instead of the deprecated block.

## Verification

- Trigger create-order from the cart drawer and confirm a `orderId` comes back (no 422 in function logs).
- Complete a sandbox purchase end to end: capture succeeds, order marked paid, success page shows download links.
