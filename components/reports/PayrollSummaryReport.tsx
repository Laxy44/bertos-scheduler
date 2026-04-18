"use client";

export type PayrollSummaryRow = {
  employee: string;
  totalHours: number;
  hourlyRate: number;
  totalCost: number;
  active: boolean;
};

type PayrollSummaryReportProps = {
  workspaceName: string;
  monthFilter: number;
  setMonthFilter: (m: number) => void;
  yearFilter: number;
  setYearFilter: (y: number) => void;
  yearsAvailable: number[];
  monthNames: readonly string[];
  rows: PayrollSummaryRow[];
  totalHours: number;
  totalPayrollCost: number;
  formatDKK: (amount: number) => string;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export default function PayrollSummaryReport({
  workspaceName,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  yearsAvailable,
  monthNames,
  rows,
  totalHours,
  totalPayrollCost,
  formatDKK,
  onExportCsv,
  onExportPdf,
}: PayrollSummaryReportProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Payroll summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              {workspaceName} · {monthNames[monthFilter]} {yearFilter}. Based on worked hours where
              punches exist; otherwise planned hours for the month.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((m) => (
                <option key={m} value={m}>
                  {monthNames[m]}
                </option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              {yearsAvailable.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
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

      <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total hours</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{totalHours.toFixed(1)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total payroll cost</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-900">
            {formatDKK(totalPayrollCost)}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 pb-6 md:px-6">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[28rem] text-left text-sm">
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
                  Total cost
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                    No payroll data for this month.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.employee} className="border-b border-slate-100 last:border-0">
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
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.totalHours.toFixed(1)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{row.hourlyRate.toFixed(2)} DKK</td>
                    <td className="px-3 py-2.5 font-medium tabular-nums text-slate-900">
                      {formatDKK(row.totalCost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
