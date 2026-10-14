-- =============================================================================
-- PhantomPip schema
--
-- Access model: the app authenticates users itself (bcrypt + signed session
-- cookie) and talks to Postgres only from server code using the secret
-- (service_role) key. Every table has Row Level Security enabled with NO
-- policies for the anon/authenticated roles, and their table privileges are
-- revoked, so the public (publishable/anon) key can read or write nothing.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- users: one row per account (customers and admins)
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id              text primary key check (id ~ '^usr_[A-Za-z0-9-]+$'),
  email           text not null check (email = lower(btrim(email)) and email <> ''),
  username        text not null,
  password_hash   text not null,
  is_admin        boolean not null default false,
  profile_picture smallint check (profile_picture between 1 and 99),
  created_at      timestamptz not null default now(),
  last_login_at   timestamptz,
  updated_at      timestamptz not null default now()
);

create unique index if not exists users_email_key on public.users (email);
create index if not exists users_created_at_idx on public.users (created_at);
create index if not exists users_is_admin_idx on public.users (is_admin);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- subscriptions: exactly one per user
-- -----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id         text primary key references public.users (id) on delete cascade,
  status          text not null default 'inactive'
                  check (status in ('active', 'expired', 'pending', 'inactive')),
  approval_status text not null default 'none'
                  check (approval_status in ('approved', 'pending', 'rejected', 'none')),
  plan_name       text not null default 'No Plan',
  price_usd       numeric(12, 2) not null default 0 check (price_usd >= 0),
  billing_cycle   text not null default 'monthly'
                  check (billing_cycle in ('monthly', 'lifetime')),
  start_date      date,
  expiry_date     date,
  approved_at     timestamptz,
  updated_at      timestamptz not null default now()
);

create index if not exists subscriptions_status_idx
  on public.subscriptions (status, approval_status);
create index if not exists subscriptions_plan_name_idx on public.subscriptions (plan_name);
create index if not exists subscriptions_expiry_date_idx on public.subscriptions (expiry_date);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- payments: many per user
-- -----------------------------------------------------------------------------
create table if not exists public.payments (
  id              text primary key check (id ~ '^pay_[A-Za-z0-9-]+$'),
  user_id         text not null references public.users (id) on delete cascade,
  amount          numeric(12, 2) not null check (amount >= 0),
  method          text not null check (method in ('BTC', 'BEP20', 'ERC20')),
  network         text not null,
  transaction_ref text not null,
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'rejected')),
  submitted_at    timestamptz not null default now(),
  confirmed_at    timestamptz,
  rejected_at     timestamptz,
  updated_at      timestamptz not null default now()
);

create index if not exists payments_user_submitted_idx
  on public.payments (user_id, submitted_at desc);
create index if not exists payments_status_submitted_idx
  on public.payments (status, submitted_at desc);

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- mt5_accounts: at most one per user (placeholder row until the user connects)
-- -----------------------------------------------------------------------------
create table if not exists public.mt5_accounts (
  user_id        text primary key references public.users (id) on delete cascade,
  login_id       text not null default '',
  password       text not null default '',
  broker_server  text not null default '',
  connected_at   timestamptz,
  is_connected   boolean not null default false,
  is_bot_running boolean not null default false,
  updated_at     timestamptz not null default now()
);

create index if not exists mt5_accounts_connected_idx
  on public.mt5_accounts (is_connected) where is_connected;

drop trigger if exists mt5_accounts_set_updated_at on public.mt5_accounts;
create trigger mt5_accounts_set_updated_at before update on public.mt5_accounts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- platform_settings: single row of admin-editable settings
-- NULL means "not set yet, use the code default".
-- -----------------------------------------------------------------------------
create table if not exists public.platform_settings (
  id                    boolean primary key default true check (id),
  telegram_support_link text,
  crypto_btc_address    text,
  crypto_bep20_address  text,
  crypto_erc20_address  text,
  activation_fee        text,
  updated_at            timestamptz not null default now()
);

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- plans: admin edits to the code-owned plan catalogue (ids come from lib/plans.ts)
-- -----------------------------------------------------------------------------
create table if not exists public.plans (
  id                  text primary key,
  name                text not null,
  price               numeric(12, 2) not null check (price >= 0),
  description         text not null default '',
  recommended_account text not null default '',
  best_for            text not null default '',
  expected_profit     text not null default '',
  features            text[] not null default '{}',
  updated_at          timestamptz not null default now()
);

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- migration_quarantine: source records that could not be imported as-is
-- (e.g. duplicate accounts). Kept for manual review, never read by the app.
-- -----------------------------------------------------------------------------
create table if not exists public.migration_quarantine (
  source_key     text primary key,
  reason         text not null,
  payload        jsonb not null,
  quarantined_at timestamptz not null default now()
);

