-- Add onboarding and progress flags to contractor_profiles
alter table if exists public.contractor_profiles
  add column if not exists onboarding_complete boolean default false,
  add column if not exists profile_complete boolean default false,
  add column if not exists stripe_connected boolean default false,
  add column if not exists quickquotes_count integer default 0;

