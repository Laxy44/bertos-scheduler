"use client";

export default function MonthSection({
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  yearsAvailable,
  monthlyTotalPlanned,
  monthlyTotalWorked,
  shifts,
  monthGroupedWeeks,
  getPlannedHours,
  getWorkedHours,
  roleStyles,
  goToDate,
  employeeNames,
  employees,
  monthlyHours,
  formatHours,
  employeeName,
}: any) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-bold">Monthly View</h2>

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
        </div>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900">
          <p className="text-sm text-slate-500">Month Planned Hours</p>
          <p className="mt-1 text-3xl font-bold">
            {monthlyTotalPlanned.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-slate-900">
          <p className="text-sm text-emerald-700">Month Actual Hours</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">
            {monthlyTotalWorked.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-slate-900">
          <p className="text-sm text-blue-700">Month Shifts</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">
            {
              shifts.filter((shift: any) => {
                const d = new Date(shift.date);
                return (
                  d.getMonth() + 1 === monthFilter &&
                  d.getFullYear() === yearFilter
                );
              }).length
            }
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-2">
          <thead>
            <tr className="text-left text-sm text-slate-500">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <th key={day} className="px-2 py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthGroupedWeeks.map((week: any, index: number) => (
              <tr key={index} className="align-top">
                {week.map((dayCell: any) => {
                  const dayShifts = shifts.filter(
                    (shift: any) => shift.date === dayCell.date
                  );
                  const dayPlanned = dayShifts.reduce(
                    (sum: number, shift: any) => sum + getPlannedHours(shift),
                    0
                  );
                  const dayWorked = dayShifts.reduce(
                    (sum: number, shift: any) => sum + getWorkedHours(shift),
                    0
                  );

                  return (
                    <td key={dayCell.date} className="w-[14.28%]">
                      <button
                        onClick={() => goToDate(dayCell.date)}
                        className={`min-h-[140px] w-full rounded-2xl border p-3 text-left ${
                          dayCell.isCurrentMonth
                            ? "border-slate-200 bg-slate-50 hover:bg-slate-100"
                            : "border-slate-100 bg-slate-50/50 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold">
                            {dayCell.dayNumber}
                          </span>
                          <span className="text-[11px]">{dayCell.date}</span>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-slate-600">
                            Shifts: {dayShifts.length}
                          </div>
                          <div className="text-xs text-slate-600">
                            Planned: {dayPlanned.toFixed(1)}h
                          </div>
                          <div className="text-xs text-emerald-700">
                            Actual: {dayWorked.toFixed(1)}h
                          </div>

                          {dayShifts.slice(0, 2).map((shift: any) => (
                            <div
                              key={shift.id}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-medium ${
                              shift.approved
                                ? "border-green-300 bg-green-100 text-green-800"
                                : shift.actualStart || shift.actualEnd
                                ? "border-blue-300 bg-blue-100 text-blue-800"
                                : roleStyles(shift.role)
                            }`}
                            >
                              {shift.employee} {shift.start}-{shift.end}
                            </div>
                          ))}

                          {dayShifts.length > 2 ? (
                            <div className="text-[11px] text-slate-500">
                              +{dayShifts.length - 2} more
                            </div>
                          ) : null}
                        </div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {employeeNames.map((employee: string) => {
          const employeeConfig = employees.find(
            (item: any) => item.name === employee
          );

          return (
            <div
              key={employee}
              className={`rounded-2xl border p-4 ${
                employeeName && employee === employeeName
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-slate-50"
              }`}
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
                Planned: {formatHours(monthlyHours[employee].planned)}
              </p>
              <p className="text-sm text-emerald-700">
                Actual: {formatHours(monthlyHours[employee].worked)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}