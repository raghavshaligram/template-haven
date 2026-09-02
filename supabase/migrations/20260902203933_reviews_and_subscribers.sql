-- Real, order-verified reviews + real newsletter subscribers.
--
-- These replace what used to be hardcoded rating_avg/review_count/
-- best_seller numbers on Product and a fabricated Newsletter subscriber
-- count — none of it reflected a real transaction. Same pattern as every
-- other table here: RLS enabled, zero public policies, service-role
-- (edge functions) only.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  -- One review per product per order — a real buyer can review each
  -- product they bought exactly once.
  unique (order_id, product_slug)
);

create index if not exists idx_reviews_product on public.reviews(product_slug);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'newsletter',
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;
alter table public.subscribers enable row level security;
-- Intentionally no policies: only the service role (edge functions) can
-- read/write these — same rule as orders/order_items/download_tokens.
