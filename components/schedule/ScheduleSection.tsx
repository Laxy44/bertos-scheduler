"use client";

// Small step: extracted mini component for shift card (cleaner + reusable)
const ShiftMiniCard = ({
  shift,
  getShiftStatusLabel,
  getShiftStatusStyles,
  onClick,
  disabled,
}: any) => {
  const isApproved = shift.approved === true;
  const hasSavedActual = Boolean(shift.actualStart) && Boolean(shift.actualEnd);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-3 py-2 text-left shadow-sm transition ${
        disabled ? "cursor-default" : "hover:border-slate-300"
      } ${
        isApproved
          ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-50"
          : hasSavedActual
          ? "border-blue-200 bg-blue-50 hover:bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-900">
            {shift.start}–{shift.end}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {shift.role}
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getShiftStatusStyles(
            shift
          )}`}
        >
          {getShiftStatusLabel(shift)}
        </span>
      </div>

      {shift.actualStart || shift.actualEnd ? (
        <div className="mt-2 text-[10px] text-slate-500">
          Actual {shift.actualStart || "--:--"} – {shift.actualEnd || "--:--"}
        </div>
      ) : null}
    </button>
  );
};

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
  updateShiftActualTimes,
  setShiftApproval,
  applyPlannedAsActual,
  startEdit,
  deleteShift,
  resetPunch,
  roleStyles,
  getPlannedHours,
  getWorkedHours,
  isAdmin,
  employeeName,
  onCreateShiftCta,
  onAddEmployeeCta,
}: any) {
  const scheduleGridEmployees =
    employeeFilter === "All"
      ? activeEmployeeNames
      : activeEmployeeNames.filter((name: string) => name === employeeFilter);

  const getShiftStatusLabel = (shift: any) => {
    if (shift.approved) return "Approved";
    if (shift.actualStart && shift.actualEnd) return "Actual saved";
    if (shift.actualStart && !shift.actualEnd) return "Clocked in";
    return "Planned";
  };

  const getShiftStatusStyles = (shift: any) => {
    if (shift.approved) {
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    }

    if (shift.actualStart && shift.actualEnd) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (shift.actualStart && !shift.actualEnd) {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-slate-200 bg-white text-slate-600";
  };

  const isOwnShift = (shift: any) => {
    return Boolean(employeeName) && shift.employee === employeeName;
  };

  const openQuickAddForCell = (employeeName: string, date: string, employeeInfo: any) => {
    setSelectedDate(date);
    setShiftRoleMode("default");
    setEditingId(null);
    setForm((current: any) => ({
      ...current,
      employee: employeeName,
      date,
      role: employeeRoleMap[employeeName] || employeeInfo?.defaultRole || current.role,
      start: current.start || "09:00",
      end: current.end || "17:00",
    }));
    setOpenMenuId(null);
    setShowShiftForm(true);
  };

  const openShiftFromGrid = (shift: any) => {
    if (!isAdmin && !isOwnShift(shift)) {
      return;
    }

    if (isAdmin) {
      setSelectedDate(shift.date);
      startEdit(shift);
      setOpenMenuId(null);
      setShowShiftForm(true);
      return;
    }

    setSelectedDate(shift.date);
    setOpenMenuId(null);
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
        {weekDates.map((item: any) => (
          <button
            key={item.date}
            onClick={() => {
              setSelectedDate(item.date);
              setForm((current: any) => ({ ...current, date: item.date }));
              setOpenMenuId(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedDate === item.date
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {item.dayName} • {item.date}
          </button>
        ))}
      </div>

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
              <div className="p-8">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-lg font-semibold text-slate-900">No shifts yet</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Start by adding employees or creating your first shift.
                  </p>
                  {isAdmin ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={onCreateShiftCta}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        + Create Shift
                      </button>
                      <button
                        type="button"
                        onClick={onAddEmployeeCta}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        + Add Employee
                      </button>
                    </div>
                  ) : null}
                </div>
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
                    <div className="sticky left-0 z-10 flex min-h-[126px] items-center border-r border-slate-200 bg-white p-4">
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
                      const totalPlannedHours = dayShifts.reduce(
                        (sum: number, shift: any) => sum + getPlannedHours(shift),
                        0
                      );
                      const totalWorkedHours = dayShifts.reduce(
                        (sum: number, shift: any) => sum + getWorkedHours(shift),
                        0
                      );

                      return (
                        <div
                          key={`${employeeName}-${item.date}`}
                          onClick={() => {
                            setSelectedDate(item.date);
                            setForm((current: any) => ({
                              ...current,
                              employee: employeeName,
                              date: item.date,
                              role:
                                employeeRoleMap[employeeName] ||
                                employeeInfo?.defaultRole ||
                                current.role,
                            }));
                            setOpenMenuId(null);
                          }}
                          className={`min-h-[126px] cursor-pointer border-r border-slate-200 p-3 text-left align-top transition last:border-r-0 ${
                            isSelected ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          {dayShifts.length > 0 ? (
                            <div>
                              <div className="mb-3 flex items-start justify-between gap-2">
                                <div>
                                  <div className="text-xs font-semibold text-slate-900">
                                    {dayShifts.length} shift{dayShifts.length === 1 ? "" : "s"}
                                  </div>
                                  <div className="mt-1 text-[11px] text-slate-500">
                                    Planned {totalPlannedHours.toFixed(1)}h
                                    {totalWorkedHours > 0
                                      ? ` • Actual ${totalWorkedHours.toFixed(1)}h`
                                      : ""}
                                  </div>
                                </div>
                                {isAdmin ? (
                                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                                    Edit day
                                  </span>
                                ) : null}
                              </div>

                              <div className="space-y-2">
                                {dayShifts.map((shift: any) => (
                                <ShiftMiniCard
                                  key={shift.id}
                                  shift={shift}
                                  getShiftStatusLabel={getShiftStatusLabel}
                                  getShiftStatusStyles={getShiftStatusStyles}
                                  onClick={() => openShiftFromGrid(shift)}
                                  disabled={!isAdmin && !isOwnShift(shift)}
                                />
                              ))}
                              </div>
                            </div>
                          ) : isUnavailable ? (
                            <div className="flex min-h-[96px] items-start">
                              <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                Unavailable
                              </div>
                            </div>
                          ) : (
                            <div className="flex min-h-[96px] flex-col items-start justify-between">
                              <div className="text-xs text-slate-400">No shift planned</div>
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openQuickAddForCell(employeeName, item.date, employeeInfo);
                                  }}
                                  className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-slate-400 hover:bg-slate-100"
                                >
                                  + Add shift
                                </button>
                              ) : null}
                            </div>
                          )}
                        </div>
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
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
            <p className="text-base font-semibold text-slate-900">No shifts yet</p>
            <p className="mt-2 text-sm">
              Start by adding employees or creating your first shift.
            </p>
            {isAdmin ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={onCreateShiftCta}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  + Create Shift
                </button>
                <button
                  type="button"
                  onClick={onAddEmployeeCta}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  + Add Employee
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          filteredShifts
            .slice()
            .sort((a: any, b: any) => a.start.localeCompare(b.start))
            .map((shift: any) => {
              const isApproved = shift.approved === true;
              const workedHours = getWorkedHours(shift);
              const employeeConfig = employees.find(
                (employee: any) => employee.name === shift.employee
              );

              return (
                <div
                  key={shift.id}
                  className={`rounded-3xl border p-4 transition ${
                    isApproved
                      ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
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

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <p className="text-sm text-slate-600">
                            Planned {getPlannedHours(shift).toFixed(1)} hrs
                          </p>
                          {isApproved ? (
                            <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                              Approved
                            </span>
                          ) : null}
                        </div>

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

                    {(isAdmin || isOwnShift(shift)) && (
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

                          {isAdmin ? (
                          <button
                            onClick={() => setOpenMenuId(openMenuId === shift.id ? null : shift.id)}
                            className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                          >
                            Actions ▾
                          </button>
                        ) : null}
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
                            onBlur={async (e) => {
                              const value = e.target.value;
                              if (!value || !isValidFullTime(value)) return;

                              const roundedValue = roundTime(value);

                              setShifts((current: any) =>
                                current.map((s: any) =>
                                  s.id === shift.id
                                    ? {
                                        ...s,
                                        actualStart: roundedValue,
                                      }
                                    : s
                                )
                              );

                              try {
                                await updateShiftActualTimes(
                                  shift.id,
                                  roundedValue,
                                  shift.actualEnd || null
                                );
                              } catch (error: any) {
                                alert(`Could not save actual start: ${error.message}`);
                              }
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
                            onBlur={async (e) => {
                              const value = e.target.value;
                              if (!value || !isValidFullTime(value)) return;

                              const roundedValue = roundTime(value);

                              setShifts((current: any) =>
                                current.map((s: any) =>
                                  s.id === shift.id
                                    ? {
                                        ...s,
                                        actualEnd: roundedValue,
                                      }
                                    : s
                                )
                              );

                              try {
                                await updateShiftActualTimes(
                                  shift.id,
                                  shift.actualStart || null,
                                  roundedValue
                                );
                              } catch (error: any) {
                                alert(`Could not save actual end: ${error.message}`);
                              }
                            }}
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                          />
                        </div>

                        {isAdmin && openMenuId === shift.id ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                            <button
                              onClick={() => applyPlannedAsActual(shift.id)}
                              className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Approve as Planned
                            </button>
                            {(shift.actualStart || shift.actualEnd) && !shift.approved ? (
                              <button
                                onClick={async () => {
                                  try {
                                    await setShiftApproval(shift.id, true);
                                  } catch (error: any) {
                                    alert(`Could not approve shift: ${error.message}`);
                                  }
                                }}
                                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                              >
                                Approve Actual
                              </button>
                            ) : null}
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
