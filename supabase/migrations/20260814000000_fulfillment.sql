-- Fulfillment schema: orders, line items, and expiring download tokens.
-- All tables are service-role only (RLS enabled, no public policies) —
-- the storefront never talks to the database directly, only via edge functions.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  email text,
  amount_total integer,          -- cents
  currency text not null default 'usd',
  status text not null default 'pending',  -- pending | paid | refunded
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  colorway text,
  unit_amount integer not null,  -- cents
  quantity integer not null default 1
);

create table if not exists public.download_tokens (
  token uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  file_key text not null,        -- path inside the product-files bucket
  expires_at timestamptz not null,
  max_downloads integer not null default 25,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_tokens_order on public.download_tokens(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.download_tokens enable row level security;
-- Intentionally no policies: only the service role (edge functions) can read/write.

-- Private bucket for the product ZIPs. Upload files as <file_key> e.g.
-- smart-budget-spreadsheet.zip . insert is idempotent for re-runs.
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;
