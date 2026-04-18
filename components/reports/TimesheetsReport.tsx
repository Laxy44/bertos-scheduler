"use client";

/**
 * Reports MVP: timesheets + payroll summary live here.
 * Future: revenue / advanced analytics can add sibling modules under `components/reports/`.
 */

import type { EmployeeConfig, EmployeeGroupRow, Shift } from "../../types/schedule";
import { reportEndDisplay, reportHoursForShift, reportStartDisplay } from "../../lib/reports/shift-hours-cost";

type TimesheetsReportProps = {
  workspaceName: string;
  filteredShifts: Shift[];
  employees: EmployeeConfig[];
  employeeGroups: EmployeeGroupRow[];
  employeeRateMap: Record<string, number>;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (v: string) => void;
  groupFilter: string;
  onGroupFilterChange: (v: string) => void;
  formatDKK: (amount: number) => string;
  onExportCsv: () => void;
  onExportPdf: () => void;
};

export default function TimesheetsReport({
  workspaceName,
  filteredShifts,
  employees,
  employeeGroups,
  employeeRateMap,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  employeeFilter,
  onEmployeeFilterChange,
  groupFilter,
  onGroupFilterChange,
  formatDKK,
  onExportCsv,
  onExportPdf,
}: TimesheetsReportProps) {
  const employeeNames = [...new Set(employees.map((e) => e.name))].sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Timesheets</h2>
            <p className="mt-1 text-sm text-slate-500">
              {workspaceName} — one row per shift. Hours use punches when present, otherwise planned
              time.
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

      <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-2 lg:grid-cols-4 md:p-6">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Employee
          </label>
          <select
            value={employeeFilter}
            onChange={(e) => onEmployeeFilterChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">All employees</option>
            {employeeNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Group
          </label>
          <select
            value={groupFilter}
            onChange={(e) => onGroupFilterChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">All groups</option>
            <option value="ungrouped">Ungrouped</option>
            {employeeGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto p-5 md:p-6">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Employee
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                End
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
            {filteredShifts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                  No shifts match these filters.
                </td>
              </tr>
            ) : (
              filteredShifts.map((shift) => {
                const rate = employeeRateMap[shift.employee] || 0;
                const hours = reportHoursForShift(shift);
                const cost = hours * rate;
                return (
                  <tr key={shift.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-slate-900">{shift.employee}</td>
                    <td className="px-3 py-2.5 text-slate-700">{shift.date}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{reportStartDisplay(shift)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{reportEndDisplay(shift)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{hours.toFixed(2)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{rate.toFixed(2)} DKK</td>
                    <td className="px-3 py-2.5 font-medium tabular-nums text-slate-900">{formatDKK(cost)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
