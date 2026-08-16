-- Optional accounts: link an order to the buyer who was signed in when
-- they checked out, so they can see order history and re-download without
-- hunting for the emailed link. Guest checkout keeps working exactly as
-- before -- user_id is nullable and only ever set when the buyer happened
-- to have a session at checkout time; nothing here requires an account.
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_orders_user on public.orders(user_id);

-- Defense in depth: these let a signed-in buyer read their own rows
-- directly (orders/order_items/download_tokens already have RLS enabled
-- with zero policies, service-role-only). The account page actually goes
-- through the get-my-orders edge function rather than querying these
-- directly, but there's no reason the same data shouldn't also be safe to
-- read straight from the client with the buyer's own session.
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can view their own order items"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

create policy "Users can view their own download tokens"
  on public.download_tokens for select
  using (exists (
    select 1 from public.orders
    where orders.id = download_tokens.order_id and orders.user_id = auth.uid()
  ));
