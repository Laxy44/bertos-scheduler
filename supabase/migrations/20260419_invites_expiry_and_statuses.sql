-- Richer invite lifecycle for production invite flows.
alter table public.invites drop constraint if exists invites_status_check;

alter table public.invites
  add constraint invites_status_check
  check (status in ('pending', 'accepted', 'expired', 'revoked'));

alter table public.invites
  add column if not exists expires_at timestamptz;

-- Backfill: invites without expiry get 14 days from creation.
update public.invites
set expires_at = created_at + interval '14 days'
where expires_at is null;

alter table public.invites
  alter column expires_at set default (now() + interval '14 days');
