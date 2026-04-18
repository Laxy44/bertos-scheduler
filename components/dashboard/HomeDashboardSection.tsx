"use client";

export type SetupCard = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "not_started";
  actionLabel: string;
  onAction: () => void;
};

export type DashboardSummary = {
  employeesCount: number;
  shiftsThisWeek: number;
  plannedHoursWeek: number;
  estimatedPayrollWeek: number;
  currencyLabel: string;
};

export type UpcomingShiftRow = {
  id: string;
  date: string;
  start: string;
  end: string;
  employee: string;
  role: string;
};

type HomeDashboardSectionProps = {
  displayName: string;
  workspaceName: string;
  setupCards: SetupCard[];
  onAddEmployee: () => void;
  onCreateShift: () => void;
  onInviteTeam: () => void;
  onReviewPayroll: () => void;
  onOpenSchedule: () => void;
  showPayrollCta: boolean;
  showRunSetupGuide?: boolean;
  onRunSetupGuide?: () => void;
  /** Admin-only workspace snapshot */
  dashboard?: DashboardSummary | null;
  upcomingShifts?: UpcomingShiftRow[];
  alerts?: string[];
};

function statusPill(status: SetupCard["status"]) {
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
  }
  if (status === "in_progress") {
    return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  }
  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function statusLabel(status: SetupCard["status"]) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

export default function HomeDashboardSection({
  displayName,
  workspaceName,
  setupCards,
  onAddEmployee,
  onCreateShift,
  onInviteTeam,
  onReviewPayroll,
  onOpenSchedule,
  showPayrollCta,
  showRunSetupGuide = false,
  onRunSetupGuide,
  dashboard,
  upcomingShifts = [],
  alerts = [],
}: HomeDashboardSectionProps) {
  const completedCount = setupCards.filter((card) => card.status === "completed").length;
  const progressPercent = Math.round((completedCount / setupCards.length) * 100);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Dashboard</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Hi, {displayName}</h2>
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium text-slate-800">{workspaceName}</span> — overview and next steps.
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Setup progress</span>
            <span>{progressPercent}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {dashboard ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Employees</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{dashboard.employeesCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Shifts this week</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{dashboard.shiftsThisWeek}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Planned hours</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {dashboard.plannedHoursWeek.toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Est. payroll</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
              {dashboard.currencyLabel} {dashboard.estimatedPayrollWeek.toFixed(0)}
            </p>
          </div>
        </div>
      ) : null}

      {alerts.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">Alerts</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-950">
            {alerts.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {upcomingShifts.length > 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Upcoming shifts</h3>
          <p className="mt-1 text-sm text-slate-500">Next in your calendar week.</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {upcomingShifts.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
                <span className="font-medium text-slate-900">
                  {s.date} · {s.start}–{s.end}
                </span>
                <span className="text-slate-600">
                  {s.employee} · {s.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {setupCards.map((card) => (
          <article key={card.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{card.description}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill(card.status)}`}>
                {statusLabel(card.status)}
              </span>
            </div>
            <button
              type="button"
              onClick={card.onAction}
              className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {card.actionLabel}
            </button>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
        <p className="mt-1 text-sm text-slate-600">Common tasks for running the week.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAddEmployee}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add employee
          </button>
          <button
            type="button"
            onClick={onCreateShift}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create shift
          </button>
          <button
            type="button"
            onClick={onOpenSchedule}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Open schedule
          </button>
          <button
            type="button"
            onClick={onInviteTeam}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Invite team
          </button>
          {showPayrollCta ? (
            <button
              type="button"
              onClick={onReviewPayroll}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Payroll overview
            </button>
          ) : null}
          {showRunSetupGuide && onRunSetupGuide ? (
            <button
              type="button"
              onClick={onRunSetupGuide}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-100"
            >
              Run setup guide
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
