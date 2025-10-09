create table if not exists public.proposal_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  event text not null,
  token uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.proposal_events enable row level security;

create policy "Proposal events are only visible to their owner"
  on public.proposal_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists proposal_events_user_id_idx on public.proposal_events(user_id);
create index if not exists proposal_events_estimate_id_idx on public.proposal_events(estimate_id);
create unique index if not exists proposal_events_token_idx on public.proposal_events(token) where token is not null;
