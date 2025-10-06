alter table public.estimates
  add column if not exists approval_token uuid,
  add column if not exists approval_token_expires_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text;

create index if not exists estimates_approval_token_idx on public.estimates(approval_token);
