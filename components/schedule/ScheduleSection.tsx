"use client";

export default function ScheduleSection({
  weekDates,
  shifts,
  employees,
  selectedDate,
  setSelectedDate,
  setForm,
  setOpenMenuId,
  selectedDayName,
  filteredShifts,
  employeeFilter,
  setEmployeeFilter,
  employeeNames,
  setEditingId,
  employeeRoleMap,
  currentEmployeeUnavailableDates,
  setShiftRoleMode,
  setShowShiftForm,
  showShiftForm,
  applyPlannedToAllSelectedDay,
  clearSelectedDay,
  dayHours,
  dayWorkedHours,
  activeEmployees,
  editingId,
  resetForm,
  activeEmployeeNames,
  form,
  handleEmployeeChange,
  roleSuggestions,
  CUSTOM_ROLE_OPTION,
  isFormEmployeeUnavailable,
  saveShift,
  monthNames,
  copyFromDate,
  setCopyFromDate,
  copyDayShifts,
  employeesUnavailableOnSelectedDate,
  openMenuId,
  punchIn,
  punchOut,
  normalizeManualTimeInput,
  isValidFullTime,
  roundTime,
  setShifts,
  applyPlannedAsActual,
  startEdit,
  deleteShift,
  resetPunch,
  roleStyles,
  getPlannedHours,
  getWorkedHours,
  isAdmin,
}: any) {
  const scheduleGridEmployees = (employeeFilter === "All"
    ? activeEmployeeNames
    : activeEmployeeNames.filter((name: string) => name === employeeFilter)
  ).filter((name: string) =>
    weekDates.some((item: any) =>
      shifts.some((shift: any) => shift.employee === name && shift.date === item.date)
    )
  );

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
        {weekDates.map((item: any) => {
          const dayShiftCount = shifts.filter(
            (shift: any) => shift.date === item.date
          ).length;
          const unavailableCount = employees.filter((employee: any) =>
            employee.unavailableDates.includes(item.date)
          ).length;
          const shortDay = item.dayName.slice(0, 3).toUpperCase();
          const dateObj = new Date(item.date);
          const prettyDate = `${String(dateObj.getDate()).padStart(2, "0")} ${
            monthNames[dateObj.getMonth() + 1]
          }`;

          return (
            <button
              key={item.date}
              onClick={() => {
                setSelectedDate(item.date);
                setForm((current: any) => ({ ...current, date: item.date }));
                setOpenMenuId(null);
              }}
              className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
                selectedDate === item.date
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="text-xs font-semibold tracking-[0.22em] opacity-70">
                {shortDay}
              </div>
              <div className="mt-1 text-base font-bold">{prettyDate}</div>
              <div className="mt-2 text-xs opacity-80">
                {dayShiftCount} shifts
                {unavailableCount > 0 ? ` • ${unavailableCount} off` : ""}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedDayName}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredShifts.length} shift{filteredShifts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="All">All Employees</option>
            {employeeNames.map((employee: string) => (
              <option key={employee} value={employee}>
                {employee}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm((current: any) => ({
                  ...current,
                  date: selectedDate,
                  role: employeeRoleMap[current.employee] || current.role,
                }));
                setShiftRoleMode("preset");
                setShowShiftForm((current: boolean) => !current);
              }}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {showShiftForm ? "Close Shift Form" : "+ Add Shift"}
            </button>
          )}

          {isAdmin && (
            <button
              onClick={applyPlannedToAllSelectedDay}
              className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              Approve Planned
            </button>
          )}

          {isAdmin && (
            <button
              onClick={clearSelectedDay}
              className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Clear Day
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Planned Hours</p>
          <p className="mt-1 text-2xl font-bold">{dayHours.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Actual Hours</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {dayWorkedHours.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Employees Scheduled</p>
          <p className="mt-1 text-2xl font-bold">
            {new Set(filteredShifts.map((shift: any) => shift.employee)).size}
          </p>
        </div>
      </div>

      {isAdmin && showShiftForm && (
        <section className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">
                {editingId !== null ? "Edit Shift" : "Add Shift"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Quick day planning for {selectedDate}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          {activeEmployees.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No active employees available. Go to Employees tab and add or
              activate one employee first.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <div className="xl:col-span-2">
                <label className="mb-1 block text-sm font-medium">Employee</label>
                <select
                  value={form.employee}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                >
                  {activeEmployeeNames.map((employee: string) => (
                    <option key={employee} value={employee}>
                      {employee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <div className="space-y-2">
                  <select
                    value={
                      roleSuggestions.includes(form.role)
                        ? form.role
                        : CUSTOM_ROLE_OPTION
                    }
                    onChange={(e) => {
                      if (e.target.value === CUSTOM_ROLE_OPTION) {
                        setShiftRoleMode("custom");
                        setForm((current: any) => ({
                          ...current,
                          role: current.role && !roleSuggestions.includes(current.role)
                            ? current.role
                            : "",
                        }));
                        return;
                      }

                      setShiftRoleMode("preset");
                      setForm((current: any) => ({
                        ...current,
                        role: e.target.value,
                      }));
                    }}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                  >
                    {roleSuggestions.map((role: string) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value={CUSTOM_ROLE_OPTION}>Custom role…</option>
                  </select>

                  {!roleSuggestions.includes(form.role) ? (
                    <input
                      value={form.role}
                      onChange={(e) =>
                        setForm((current: any) => ({
                          ...current,
                          role: e.target.value,
                        }))
                      }
                      placeholder="Write custom role"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                    />
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((current: any) => ({
                      ...current,
                      date: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Start</label>
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) =>
                    setForm((current: any) => ({
                      ...current,
                      start: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">End</label>
                <input
                  type="time"
                  value={form.end}
                  onChange={(e) =>
                    setForm((current: any) => ({
                      ...current,
                      end: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="md:col-span-2 xl:col-span-6">
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((current: any) => ({
                      ...current,
                      notes: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Optional note"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="md:col-span-2 xl:col-span-6 flex flex-wrap gap-2">
                <button
                  onClick={saveShift}
                  className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isFormEmployeeUnavailable}
                >
                  {editingId !== null ? "Update Shift" : "Save Shift"}
                </button>

                <button
                  onClick={resetForm}
                  className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                {isFormEmployeeUnavailable ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {form.employee} is unavailable on {form.date}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {form.employee} is available on {form.date}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {employeesUnavailableOnSelectedDate.length > 0 ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Unavailable employees on {selectedDate}:</p>
          <p className="mt-1">{employeesUnavailableOnSelectedDate.join(", ")}</p>
        </div>
      ) : null}

      {isAdmin && (
        <div className="mb-5 flex flex-wrap gap-2">
          <select
            value={copyFromDate}
            onChange={(e) => setCopyFromDate(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {weekDates.map((item: any) => (
              <option key={item.date} value={item.date}>
                Copy from {item.dayName} ({item.label})
              </option>
            ))}
          </select>
          <button
            onClick={copyDayShifts}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Copy Day Plan
          </button>
        </div>
      )}

      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[220px_repeat(7,minmax(120px,1fr))] border-b border-slate-200 bg-slate-50">
              <div className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                Employee
              </div>
              {weekDates.map((item: any) => {
                const dateObj = new Date(item.date);
                const isSelected = selectedDate === item.date;

                return (
                  <button
                    key={item.date}
                    onClick={() => {
                      setSelectedDate(item.date);
                      setForm((current: any) => ({ ...current, date: item.date }));
                      setOpenMenuId(null);
                    }}
                    className={`border-r border-slate-200 p-4 text-left transition last:border-r-0 ${
                      isSelected ? "bg-slate-900 text-white" : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      isSelected ? "text-white/70" : "text-slate-400"
                    }`}>
                      {item.dayName.slice(0, 3)}
                    </div>
                    <div className="mt-1 text-sm font-bold">
                      {String(dateObj.getDate()).padStart(2, "0")}
                    </div>
                    <div className={`mt-1 text-xs ${isSelected ? "text-white/80" : "text-slate-500"}`}>
                      {monthNames[dateObj.getMonth() + 1]}
                    </div>
                  </button>
                );
              })}
            </div>

            {scheduleGridEmployees.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No scheduled employees found for the current filter.
              </div>
            ) : (
              scheduleGridEmployees.map((employeeName: string) => {
                const employeeInfo = employees.find(
                  (employee: any) => employee.name === employeeName
                );

                return (
                  <div
                    key={employeeName}
                    className="grid grid-cols-[220px_repeat(7,minmax(120px,1fr))] border-b border-slate-200 last:border-b-0"
                  >
                    <div className="sticky left-0 z-10 flex min-h-[92px] items-center border-r border-slate-200 bg-white p-4">
                      <div>
                        <div className="font-semibold text-slate-900">{employeeName}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {employeeInfo?.defaultRole || "No default role"}
                        </div>
                      </div>
                    </div>

                    {weekDates.map((item: any) => {
                      const dayShifts = shifts
                        .filter(
                          (shift: any) =>
                            shift.employee === employeeName && shift.date === item.date
                        )
                        .sort((a: any, b: any) => a.start.localeCompare(b.start));

                      const isUnavailable = employeeInfo?.unavailableDates?.includes(item.date);
                      const isSelected = selectedDate === item.date;

                      return (
                        <button
                          key={`${employeeName}-${item.date}`}
                          type="button"
                          onClick={() => {
                            setSelectedDate(item.date);
                            setForm((current: any) => ({ ...current, date: item.date }));
                            setOpenMenuId(null);
                          }}
                          className={`min-h-[92px] border-r border-slate-200 p-3 text-left align-top transition last:border-r-0 ${
                            isSelected ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          {dayShifts.length > 0 ? (
                            <div className="space-y-2">
                              {dayShifts.map((shift: any) => (
                                <div
                                  key={shift.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                                >
                                  <div className="text-xs font-semibold text-slate-900">
                                    {shift.start}–{shift.end}
                                  </div>
                                  <div className="mt-1 text-[11px] text-slate-500">
                                    {shift.role}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : isUnavailable ? (
                            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                              Unavailable
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">No shift</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredShifts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
            No shifts for {selectedDayName} ({selectedDate}).
          </div>
        ) : (
          filteredShifts
            .slice()
            .sort((a: any, b: any) => a.start.localeCompare(b.start))
            .map((shift: any) => {
              const workedHours = getWorkedHours(shift);
              const employeeConfig = employees.find(
                (employee: any) => employee.name === shift.employee
              );

              return (
                <div
                  key={shift.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="min-w-[88px] rounded-2xl bg-white px-3 py-3 text-center ring-1 ring-slate-200">
                        <div className="text-lg font-bold text-slate-900">{shift.start}</div>
                        <div className="mt-1 text-xs text-slate-400">to</div>
                        <div className="mt-1 text-lg font-bold text-slate-900">{shift.end}</div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">{shift.employee}</h3>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleStyles(
                              shift.role
                            )}`}
                          >
                            {shift.role}
                          </span>
                          {employeeConfig && !employeeConfig.active ? (
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              Inactive Employee
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          Planned {getPlannedHours(shift).toFixed(1)} hrs
                        </p>

                        {shift.actualStart && shift.actualEnd ? (
                          <p className="mt-1 text-sm font-semibold text-emerald-700">
                            Actual {shift.actualStart} - {shift.actualEnd} • {workedHours.toFixed(1)} hrs
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">Actual not set yet</p>
                        )}

                        {shift.notes ? (
                          <p className="mt-2 text-sm text-slate-500">{shift.notes}</p>
                        ) : null}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="lg:min-w-[320px]">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {!shift.actualStart ? (
                            <button
                              onClick={() => punchIn(shift.id)}
                              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                              Punch In
                            </button>
                          ) : null}

                          {shift.actualStart && !shift.actualEnd ? (
                            <button
                              onClick={() => punchOut(shift.id)}
                              className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                            >
                              Punch Out
                            </button>
                          ) : null}

                          <button
                            onClick={() => setOpenMenuId(openMenuId === shift.id ? null : shift.id)}
                            className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                          >
                            Actions ▾
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Actual start"
                            maxLength={5}
                            value={shift.actualStart || ""}
                            onChange={(e) => {
                              const value = normalizeManualTimeInput(e.target.value);

                              setShifts((current: any) =>
                                current.map((s: any) =>
                                  s.id === shift.id
                                    ? {
                                        ...s,
                                        actualStart: value || undefined,
                                      }
                                    : s
                                )
                              );
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (!value || !isValidFullTime(value)) return;

                              setShifts((current: any) =>
                                current.map((s: any) =>
                                  s.id === shift.id
                                    ? {
                                        ...s,
                                        actualStart: roundTime(value),
                                      }
                                    : s
                                )
                              );
                            }}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                          />

                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Actual end"
                            maxLength={5}
                            value={shift.actualEnd || ""}
                            onChange={(e) => {
                              const value = normalizeManualTimeInput(e.target.value);

                              setShifts((current: any) =>
                                current.map((s: any) =>
                                  s.id === shift.id
                                    ? {
                                        ...s,
                                        actualEnd: value || undefined,
                                      }
                                    : s
                                )
                              );
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (!value || !isValidFullTime(value)) return;

                              setShifts((current: any) =>
                                current.map((s: any) =>
                                  s.id === shift.id
                                    ? {
                                        ...s,
                                        actualEnd: roundTime(value),
                                      }
                                    : s
                                )
                              );
                            }}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                          />
                        </div>

                        {openMenuId === shift.id ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                            <button
                              onClick={() => applyPlannedAsActual(shift.id)}
                              className="rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100"
                            >
                              Use Planned
                            </button>
                            <button
                              onClick={() => resetPunch(shift.id)}
                              className="rounded-xl px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50"
                            >
                              Reset Actual
                            </button>
                            <button
                              onClick={() => startEdit(shift)}
                              className="rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100"
                            >
                              Edit Shift
                            </button>
                            <button
                              onClick={() => deleteShift(shift.id)}
                              className="rounded-xl px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                            >
                              Delete Shift
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </section>
  );
}
