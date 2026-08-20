create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_customer_profiles_email on public.customer_profiles (lower(email));

alter table public.customer_profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.customer_profiles;
create policy "Users can view their own profile"
  on public.customer_profiles for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.customer_profiles;
create policy "Users can update their own profile"
  on public.customer_profiles for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, update on public.customer_profiles to authenticated;
grant all on public.customer_profiles to service_role;

create or replace function public.claim_guest_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  caller_email text;
  claimed integer;
begin
  if caller is null then
    return 0;
  end if;

  select email into caller_email from auth.users where id = caller;
  if caller_email is null then
    return 0;
  end if;

  update public.orders
     set user_id = caller
   where user_id is null
     and email is not null
     and lower(email) = lower(caller_email);

  get diagnostics claimed = row_count;
  return claimed;
end;
$$;

revoke all on function public.claim_guest_orders() from public;
grant execute on function public.claim_guest_orders() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;

  update public.orders
     set user_id = new.id
   where user_id is null
     and email is not null
     and lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();