-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Per-user daily availability (self-service). Unique per user + company + calendar date.
-- RLS: members manage only their own rows; updates blocked when locked = true.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.typname = 'availability_status'
  ) THEN
    CREATE TYPE public.availability_status AS ENUM ('undecided', 'can_work', 'cannot_work');
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.employee_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  date date NOT NULL,
  status public.availability_status NOT NULL DEFAULT 'undecided',
  notes text,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_availability_user_company_date_uniq UNIQUE (user_id, company_id, date)
);

CREATE INDEX IF NOT EXISTS employee_availability_company_date_idx
  ON public.employee_availability (company_id, date);

CREATE INDEX IF NOT EXISTS employee_availability_user_id_idx
  ON public.employee_availability (user_id);

-- updated_at is set by the app on each write (keeps migration compatible across PG versions).

ALTER TABLE public.employee_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_availability_select_own" ON public.employee_availability;
CREATE POLICY "employee_availability_select_own"
  ON public.employee_availability
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "employee_availability_insert_own_member" ON public.employee_availability;
CREATE POLICY "employee_availability_insert_own_member"
  ON public.employee_availability
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.user_id = auth.uid()
        AND m.company_id = employee_availability.company_id
        AND m.status = 'active'
    )
  );

DROP POLICY IF EXISTS "employee_availability_update_own_unlocked" ON public.employee_availability;
CREATE POLICY "employee_availability_update_own_unlocked"
  ON public.employee_availability
  FOR UPDATE
  USING (auth.uid() = user_id AND locked = false)
  WITH CHECK (auth.uid() = user_id);