-- =============================================================================
-- Functions (atomic operations used by lib/server/db.ts)
-- =============================================================================

-- Create a user together with its subscription and MT5 placeholder in one transaction.
create or replace function public.app_create_user(
  p_user jsonb,
  p_subscription jsonb,
  p_mt5 jsonb
) returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.users (id, email, username, password_hash, is_admin, profile_picture, created_at, last_login_at)
  values (
    p_user->>'id',
    lower(btrim(p_user->>'email')),
    p_user->>'username',
    p_user->>'password_hash',
    coalesce((p_user->>'is_admin')::boolean, false),
    (p_user->>'profile_picture')::smallint,
    coalesce((p_user->>'created_at')::timestamptz, now()),
    (p_user->>'last_login_at')::timestamptz
  );

  insert into public.subscriptions (user_id, status, approval_status, plan_name, price_usd, billing_cycle, start_date, expiry_date, approved_at)
  values (
    p_user->>'id',
    coalesce(p_subscription->>'status', 'inactive'),
    coalesce(p_subscription->>'approval_status', 'none'),
    coalesce(p_subscription->>'plan_name', 'No Plan'),
    coalesce((p_subscription->>'price_usd')::numeric, 0),
    coalesce(p_subscription->>'billing_cycle', 'monthly'),
    nullif(p_subscription->>'start_date', '')::date,
    nullif(p_subscription->>'expiry_date', '')::date,
    (p_subscription->>'approved_at')::timestamptz
  );

  insert into public.mt5_accounts (user_id, login_id, password, broker_server, connected_at, is_connected, is_bot_running)
  values (
    p_user->>'id',
    coalesce(p_mt5->>'login_id', ''),
    coalesce(p_mt5->>'password', ''),
    coalesce(p_mt5->>'broker_server', ''),
    (p_mt5->>'connected_at')::timestamptz,
    coalesce((p_mt5->>'is_connected')::boolean, false),
    coalesce((p_mt5->>'is_bot_running')::boolean, false)
  );
end;
$$;

-- Insert a payment; returns false if the payment id already exists (double submit).
create or replace function public.app_create_payment(p_payment jsonb)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  inserted integer;
begin
  insert into public.payments (id, user_id, amount, method, network, transaction_ref, status, submitted_at)
  values (
    p_payment->>'id',
    p_payment->>'user_id',
    (p_payment->>'amount')::numeric,
    p_payment->>'method',
    p_payment->>'network',
    p_payment->>'transaction_ref',
    coalesce(p_payment->>'status', 'pending'),
    coalesce((p_payment->>'submitted_at')::timestamptz, now())
  )
  on conflict (id) do nothing;
  get diagnostics inserted = row_count;
  return inserted > 0;
end;
$$;

-- Approve a pending payment and activate the subscription atomically.
-- Returns the new expiry date, or NULL if the payment is missing / no longer pending.
create or replace function public.app_approve_payment(
  p_payment_id text,
  p_price_usd numeric,
  p_plan_name text,
  p_lifetime_years integer default 100
) returns date
language plpgsql
set search_path = ''
as $$
declare
  v_user_id text;
  v_current_expiry date;
  v_base timestamptz;
  v_expiry date;
begin
  update public.payments
     set status = 'confirmed', confirmed_at = now()
   where id = p_payment_id and status = 'pending'
  returning user_id into v_user_id;

  if v_user_id is null then
    return null;
  end if;

  select expiry_date into v_current_expiry
    from public.subscriptions where user_id = v_user_id for update;

  -- Stack on top of a still-valid expiry, otherwise start from now.
  v_base := greatest(now(), coalesce(v_current_expiry::timestamp at time zone 'utc', now()));
  v_expiry := (v_base + make_interval(years => p_lifetime_years))::date;

  update public.subscriptions
     set status = 'active',
         approval_status = 'approved',
         approved_at = now(),
         start_date = (now() at time zone 'utc')::date,
         billing_cycle = 'lifetime',
         expiry_date = v_expiry,
         plan_name = p_plan_name,
         price_usd = p_price_usd
   where user_id = v_user_id;

  return v_expiry;
end;
$$;

