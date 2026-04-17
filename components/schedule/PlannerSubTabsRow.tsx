"use client";

/**
 * LEVEL 3 — Planner sub-tabs and row filters (admin only).
 */
type PlannerSubTabsRowProps = {
  employeeFilter: string;
  setEmployeeFilter: (value: string) => void;
  employeeNames: string[];
  onAddEmployeeCta: () => void;
};

export default function PlannerSubTabsRow({
  employeeFilter,
  setEmployeeFilter,
  employeeNames,
  onAddEmployeeCta,
}: PlannerSubTabsRowProps) {
  return (
    <div className="border-t border-slate-200 bg-slate-50/80 px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="inline-flex w-fit max-w-full flex-wrap rounded-md border border-slate-200 bg-slate-100/90 p-0.5 shadow-inner"
          role="tablist"
          aria-label="Planner rows"
        >
          <button
            type="button"
            role="tab"
            aria-selected
            className="rounded-[0.3125rem] bg-white px-2.5 py-1 text-xs font-semibold text-indigo-950 shadow-sm ring-1 ring-slate-200/70 sm:text-sm"
          >
            Employees
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="rounded-[0.3125rem] px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white/70 sm:text-sm"
          >
            Groups
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={false}
            className="rounded-[0.3125rem] px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white/70 sm:text-sm"
          >
            Positions
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddEmployeeCta}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Manage Employees
          </button>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="max-w-[min(100%,14rem)] rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
          >
            <option value="All">All employees</option>
            {employeeNames.map((name: string) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Sort by
          </button>
        </div>
      </div>
    </div>
  );
}
