ALTER TABLE public.contractor_profiles
ADD COLUMN IF NOT EXISTS postal_code text;

-- Purpose: enable SupplyLink and PermitSync to use regional data.

