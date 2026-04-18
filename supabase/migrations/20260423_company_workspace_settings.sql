-- Minimal workspace configuration (general, schedule JSON, payroll defaults).
-- Extend later for integrations, advanced payroll, leave, etc.

alter table public.companies
  add column if not exists timezone text default 'Europe/Copenhagen';

alter table public.companies
  add column if not exists week_starts_on text default 'monday';

alter table public.companies
  add column if not exists currency text default 'DKK';

alter table public.companies
  add column if not exists default_hourly_wage numeric(12,2);

alter table public.companies
  add column if not exists workspace_settings jsonb not null default '{}'::jsonb;

alter table public.companies drop constraint if exists companies_week_starts_on_check;

alter table public.companies
  add constraint companies_week_starts_on_check
  check (week_starts_on is null or lower(week_starts_on) in ('monday', 'sunday'));
