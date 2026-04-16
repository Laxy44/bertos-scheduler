create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null default 'employee',
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now()
);

create index if not exists invites_company_id_idx
  on public.invites(company_id);

create index if not exists invites_email_status_idx
  on public.invites(lower(email), status);
