alter table public.invites drop constraint if exists invites_status_check;

alter table public.invites
add constraint invites_status_check
check (status in ('invited', 'pending_verification', 'active'));

alter table public.invites
alter column status set default 'invited';

update public.invites
set status = 'invited'
where status = 'pending';
