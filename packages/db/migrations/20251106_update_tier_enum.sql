BEGIN;

-- Create new enum with updated values
DO $$
BEGIN
  CREATE TYPE tier_v2 AS ENUM ('launch', 'pro', 'crew');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

-- Ensure column exists before altering
ALTER TABLE public.users
  ALTER COLUMN subscription_tier DROP DEFAULT;

-- Migrate existing values and switch to new enum
ALTER TABLE public.users
  ALTER COLUMN subscription_tier TYPE tier_v2
  USING (
    CASE
      WHEN subscription_tier::text = 'free' THEN 'launch'::tier_v2
      WHEN subscription_tier::text = 'pro' THEN 'pro'::tier_v2
      WHEN subscription_tier::text = 'crew' THEN 'crew'::tier_v2
      ELSE 'launch'::tier_v2
    END
  );

ALTER TABLE public.users
  ALTER COLUMN subscription_tier SET DEFAULT 'launch';

-- Drop old type if present and rename new type to canonical name
DO $$
BEGIN
  -- Drop original type if exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tier') THEN
    DROP TYPE tier;
  END IF;
END;
$$;

ALTER TYPE tier_v2 RENAME TO tier;

COMMIT;

