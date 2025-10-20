alter table public.contractor_profiles
  add column if not exists trade text,
  add column if not exists avg_project_size text,
  add column if not exists trade_seeded boolean not null default false;

create table if not exists public.trade_projects (
  id uuid primary key default gen_random_uuid(),
  trade text not null,
  project_name text not null,
  description text,
  base_price numeric,
  created_at timestamptz not null default now()
);

create index if not exists trade_projects_trade_idx on public.trade_projects(trade);

create table if not exists public.trade_proposals (
  id uuid primary key default gen_random_uuid(),
  trade text not null,
  project_id uuid references public.trade_projects(id) on delete cascade,
  tier text not null check (tier in ('Good', 'Better', 'Best')),
  line_items jsonb not null default '[]'::jsonb,
  total_price numeric,
  created_at timestamptz not null default now()
);

create index if not exists trade_proposals_trade_idx on public.trade_proposals(trade);
create index if not exists trade_proposals_project_idx on public.trade_proposals(project_id);

create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade text not null,
  trade_project_id uuid references public.trade_projects(id),
  project_name text not null,
  description text,
  base_price numeric,
  created_at timestamptz not null default now()
);

create index if not exists user_projects_user_idx on public.user_projects(user_id);
create unique index if not exists user_projects_user_trade_project_idx on public.user_projects(user_id, trade_project_id);

create table if not exists public.user_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_project_id uuid references public.user_projects(id) on delete cascade,
  trade text not null,
  project_name text not null,
  tier text not null check (tier in ('Good', 'Better', 'Best')),
  line_items jsonb not null default '[]'::jsonb,
  total_price numeric,
  created_at timestamptz not null default now()
);

create index if not exists user_proposals_user_idx on public.user_proposals(user_id);
create index if not exists user_proposals_project_idx on public.user_proposals(user_project_id);
create unique index if not exists user_proposals_user_project_tier_idx on public.user_proposals(user_id, user_project_id, tier);

create or replace function public.on_new_contractor()
returns trigger
language plpgsql
security definer
as $$
declare
  edge_url text;
  payload jsonb;
  onboarding_trade text;
begin
  onboarding_trade := coalesce(new.trade, new.trade_type);
  if onboarding_trade is null or onboarding_trade = '' then
    return new;
  end if;
  if coalesce(new.trade_seeded, false) then
    return new;
  end if;
  edge_url := current_setting('supabase.functions.url', true);
  if edge_url is null or edge_url = '' then
    raise warning 'supabase.functions.url is not set';
    return new;
  end if;
  payload := jsonb_build_object(
    'user_id', new.user_id,
    'trade', onboarding_trade
  );
  perform
    net.http_post(
      edge_url || '/seed_trade_projects',
      jsonb_build_object('Content-Type', 'application/json'),
      payload::text
    );
  return new;
end;
$$;

drop trigger if exists trigger_new_contractor on public.contractor_profiles;

create trigger trigger_new_contractor
after insert on public.contractor_profiles
for each row
execute function public.on_new_contractor();
