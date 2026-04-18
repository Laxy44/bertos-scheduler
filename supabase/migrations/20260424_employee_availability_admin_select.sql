-- Allow workspace owners/admins to read team availability for scheduling (self-service rows remain user-owned).

drop policy if exists "employee_availability_select_company_admins" on public.employee_availability;

create policy "employee_availability_select_company_admins"
  on public.employee_availability
  for select
  using (
    exists (
      select 1
      from public.company_members m
      where m.user_id = auth.uid()
        and m.company_id = employee_availability.company_id
        and m.status = 'active'
        and lower(m.role) in ('owner', 'admin')
    )
  );
