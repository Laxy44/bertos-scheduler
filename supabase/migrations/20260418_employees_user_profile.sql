-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Link employees to auth users and store contact fields for profile / HR flows.

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS phone text;

CREATE UNIQUE INDEX IF NOT EXISTS employees_company_user_id_uidx
  ON public.employees (company_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS employees_user_id_idx
  ON public.employees (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS employees_company_email_idx
  ON public.employees (company_id, lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;
