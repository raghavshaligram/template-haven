create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  email text,
  amount_total integer,
  currency text not null default 'usd',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  colorway text,
  unit_amount integer not null,
  quantity integer not null default 1
);

create table if not exists public.download_tokens (
  token uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  file_key text not null,
  expires_at timestamptz not null,
  max_downloads integer not null default 25,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_tokens_order on public.download_tokens(order_id);

grant all on public.orders to service_role;
grant all on public.order_items to service_role;
grant all on public.download_tokens to service_role;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.download_tokens enable row level security;