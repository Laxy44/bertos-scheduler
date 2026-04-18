-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Richer invite lifecycle: widened status CHECK + optional expiry column and default.

ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_status_check;

ALTER TABLE public.invites
  ADD CONSTRAINT invites_status_check
  CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'));

ALTER TABLE public.invites
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Backfill: invites without expiry get 14 days from creation (only rows still null).
UPDATE public.invites
SET expires_at = created_at + interval '14 days'
WHERE expires_at IS NULL;

ALTER TABLE public.invites
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '14 days');
