create table if not exists public.smart_proposals (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  quickquote_id uuid references public.estimates(id) on delete cascade,
  title text,
  description text,
  line_items jsonb not null default '[]'::jsonb,
  deposit_amount numeric,
  deposit_config jsonb,
  status text not null check (status in ('draft','sent','accepted','paid')) default 'draft',
  public_token uuid unique,
  public_token_expires_at timestamptz,
  sent_at timestamptz,
  accepted_option text,
  payment_link_url text,
  payment_link_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger smart_proposals_set_updated
  before update on public.smart_proposals
  for each row
  execute procedure public.touch_updated_at();

alter table public.smart_proposals enable row level security;

create policy "SmartProposals are only visible to their owner"
  on public.smart_proposals
  for all
  using (auth.uid() = contractor_id)
  with check (auth.uid() = contractor_id);

create index if not exists smart_proposals_contractor_id_idx on public.smart_proposals(contractor_id);
create index if not exists smart_proposals_client_id_idx on public.smart_proposals(client_id);
create index if not exists smart_proposals_quickquote_id_idx on public.smart_proposals(quickquote_id);
create unique index if not exists smart_proposals_public_token_idx on public.smart_proposals(public_token) where public_token is not null;
