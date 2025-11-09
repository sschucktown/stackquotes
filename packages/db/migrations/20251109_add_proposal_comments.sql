-- Create table for public proposal comments
create table if not exists public.proposal_comments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  author_role text not null check (author_role in ('contractor','client')),
  author_name text,
  avatar_url text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Helpful index for ordered reads per proposal
create index if not exists idx_proposal_comments_proposal_created_at
  on public.proposal_comments (proposal_id, created_at);

-- Enable RLS (optional; service role bypasses policies)
alter table public.proposal_comments enable row level security;

