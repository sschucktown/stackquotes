-- Stripe integration schema (subscriptions, payments, Connect)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_subscription_id text,
  stripe_checkout_session_id text unique,
  plan_tier text not null,
  status text not null default 'pending',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists subscriptions_user_id_idx
  on public.subscriptions(user_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references auth.users(id) on delete cascade,
  proposal_id uuid references public.smart_proposals(id) on delete set null,
  stripe_payment_intent_id text,
  amount numeric not null,
  type text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_contractor_id_idx
  on public.payments(contractor_id);

create index if not exists payments_proposal_id_idx
  on public.payments(proposal_id);

create unique index if not exists payments_stripe_payment_intent_id_idx
  on public.payments(stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

alter table public.contractor_profiles
  add column if not exists stripe_account_id text,
  add column if not exists stripe_account_status text;

create trigger users_set_updated
  before update on public.users
  for each row
  execute procedure public.touch_updated_at();

create trigger subscriptions_set_updated
  before update on public.subscriptions
  for each row
  execute procedure public.touch_updated_at();

create trigger payments_set_updated
  before update on public.payments
  for each row
  execute procedure public.touch_updated_at();

