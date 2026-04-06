"use client";

export default function PayrollSection({
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  yearsAvailable,
  downloadPayrollCsv,
  downloadPayrollPdf,
  COMPANY_NAME,
  COMPANY_CVR,
  monthlyTotalPlanned,
  monthlyTotalWorked,
  monthlyTotalPlannedCost,
  monthlyTotalWorkedCost,
  formatDKK,
  employeeNames,
  employees,
  monthlyHours,
  employeeRateMap,
  payrollCosts,
  timesheetEmployee,
  setTimesheetEmployee,
  downloadEmployeeTimesheetCsv,
  downloadEmployeeTimesheetPdf,
  selectedTimesheetRows,
  selectedTimesheetSummary,
  getPlannedHours,
  getWorkedHours,
  monthNames,
}: any) {
  return (
    <section className="space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-bold">Monthly Payroll Summary</h2>

          <div className="flex flex-wrap gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(Number(e.target.value))}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm"
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm"
            >
              {yearsAvailable.map((year: number) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              onClick={downloadPayrollCsv}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Download CSV
            </button>

            <button
              onClick={downloadPayrollPdf}
              className="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900">
            <p className="text-sm text-slate-500">{COMPANY_NAME}</p>
            <p className="text-sm text-slate-500">CVR: {COMPANY_CVR}</p>
            <p className="mt-3 text-sm text-slate-500">
              Planned vs Actual in {monthNames[monthFilter]} {yearFilter}
            </p>
            <p className="mt-1 text-lg font-bold">
              Planned: {monthlyTotalPlanned.toFixed(1)} hrs
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              Actual: {monthlyTotalWorked.toFixed(1)} hrs
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-slate-900">
            <p className="text-sm text-emerald-700">
              Payroll Cost Comparison
            </p>
            <p className="mt-1 text-lg font-bold">
              Planned: {formatDKK(monthlyTotalPlannedCost)}
            </p>
            <p className="mt-1 text-lg font-bold">
              Actual: {formatDKK(monthlyTotalWorkedCost)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {employeeNames.map((employee: string) => {
            const employeeConfig = employees.find(
              (item: any) => item.name === employee
            );

            return (
              <div
                key={employee}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{employee}</p>
                  {employeeConfig && !employeeConfig.active ? (
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700">
                      Inactive
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Planned: {monthlyHours[employee].planned.toFixed(1)} hrs
                </p>
                <p className="text-sm text-emerald-700">
                  Actual: {monthlyHours[employee].worked.toFixed(1)} hrs
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Rate: {employeeRateMap[employee]} DKK/hr
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  Planned cost: {formatDKK(payrollCosts[employee].plannedCost)}
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  Actual cost: {formatDKK(payrollCosts[employee].workedCost)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Employee Timesheet Export</h2>
            <p className="mt-1 text-sm text-slate-500">
              Export one employee’s monthly record as CSV or printable PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={timesheetEmployee}
              onChange={(e) => setTimesheetEmployee(e.target.value)}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm"
            >
              {employeeNames.map((employee: string) => (
                <option key={employee} value={employee}>
                  {employee}
                </option>
              ))}
            </select>

            <button
              onClick={downloadEmployeeTimesheetCsv}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Timesheet CSV
            </button>

            <button
              onClick={downloadEmployeeTimesheetPdf}
              className="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90"
            >
              Timesheet PDF
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Employee</p>
            <p className="mt-1 text-xl font-bold">{timesheetEmployee || "—"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Shifts</p>
            <p className="mt-1 text-xl font-bold">{selectedTimesheetRows.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Planned Hours</p>
            <p className="mt-1 text-xl font-bold">
              {selectedTimesheetSummary.planned.toFixed(1)}
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Actual Hours</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">
              {selectedTimesheetSummary.worked.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Day</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Planned</th>
                <th className="px-3 py-2">Planned Hours</th>
                <th className="px-3 py-2">Actual In</th>
                <th className="px-3 py-2">Actual Out</th>
                <th className="px-3 py-2">Actual Hours</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {selectedTimesheetRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-slate-500"
                  >
                    No shifts found for this employee in {monthNames[monthFilter]} {yearFilter}.
                  </td>
                </tr>
              ) : (
                selectedTimesheetRows.map((shift: any) => (
                  <tr key={shift.id} className="align-top">
                    <td className="rounded-2xl bg-slate-50 px-3 py-3">{shift.date}</td>
                    <td className="px-3 py-3">{shift.day}</td>
                    <td className="px-3 py-3">{shift.role}</td>
                    <td className="px-3 py-3">
                      {shift.start} - {shift.end}
                    </td>
                    <td className="px-3 py-3">{getPlannedHours(shift).toFixed(1)}</td>
                    <td className="px-3 py-3">{shift.actualStart || "—"}</td>
                    <td className="px-3 py-3">{shift.actualEnd || "—"}</td>
                    <td className="px-3 py-3 text-emerald-700">
                      {getWorkedHours(shift).toFixed(1)}
                    </td>
                    <td className="px-3 py-3">{shift.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}