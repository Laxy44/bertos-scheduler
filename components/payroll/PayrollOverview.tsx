"use client";

export type PayrollOverviewRow = {
  employee: string;
  totalHours: number;
  hourlyRate: number;
  totalEarnings: number;
  active: boolean;
};

type PayrollRangeMode = "week" | "month" | "custom";

type PayrollOverviewProps = {
  workspaceName: string;
  periodLabel: string;
  rangeMode: PayrollRangeMode;
  onRangeModeChange: (mode: PayrollRangeMode) => void;
  monthValue: number;
  onMonthChange: (m: number) => void;
  yearValue: number;
  onYearChange: (y: number) => void;
  yearsAvailable: number[];
  monthNames: readonly string[];
  onWeekPrev: () => void;
  onWeekNext: () => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (v: string) => void;
  onCustomToChange: (v: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (v: string) => void;
  employeeNames: string[];
  rows: PayrollOverviewRow[];
  totalHours: number;
  totalPayrollCost: number;
  averageHourlyCost: number;
  formatDKK: (n: number) => string;
  onRowClick: (employeeName: string) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export default function PayrollOverview({
  workspaceName,
  periodLabel,
  rangeMode,
  onRangeModeChange,
  monthValue,
  onMonthChange,
  yearValue,
  onYearChange,
  yearsAvailable,
  monthNames,
  onWeekPrev,
  onWeekNext,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  employeeFilter,
  onEmployeeFilterChange,
  employeeNames,
  rows,
  totalHours,
  totalPayrollCost,
  averageHourlyCost,
  formatDKK,
  onRowClick,
  onExportCsv,
  onExportPdf,
}: PayrollOverviewProps) {
  const modeBtn = (mode: PayrollRangeMode, label: string) => (
    <button
      key={mode}
      type="button"
      onClick={() => onRangeModeChange(mode)}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        rangeMode === mode
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payroll overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                {workspaceName} · {periodLabel}. Totals from scheduled shifts and punches × each
                employee&apos;s hourly rate.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onExportCsv}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={onExportPdf}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 md:p-6">
          <div className="flex flex-wrap gap-2">{modeBtn("week", "Week")}{modeBtn("month", "Month")}{modeBtn("custom", "Custom")}</div>

          {rangeMode === "week" ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onWeekPrev}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                ← Previous week
              </button>
              <span className="text-sm font-medium text-slate-700">{periodLabel}</span>
              <button
                type="button"
                onClick={onWeekNext}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Next week →
              </button>
            </div>
          ) : null}

          {rangeMode === "month" ? (
            <div className="flex flex-wrap gap-2">
              <select
                value={monthValue}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((m) => (
                  <option key={m} value={m}>
                    {monthNames[m]}
                  </option>
                ))}
              </select>
              <select
                value={yearValue}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
              >
                {yearsAvailable.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {rangeMode === "custom" ? (
            <div className="flex flex-wrap gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  From
                </span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => onCustomFromChange(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  To
                </span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => onCustomToChange(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                />
              </label>
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Employee
            </label>
            <select
              value={employeeFilter}
              onChange={(e) => onEmployeeFilterChange(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <option value="all">All employees</option>
              {employeeNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 px-5 pb-5 md:grid-cols-3 md:px-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total hours worked</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{totalHours.toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total payroll cost</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">{formatDKK(totalPayrollCost)}</p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Average hourly cost</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-900">
              {totalHours > 0 ? formatDKK(averageHourlyCost) : "—"}
            </p>
            <p className="mt-1 text-xs text-indigo-700/80">Blended: payroll ÷ hours</p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 pb-6 md:px-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total hours
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hourly rate
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total earnings
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                      No employees in this filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.employee}
                      role="button"
                      tabIndex={0}
                      onClick={() => onRowClick(row.employee)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row.employee);
                        }
                      }}
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300 last:border-0"
                    >
                      <td className="px-3 py-2.5 font-medium text-slate-900">
                        <span className="inline-flex flex-wrap items-center gap-2">
                          {row.employee}
                          {!row.active ? (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              Inactive
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.totalHours.toFixed(2)}</td>
                      <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.hourlyRate.toFixed(2)} DKK</td>
                      <td className="px-3 py-2.5 font-medium tabular-nums text-slate-900">
                        {formatDKK(row.totalEarnings)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">Click a row to open employee payroll.</p>
        </div>
      </div>
    </section>
  );
}
