BEGIN;

-- Tier enum used for subscription tiers
DO $$
BEGIN
  CREATE TYPE tier AS ENUM ('free', 'pro');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier tier NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_end timestamptz,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS addons jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS fee_percent numeric(5, 2),
  ADD COLUMN IF NOT EXISTS is_milestone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_financed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_status text;

CREATE TABLE IF NOT EXISTS public.financing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  provider text NOT NULL,
  kind text NOT NULL,
  amount_cents bigint,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
