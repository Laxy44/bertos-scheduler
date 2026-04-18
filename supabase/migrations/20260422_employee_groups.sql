-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Employee groups: simple name + optional default hourly wage per group.
-- Employees optionally belong to one group (filtering + future payroll defaults).

CREATE TABLE IF NOT EXISTS public.employee_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  name text NOT NULL,
  hourly_wage numeric(12, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employee_groups_name_not_empty CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS employee_groups_company_name_lower_uidx
  ON public.employee_groups (company_id, lower(trim(name)));

CREATE INDEX IF NOT EXISTS employee_groups_company_id_idx
  ON public.employee_groups (company_id);

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS employee_group_id uuid REFERENCES public.employee_groups (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS employees_employee_group_id_idx
  ON public.employees (employee_group_id);

ALTER TABLE public.employee_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_groups_select_member" ON public.employee_groups;
CREATE POLICY "employee_groups_select_member"
  ON public.employee_groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.company_id = employee_groups.company_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );

DROP POLICY IF EXISTS "employee_groups_insert_admin" ON public.employee_groups;
CREATE POLICY "employee_groups_insert_admin"
  ON public.employee_groups
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.company_id = employee_groups.company_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "employee_groups_update_admin" ON public.employee_groups;
CREATE POLICY "employee_groups_update_admin"
  ON public.employee_groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.company_id = employee_groups.company_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.company_id = employee_groups.company_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "employee_groups_delete_admin" ON public.employee_groups;
CREATE POLICY "employee_groups_delete_admin"
  ON public.employee_groups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.company_id = employee_groups.company_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND lower(coalesce(m.role, '')) IN ('owner', 'admin')
    )
  );
