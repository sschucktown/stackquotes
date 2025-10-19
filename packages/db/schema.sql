create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.contractor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text,
  owner_name text,
  trade_type text,
  city text,
  state text,
  phone text,
  email text,
  public_slug text unique,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_title text not null,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  notes text,
  status text not null default 'draft',
  converted_to_proposal boolean not null default false,
  job_id text,
  approval_token uuid,
  approval_token_expires_at timestamptz,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_tax_rate numeric not null default 0,
  footer_text text,
  logo_url text,
  company_name text,
  org_id text,
  accent_color text,
  estimate_template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  event text not null,
  token uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quickquote_id uuid references public.estimates(id) on delete cascade,
  options jsonb not null,
  totals jsonb not null,
  status text not null default 'Generated',
  accepted_option text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger estimates_set_updated
  before update on public.estimates
  for each row
  execute procedure public.touch_updated_at();

create trigger user_settings_set_updated
  before update on public.user_settings
  for each row
  execute procedure public.touch_updated_at();

create trigger contractor_profiles_set_updated
  before update on public.contractor_profiles
  for each row
  execute procedure public.touch_updated_at();

alter table public.clients enable row level security;
alter table public.estimates enable row level security;
alter table public.user_settings enable row level security;
alter table public.proposal_events enable row level security;
alter table public.contractor_profiles enable row level security;
alter table public.proposals enable row level security;

create policy "Clients are only visible to their owner"
  on public.clients
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Contractor profiles are only visible to their owner"
  on public.contractor_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Estimates are only visible to their owner"
  on public.estimates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Settings are only visible to their owner"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Proposal events are only visible to their owner"
  on public.proposal_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Proposals are only visible to their owner"
  on public.proposals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists estimates_user_id_idx on public.estimates(user_id);
create index if not exists estimates_status_idx on public.estimates(status);
create index if not exists estimates_approval_token_idx on public.estimates(approval_token);
create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists proposal_events_user_id_idx on public.proposal_events(user_id);
create index if not exists proposal_events_estimate_id_idx on public.proposal_events(estimate_id);
create unique index if not exists proposal_events_token_idx on public.proposal_events(token) where token is not null;
create index if not exists contractor_profiles_user_id_idx on public.contractor_profiles(user_id);
create unique index if not exists contractor_profiles_user_unique on public.contractor_profiles(user_id);
create unique index if not exists contractor_profiles_public_slug_unique on public.contractor_profiles(public_slug) where public_slug is not null;
create index if not exists proposals_user_id_idx on public.proposals(user_id);
create index if not exists proposals_quickquote_id_idx on public.proposals(quickquote_id);
