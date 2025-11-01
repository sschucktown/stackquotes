BEGIN;

-- Ensure trial_end defaults to now() + 14 days for new users
ALTER TABLE public.users
  ALTER COLUMN trial_end SET DEFAULT (now() + interval '14 days');

-- Add an explicit enum value to mark expired trials (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'tier' AND e.enumlabel = 'expired_trial'
  ) THEN
    ALTER TYPE tier ADD VALUE 'expired_trial';
  END IF;
END;
$$;

COMMIT;

