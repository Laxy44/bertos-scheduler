-- Link employees to auth users and store contact fields for profile / HR flows.
alter table public.employees
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.employees
  add column if not exists email text;

alter table public.employees
  add column if not exists phone text;

create unique index if not exists employees_company_user_id_uidx
  on public.employees (company_id, user_id)
  where user_id is not null;

create index if not exists employees_user_id_idx
  on public.employees (user_id)
  where user_id is not null;

create index if not exists employees_company_email_idx
  on public.employees (company_id, lower(email))
  where email is not null and length(trim(email)) > 0;
