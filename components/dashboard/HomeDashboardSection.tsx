"use client";

export type SetupCard = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "not_started";
  actionLabel: string;
  onAction: () => void;
};

type HomeDashboardSectionProps = {
  displayName: string;
  workspaceName: string;
  setupCards: SetupCard[];
  onAddEmployee: () => void;
  onCreateShift: () => void;
  onInviteTeam: () => void;
  onReviewPayroll: () => void;
  showPayrollCta: boolean;
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
  showPayrollCta,
}: HomeDashboardSectionProps) {
  const completedCount = setupCards.filter((card) => card.status === "completed").length;
  const progressPercent = Math.round((completedCount / setupCards.length) * 100);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Planyo Setup Hub
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Hi, {displayName}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Here&apos;s your quick setup guide to get <span className="font-medium text-slate-800">{workspaceName}</span> ready.
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
        <p className="mt-1 text-sm text-slate-600">Jump to the most common setup steps.</p>
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
            Create first shift
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
              Review payroll
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-sm">
        <h3 className="text-base font-semibold">Get started faster with Planyo</h3>
        <p className="mt-1 text-sm text-slate-300">
          Keep your team schedule, attendance, and payroll visibility in one place while you scale.
        </p>
      </div>
    </section>
  );
}
