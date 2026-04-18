-- Idempotent: safe to re-run manually (no DROP TABLE / no DELETE).
-- Allow workspace owners/admins to read team availability for scheduling (self-service rows remain user-owned).

DROP POLICY IF EXISTS "employee_availability_select_company_admins" ON public.employee_availability;

CREATE POLICY "employee_availability_select_company_admins"
  ON public.employee_availability
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_members m
      WHERE m.user_id = auth.uid()
        AND m.company_id = employee_availability.company_id
        AND m.status = 'active'
        AND lower(m.role) IN ('owner', 'admin')
    )
  );
