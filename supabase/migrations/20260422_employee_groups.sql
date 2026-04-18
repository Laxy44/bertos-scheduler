-- Employee groups: simple name + optional default hourly wage per group.
-- Employees optionally belong to one group (filtering + future payroll defaults).

create table if not exists public.employee_groups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  hourly_wage numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_groups_name_not_empty check (char_length(trim(name)) > 0)
);

create unique index if not exists employee_groups_company_name_lower_uidx
  on public.employee_groups (company_id, lower(trim(name)));

create index if not exists employee_groups_company_id_idx
  on public.employee_groups (company_id);

alter table public.employees
  add column if not exists employee_group_id uuid references public.employee_groups (id) on delete set null;

create index if not exists employees_employee_group_id_idx
  on public.employees (employee_group_id);

alter table public.employee_groups enable row level security;

drop policy if exists "employee_groups_select_member" on public.employee_groups;
create policy "employee_groups_select_member"
  on public.employee_groups
  for select
  using (
    exists (
      select 1
      from public.company_members m
      where m.company_id = employee_groups.company_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

drop policy if exists "employee_groups_insert_admin" on public.employee_groups;
create policy "employee_groups_insert_admin"
  on public.employee_groups
  for insert
  with check (
    exists (
      select 1
      from public.company_members m
      where m.company_id = employee_groups.company_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and lower(coalesce(m.role, '')) in ('owner', 'admin')
    )
  );

drop policy if exists "employee_groups_update_admin" on public.employee_groups;
create policy "employee_groups_update_admin"
  on public.employee_groups
  for update
  using (
    exists (
      select 1
      from public.company_members m
      where m.company_id = employee_groups.company_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and lower(coalesce(m.role, '')) in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.company_members m
      where m.company_id = employee_groups.company_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and lower(coalesce(m.role, '')) in ('owner', 'admin')
    )
  );

drop policy if exists "employee_groups_delete_admin" on public.employee_groups;
create policy "employee_groups_delete_admin"
  on public.employee_groups
  for delete
  using (
    exists (
      select 1
      from public.company_members m
      where m.company_id = employee_groups.company_id
        and m.user_id = auth.uid()
        and m.status = 'active'
        and lower(coalesce(m.role, '')) in ('owner', 'admin')
    )
  );
