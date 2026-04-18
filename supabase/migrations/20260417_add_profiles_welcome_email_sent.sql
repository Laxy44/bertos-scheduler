-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;
