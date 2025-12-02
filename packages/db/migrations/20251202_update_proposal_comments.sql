-- SmartProposal v2 comment model
create extension if not exists "uuid-ossp";

-- Ensure base table exists with the required shape
create table if not exists public.proposal_comments (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid not null references public.smart_proposals(id) on delete cascade,
  author_type text not null check (author_type in ('client','contractor')),
  author_id uuid null,
  author_role text check (author_role in ('contractor','client')),
  author_name text,
  avatar_url text,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill/patch columns for existing deployments
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'proposal_comments' and column_name = 'author_type'
  ) then
    alter table public.proposal_comments add column author_type text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'proposal_comments' and column_name = 'author_id'
  ) then
    alter table public.proposal_comments add column author_id uuid null;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'proposal_comments' and column_name = 'updated_at'
  ) then
    alter table public.proposal_comments add column updated_at timestamptz not null default now();
    update public.proposal_comments set updated_at = coalesce(created_at, now()) where updated_at is null;
  end if;
end $$;

-- Align defaults and constraints
alter table public.proposal_comments
  alter column id set default uuid_generate_v4();
alter table public.proposal_comments
  alter column author_type drop default;

update public.proposal_comments
set author_type = coalesce(author_type, author_role, 'client')
where author_type is null;

alter table public.proposal_comments
  alter column author_type set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'proposal_comments_author_type_check'
  ) then
    alter table public.proposal_comments
      add constraint proposal_comments_author_type_check
      check (author_type in ('client','contractor'));
  end if;
end $$;

-- Keep author_type in sync for legacy writers that only set author_role
create or replace function public.set_proposal_comment_author_type()
returns trigger as $$
begin
  new.author_type := coalesce(new.author_type, new.author_role, 'client');
  return new;
end;
$$ language plpgsql;

drop trigger if exists proposal_comments_set_author_type on public.proposal_comments;
create trigger proposal_comments_set_author_type
  before insert on public.proposal_comments
  for each row
  execute procedure public.set_proposal_comment_author_type();

-- Indexes for fast lookups and ordering
create index if not exists idx_proposal_comments_proposal_id
  on public.proposal_comments (proposal_id);

create index if not exists idx_proposal_comments_created_at
  on public.proposal_comments (created_at);

-- Keep updated_at current on edits
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'proposal_comments_set_updated'
  ) then
    create trigger proposal_comments_set_updated
      before update on public.proposal_comments
      for each row
      execute procedure public.touch_updated_at();
  end if;
end $$;
