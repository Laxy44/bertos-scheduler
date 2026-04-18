# End-to-end MVP checklist

Use this list before calling the product “MVP-ready”. Check both **UI** and **server/RLS** behavior.

## Account and workspace

1. **Sign up** — New user can register and land in the app signed in.
2. **Create company** — Owner can create a company; workspace name/CVR appear in the shell.
3. **Guided setup** — After company creation (`?guided=1` or pending session flag), the guided modal opens for admins with no shifts; steps cover optional group, employees, first shift; **Skip** persists dismissal in `sessionStorage` (`planyo_guided_setup_dismissed_v1`).
4. **Run setup guide** — From Home quick actions, an admin with no shifts can reopen the guide (clears dismissal flag for that browser tab).

## People

5. **Employee groups** — Admin can create groups (e.g. “General” from guided); groups load for payroll defaults.
6. **Add employee** — Admin can add an active employee; employee appears on schedule pickers.
7. **Invite** — Admin sends invite (`/invites` or app flow); only permitted roles (e.g. owner) per server rules.
8. **Accept invite** — Invitee signs up or signs in and joins company; membership is active.

## Scheduling

9. **Create shift** — Admin assigns date, employee, role, times; shift appears on schedule and week/month views.
10. **Employee schedule** — Employee sees own (or permitted) shifts; cannot assign other people (client + `saveShift` guard).
11. **Availability** — Employee sets availability for a day; admin shift form loads `employee_availability` and shows **can work / cannot work / undecided / no linked account**; saving a shift for **cannot work** requires confirmation.
12. **Legacy unavailable dates** — Still blocks save when applicable.

## Payroll / reports

13. **Worked / approved** — Punch or manual actuals flow into worked hours where implemented.
14. **Payroll overview** — Admin can open payroll tab; totals reflect approved/planned as designed.
15. **Employee payroll** — Admin drill-down works; employees are redirected away from admin-only tabs.

## Hardening

16. **API** — `POST /api/employees` rejects non-admin members; invites use server-side role checks.
17. **RLS** — Migrations applied, including admin **SELECT** on `employee_availability` for scheduling (`20260424_employee_availability_admin_select.sql`).
