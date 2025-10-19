alter table public.contractor_profiles
  add column if not exists public_slug text unique;

create unique index if not exists contractor_profiles_public_slug_unique
  on public.contractor_profiles(public_slug)
  where public_slug is not null;
