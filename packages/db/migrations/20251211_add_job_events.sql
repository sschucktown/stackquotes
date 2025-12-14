create extension if not exists "pgcrypto";

create table if not exists public.job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  type text not null,
  actor text not null check (actor in ('system', 'contractor', 'client')),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists job_events_job_id_created_at_idx
  on public.job_events(job_id, created_at desc);
