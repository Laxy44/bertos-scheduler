-- Per-user daily availability (self-service). Unique per user + company + calendar date.
-- RLS: members manage only their own rows; updates blocked when locked = true.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'availability_status') then
    create type public.availability_status as enum ('undecided', 'can_work', 'cannot_work');
  end if;
end
$$;

create table if not exists public.employee_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  date date not null,
  status public.availability_status not null default 'undecided',
  notes text,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_availability_user_company_date_uniq unique (user_id, company_id, date)
);

create index if not exists employee_availability_company_date_idx
  on public.employee_availability (company_id, date);

create index if not exists employee_availability_user_id_idx
  on public.employee_availability (user_id);

-- updated_at is set by the app on each write (keeps migration compatible across PG versions).

alter table public.employee_availability enable row level security;

drop policy if exists "employee_availability_select_own" on public.employee_availability;
create policy "employee_availability_select_own"
  on public.employee_availability
  for select
  using (auth.uid() = user_id);

drop policy if exists "employee_availability_insert_own_member" on public.employee_availability;
create policy "employee_availability_insert_own_member"
  on public.employee_availability
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.company_members m
      where m.user_id = auth.uid()
        and m.company_id = employee_availability.company_id
        and m.status = 'active'
    )
  );

drop policy if exists "employee_availability_update_own_unlocked" on public.employee_availability;
create policy "employee_availability_update_own_unlocked"
  on public.employee_availability
  for update
  using (auth.uid() = user_id and locked = false)
  with check (auth.uid() = user_id);
