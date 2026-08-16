-- Swap the payment provider from Stripe to PayPal.
--
-- orders.stripe_session_id was the unique key tying a Stripe Checkout
-- Session to our order row. PayPal's equivalent is its own Order id
-- (Orders API v2), so the column is renamed rather than dropped+recreated
-- -- this preserves the existing unique/not-null constraint and any rows
-- already written by the Stripe flow.
alter table public.orders rename column stripe_session_id to provider_order_id;

-- Explicit provider tag, mainly for clarity/future-proofing if a second
-- provider is ever added back — every row from here on is 'paypal'.
alter table public.orders add column if not exists provider text not null default 'paypal';
