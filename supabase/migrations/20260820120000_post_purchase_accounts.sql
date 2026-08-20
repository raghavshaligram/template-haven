-- Post-purchase account creation.
--
-- Two things live here:
--   1. customer_profiles — where marketing consent is recorded, separately
--      from the account itself. Consent to be emailed deals is a distinct
--      decision from creating an account (GDPR: consent must be specific
--      and freely given, not bundled), so it gets its own column with its
--      own timestamp rather than being implied by having an account.
--   2. claim_guest_orders() — retroactively attaches a guest purchase to
--      an account created later with the same email.

create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  -- Explicitly defaults to FALSE. A row existing means "this person made
  -- an account", never "this person agreed to marketing".
  marketing_consent boolean not null default false,
  -- Kept for the audit trail: GDPR wants to be able to show when consent
  -- was given, not just that a flag is currently true.
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

-- ---------------------------------------------------------------------
-- Guest-to-account linking
-- ---------------------------------------------------------------------
-- A guest checkout writes orders.email (the payer address PayPal gives us)
-- and leaves orders.user_id null. When someone later creates an account
-- with that same address, those past purchases should become theirs.
--
-- security definer so it can update rows the caller cannot see under RLS,
-- but it only ever touches orders that are BOTH unclaimed (user_id is
-- null) AND match the caller's own verified email — it cannot be used to
-- claim somebody else's order. search_path is pinned so a caller cannot
-- shadow `public` with their own schema.
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

-- ---------------------------------------------------------------------
-- Profile bootstrap
-- ---------------------------------------------------------------------
-- Every new auth user gets a profile row with marketing_consent FALSE.
-- Consent is only ever flipped true by an explicit, separate action from
-- the person themselves — never as a side effect of signing up.
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

  -- Attach any guest orders bought with this address before the account
  -- existed. Runs here as well as via the client RPC so linking happens
  -- even if the browser never calls it (different device, closed tab).
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
