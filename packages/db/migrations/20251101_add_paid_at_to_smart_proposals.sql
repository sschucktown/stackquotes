alter table public.smart_proposals
  add column if not exists paid_at timestamptz;

