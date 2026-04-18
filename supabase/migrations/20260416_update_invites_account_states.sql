-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Normalizes legacy invite status values. Constraint (2- vs 4-state) depends on whether
-- `expires_at` exists (migration 20260419); avoids re-adding a narrow CHECK after `expired`/`revoked` rows exist.

ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_status_check;

UPDATE public.invites
SET status = 'pending'
WHERE status IN ('invited', 'pending_verification');

UPDATE public.invites
SET status = 'accepted'
WHERE status = 'active';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'invites'
      AND column_name = 'expires_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND t.relname = 'invites'
        AND c.conname = 'invites_status_check'
    ) THEN
      ALTER TABLE public.invites
        ADD CONSTRAINT invites_status_check
        CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'));
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      JOIN pg_namespace n ON t.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND t.relname = 'invites'
        AND c.conname = 'invites_status_check'
    ) THEN
      ALTER TABLE public.invites
        ADD CONSTRAINT invites_status_check
        CHECK (status IN ('pending', 'accepted'));
    END IF;
  END IF;
END;
$$;

ALTER TABLE public.invites
  ALTER COLUMN status SET DEFAULT 'pending';