-- Reject a pending payment. If the user is not currently active their
-- subscription is reset. Returns false if the payment is missing / not pending.
create or replace function public.app_reject_payment(p_payment_id text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_user_id text;
begin
  update public.payments
     set status = 'rejected', rejected_at = now()
   where id = p_payment_id and status = 'pending'
  returning user_id into v_user_id;

  if v_user_id is null then
    return false;
  end if;

  update public.subscriptions
     set status = 'inactive',
         approval_status = 'rejected',
         plan_name = 'No Plan',
         price_usd = 0,
         expiry_date = null
   where user_id = v_user_id
     and not (
       status = 'active'
       and approval_status = 'approved'
       and expiry_date is not null
       and expiry_date::timestamp at time zone 'utc' > now()
     );

  return true;
end;
$$;

-- Rename plans on every non-admin subscription. p_renames = {"Old": "New", ...}
create or replace function public.app_rename_plans(p_renames jsonb)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  affected integer;
begin
  update public.subscriptions s
     set plan_name = r.value
    from jsonb_each_text(p_renames) r, public.users u
   where s.plan_name = r.key
     and r.key <> r.value
     and r.value <> ''
     and u.id = s.user_id
     and not u.is_admin;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- Save platform settings and plan edits in one transaction.
create or replace function public.app_save_settings(p_settings jsonb, p_plans jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.platform_settings as ps
    (id, telegram_support_link, crypto_btc_address, crypto_bep20_address, crypto_erc20_address, activation_fee)
  values (
    true,
    p_settings->>'telegram_support_link',
    p_settings->>'crypto_btc_address',
    p_settings->>'crypto_bep20_address',
    p_settings->>'crypto_erc20_address',
    p_settings->>'activation_fee'
  )
  on conflict (id) do update set
    telegram_support_link = excluded.telegram_support_link,
    crypto_btc_address    = excluded.crypto_btc_address,
    crypto_bep20_address  = excluded.crypto_bep20_address,
    crypto_erc20_address  = excluded.crypto_erc20_address,
    activation_fee        = excluded.activation_fee;

  if p_plans is not null then
    insert into public.plans as p
      (id, name, price, description, recommended_account, best_for, expected_profit, features)
    select key,
           value->>'name',
           (value->>'price')::numeric,
           coalesce(value->>'description', ''),
           coalesce(value->>'recommendedAccount', ''),
           coalesce(value->>'bestFor', ''),
           coalesce(value->>'expectedProfit', ''),
           coalesce(array(select jsonb_array_elements_text(value->'features')), '{}')
      from jsonb_each(p_plans)
    on conflict (id) do update set
      name                = excluded.name,
      price               = excluded.price,
      description         = excluded.description,
      recommended_account = excluded.recommended_account,
      best_for            = excluded.best_for,
      expected_profit     = excluded.expected_profit,
      features            = excluded.features;
  end if;
end;
$$;

-- Admin dashboard figures in a single query.
-- Date semantics mirror the app: an expiry date means midnight UTC of that day.
create or replace function public.app_admin_stats()
returns jsonb
language sql
stable
set search_path = ''
as $$
  with base as (
    select s.status,
           s.approval_status,
           (s.expiry_date::timestamp at time zone 'utc') as expiry_ts,
           coalesce(m.is_connected, false) as mt5_connected
      from public.users u
      join public.subscriptions s on s.user_id = u.id
      left join public.mt5_accounts m on m.user_id = u.id
     where not u.is_admin
  ),
  classified as (
    select *,
           (expiry_ts is null or expiry_ts < now()) as is_expired,
           (status = 'active' and approval_status = 'approved'
             and expiry_ts is not null and expiry_ts >= now()) as is_active
      from base
  )
  select jsonb_build_object(
    'totalUsers',            count(*),
    'activeUsers',           count(*) filter (where is_active),
    'activeSubscriptions',   count(*) filter (where is_active),
    'expiringSubscriptions', count(*) filter (
                               where is_active
                                 and ceil(extract(epoch from (expiry_ts - now())) / 86400) between 1 and 7),
    'pendingApprovalUsers',  count(*) filter (where not is_active and approval_status = 'pending'),
    'expiredUsers',          count(*) filter (where not is_active and approval_status <> 'pending' and is_expired),
    'mt5ConnectedUsers',     count(*) filter (where mt5_connected),
    'totalRevenue',          coalesce((
                               select sum(p.amount)
                                 from public.payments p
                                 join public.users u on u.id = p.user_id
                                where p.status = 'confirmed' and not u.is_admin), 0)
  )
  from classified;
$$;

-- =============================================================================
-- Security: RLS on, no client access
-- =============================================================================
alter table public.users                enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.payments             enable row level security;
alter table public.mt5_accounts         enable row level security;
alter table public.platform_settings    enable row level security;
alter table public.plans                enable row level security;
alter table public.migration_quarantine enable row level security;

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
grant  execute on all functions in schema public to service_role;
grant  all     on all tables    in schema public to service_role;

-- Tables created later must not leak to client roles either.
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
