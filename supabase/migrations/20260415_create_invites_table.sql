-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).

CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'employee',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invites_company_id_idx
  ON public.invites (company_id);

CREATE INDEX IF NOT EXISTS invites_email_status_idx
  ON public.invites (lower(email), status);
