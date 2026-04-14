"use client";

export default function WeekSection({
  weekDates,
  employeeNames,
  employees,
  weeklyOverview,
  isEmployeeUnavailable,
  getPlannedHours,
  getWorkedHours,
  roleStyles,
  weeklyTotals,
  employeeName,
}: any) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold">Weekly Overview</h2>
        <p className="text-sm text-slate-500">
          Planned + actual hours by day
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-sm text-slate-500">
              <th className="px-3 py-2">Employee</th>
              {weekDates.map((item: any) => (
                <th key={item.date} className="px-3 py-2">
                  <div>{item.dayName}</div>
                  <div className="text-xs text-slate-400">{item.label}</div>
                </th>
              ))}
              <th className="px-3 py-2">Week Total</th>
            </tr>
          </thead>
          <tbody>
            {employeeNames.map((employee: string) => {
              const employeeConfig = employees.find(
                (item: any) => item.name === employee
              );

              return (
                <tr
                  key={employee}
                  className={`align-top ${
                    employeeName && employee === employeeName
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
                >
                  <td className="rounded-2xl bg-slate-50 px-3 py-3 font-semibold">
                    <div className="flex flex-col gap-1">
                      <span>{employee}</span>
                      {employeeConfig && !employeeConfig.active ? (
                        <span className="text-xs font-medium text-slate-500">
                          Inactive
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {weekDates.map((item: any) => {
                    const cellShifts = weeklyOverview[employee][item.date] || [];
                    const unavailable = isEmployeeUnavailable(
                      employee,
                      item.date
                    );
                    const cellPlanned = cellShifts.reduce(
                      (sum: number, shift: any) => sum + getPlannedHours(shift),
                      0
                    );
                    const cellWorked = cellShifts.reduce(
                      (sum: number, shift: any) => sum + getWorkedHours(shift),
                      0
                    );

                    return (
                      <td key={`${employee}-${item.date}`} className="px-2 py-2">
                        <div
                          className={`min-h-[90px] rounded-2xl p-2 ${
                            unavailable
                              ? "border border-amber-200 bg-amber-50"
                              : "bg-slate-50"
                          }`}
                        >
                          {unavailable ? (
                            <div className="mb-2 rounded-xl bg-slate-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              Unavailable
                            </div>
                          ) : null}

                          {cellShifts.length === 0 ? (
                            <span className="text-xs text-slate-400">—</span>
                          ) : (
                            <div className="space-y-2">
                              {cellShifts.map((shift: any) => (
                                <div
                                  key={shift.id}
                                  className={`rounded-xl border px-2 py-2 text-xs font-medium ${
                                    shift.approved
                                      ? "border-green-300 bg-green-100 text-green-800"
                                      : shift.actualStart || shift.actualEnd
                                      ? "border-blue-300 bg-blue-100 text-blue-800"
                                      : roleStyles(shift.role)
                                  }`}
                                >
                                  <div>
                                    {shift.start} - {shift.end}
                                  </div>
                                  <div>{shift.role}</div>
                                </div>
                              ))}

                              <div className="rounded-xl bg-white px-2 py-2 text-[11px]">
                                <div>Planned: {cellPlanned.toFixed(1)}h</div>
                                <div className="text-emerald-700">
                                  Actual: {cellWorked.toFixed(1)}h
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  <td className="px-2 py-2">
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                      <div>
                        Planned: {weeklyTotals[employee].planned.toFixed(1)}h
                      </div>
                      <div className="mt-1 text-emerald-700">
                        Actual: {weeklyTotals[employee].worked.toFixed(1)}h
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}