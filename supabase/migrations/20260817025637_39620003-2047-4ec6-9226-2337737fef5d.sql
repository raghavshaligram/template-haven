alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_orders_user on public.orders(user_id);

grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select on public.download_tokens to authenticated;

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.user_id = auth.uid()
  ));

drop policy if exists "Users can view their own download tokens" on public.download_tokens;
create policy "Users can view their own download tokens"
  on public.download_tokens for select to authenticated
  using (exists (
    select 1 from public.orders
    where orders.id = download_tokens.order_id and orders.user_id = auth.uid()
  ));