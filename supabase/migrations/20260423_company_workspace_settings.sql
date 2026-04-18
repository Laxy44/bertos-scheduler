-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Minimal workspace configuration (general, schedule JSON, payroll defaults).

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Copenhagen';

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS week_starts_on text DEFAULT 'monday';

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'DKK';

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS default_hourly_wage numeric(12, 2);

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS workspace_settings jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_week_starts_on_check;

ALTER TABLE public.companies
  ADD CONSTRAINT companies_week_starts_on_check
  CHECK (week_starts_on IS NULL OR lower(week_starts_on) IN ('monday', 'sunday'));
