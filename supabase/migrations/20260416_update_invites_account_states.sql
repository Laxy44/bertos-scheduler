alter table public.invites drop constraint if exists invites_status_check;

update public.invites
set status = 'pending'
where status in ('invited', 'pending_verification');

update public.invites
set status = 'accepted'
where status = 'active';

alter table public.invites
add constraint invites_status_check
check (status in ('pending', 'accepted'));

alter table public.invites
alter column status set default 'pending';
