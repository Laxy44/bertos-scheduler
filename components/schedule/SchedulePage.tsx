"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import ScheduleControls from "./ScheduleControls";
import PlannerSubTabsRow from "./PlannerSubTabsRow";
import ScheduleGrid from "./ScheduleGrid";

/**
 * Single schedule experience: shared grid + controls; `isReadOnly` derives from admin membership.
 */
export default function SchedulePage(props: any) {
  const isReadOnly = !props.isAdmin;

  const {
    goPrev,
    goNext,
    goToday,
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
    setShiftRoleMode,
    setShowShiftForm,
    setShifts,
    openMenuId,
    punchIn,
    punchOut,
    normalizeManualTimeInput,
    isValidFullTime,
    roundTime,
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
    dayHours,
    dayWorkedHours,
  } = props;

  const scheduleGridEmployees =
    employeeFilter === "All"
      ? employeeNames.filter((name: string) =>
          employees.some((employee: any) => employee.name === name && employee.active)
        )
      : employeeNames.filter((name: string) => name === employeeFilter);

  const weekRangeLabel = `${weekDates[0]?.date || ""} - ${
    weekDates[weekDates.length - 1]?.date || ""
  }`;

  const weekDateSet = new Set(weekDates.map((item: any) => item.date));
  const visibleWeekShifts = shifts.filter((shift: any) => weekDateSet.has(shift.date));

  const employeeRateByName = employees.reduce((acc: Record<string, number>, employee: any) => {
    acc[employee.name] = Number(employee.hourlyRate || 0);
    return acc;
  }, {});

  const weeklyPlannedHours = visibleWeekShifts.reduce(
    (sum: number, shift: any) => sum + getPlannedHours(shift),
    0
  );
  const weeklyWorkedHours = visibleWeekShifts.reduce(
    (sum: number, shift: any) => sum + getWorkedHours(shift),
    0
  );
  const weeklyPlannedPayroll = visibleWeekShifts.reduce((sum: number, shift: any) => {
    return sum + getPlannedHours(shift) * (employeeRateByName[shift.employee] || 0);
  }, 0);
  const weeklyWorkedPayroll = visibleWeekShifts.reduce((sum: number, shift: any) => {
    return sum + getWorkedHours(shift) * (employeeRateByName[shift.employee] || 0);
  }, 0);

  const weeklyForecastRevenue = 0;
  const weeklyActualRevenue = 0;
  const payrollPercentage =
    weeklyActualRevenue > 0 ? (weeklyWorkedPayroll / weeklyActualRevenue) * 100 : 0;

  const self = (employeeName || "").trim();
  const isOwnShift = (shift: any) => Boolean(self) && shift.employee === self;

  const openQuickAddForCell = (employeeNameValue: string, date: string, employeeInfo: any) => {
    if (isReadOnly) return;
    setSelectedDate(date);
    setShiftRoleMode("preset");
    setEditingId(null);
    setForm((current: any) => ({
      ...current,
      employee: employeeNameValue,
      date,
      role: employeeRoleMap[employeeNameValue] || employeeInfo?.defaultRole || current.role,
      start: current.start || "09:00",
      end: current.end || "17:00",
    }));
    setOpenMenuId(null);
    setShowShiftForm(true);
  };

  const openShiftFromGrid = (shift: any) => {
    if (isReadOnly) return;
    if (!isAdmin && !isOwnShift(shift)) return;
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

  const kpiCardClass = isReadOnly
    ? "flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200/90 bg-slate-50 px-4 py-3 shadow-sm"
    : "flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm";

  return (
    <section className="w-full space-y-4 sm:space-y-5">
      {isReadOnly ? (
        <ScheduleControls
          isReadOnly
          goToday={goToday}
          goPrev={goPrev}
          goNext={goNext}
          weekRangeLabel={weekRangeLabel}
        />
      ) : (
        <div className="space-y-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <ScheduleControls
            isReadOnly={false}
            goToday={goToday}
            goPrev={goPrev}
            goNext={goNext}
            weekRangeLabel={weekRangeLabel}
          />
          <PlannerSubTabsRow
            employeeFilter={employeeFilter}
            setEmployeeFilter={setEmployeeFilter}
            employeeNames={employeeNames}
            onAddEmployeeCta={onAddEmployeeCta}
          />
        </div>
      )}

      <ScheduleGrid
        isReadOnly={isReadOnly}
        weekDates={weekDates}
        shifts={shifts}
        employees={employees}
        scheduleGridEmployees={scheduleGridEmployees}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        setForm={setForm}
        setOpenMenuId={setOpenMenuId}
        employeeRoleMap={employeeRoleMap}
        getPlannedHours={getPlannedHours}
        getWorkedHours={getWorkedHours}
        onCreateShiftCta={onCreateShiftCta}
        onAddEmployeeCta={onAddEmployeeCta}
        openQuickAddForCell={openQuickAddForCell}
        openShiftFromGrid={openShiftFromGrid}
      />

      <div className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Planned hours</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {weeklyPlannedHours.toFixed(1)}
            </p>
          </div>
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payroll (planned)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              £{weeklyPlannedPayroll.toFixed(2)}
            </p>
          </div>
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Revenue (forecast)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              £{weeklyForecastRevenue.toFixed(2)}
            </p>
          </div>
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Revenue (actual)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              £{weeklyActualRevenue.toFixed(2)}
            </p>
          </div>
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payroll %</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {payrollPercentage.toFixed(1)}%
            </p>
          </div>
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Worked hours</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {weeklyWorkedHours.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg border p-5 shadow-sm sm:p-6 ${
          isReadOnly ? "border-slate-200/90 bg-slate-50/60" : "border-slate-200 bg-white"
        }`}
      >
        <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{selectedDayName}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {isReadOnly
                ? "Your shifts on this day (read-only)."
                : "Shift list and time actions for the selected day."}
            </p>
          </div>
          <p className="text-xs font-semibold tabular-nums text-slate-600 sm:text-right">
            Planned {dayHours.toFixed(1)}h <span className="text-slate-300">·</span> Actual{" "}
            {dayWorkedHours.toFixed(1)}h
          </p>
        </div>
        {filteredShifts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">Nothing scheduled</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              {isReadOnly
                ? "Pick another day in the grid or check back when shifts are published."
                : "Pick another day in the grid or add a shift to build coverage for this date."}
            </p>
          </div>
        ) : isReadOnly ? (
          <div className="space-y-3">
            {filteredShifts
              .slice()
              .sort((a: any, b: any) => a.start.localeCompare(b.start))
              .map((shift: any) => {
                const workedHours = getWorkedHours(shift);
                const status = shift.approved
                  ? "Approved"
                  : shift.actualStart && shift.actualEnd
                  ? "Actual saved"
                  : shift.actualStart
                  ? "Clocked in"
                  : "Planned";
                return (
                  <div
                    key={shift.id}
                    className={`rounded-2xl border p-4 ${
                      shift.approved
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {shift.start}–{shift.end}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleStyles(
                          shift.role
                        )}`}
                      >
                        {shift.role}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Planned {getPlannedHours(shift).toFixed(1)}h · Actual {workedHours.toFixed(1)}h
                    </p>
                    {shift.notes ? (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-medium text-slate-500">Notes: </span>
                        {shift.notes}
                      </p>
                    ) : null}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShifts
              .slice()
              .sort((a: any, b: any) => a.start.localeCompare(b.start))
              .map((shift: any) => {
                const isApproved = shift.approved === true;
                const workedHours = getWorkedHours(shift);
                return (
                  <div
                    key={shift.id}
                    className={`rounded-2xl border p-3 ${
                      isApproved ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {shift.employee} • {shift.start}-{shift.end}
                          </p>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleStyles(
                              shift.role
                            )}`}
                          >
                            {shift.role}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Planned {getPlannedHours(shift).toFixed(1)}h • Actual {workedHours.toFixed(1)}h
                        </p>
                      </div>
                      {(isAdmin || isOwnShift(shift)) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {!shift.actualStart ? (
                            <button
                              type="button"
                              onClick={() => punchIn(shift.id)}
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Punch In
                            </button>
                          ) : null}
                          {shift.actualStart && !shift.actualEnd ? (
                            <button
                              type="button"
                              onClick={() => punchOut(shift.id)}
                              className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                            >
                              Punch Out
                            </button>
                          ) : null}
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === shift.id ? null : shift.id)}
                              className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                            >
                              Actions
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {(isAdmin || isOwnShift(shift)) && (
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
                                s.id === shift.id ? { ...s, actualStart: value || undefined } : s
                              )
                            );
                          }}
                          onBlur={async (e) => {
                            const value = e.target.value;
                            if (!value || !isValidFullTime(value)) return;
                            const roundedValue = roundTime(value);
                            setShifts((current: any) =>
                              current.map((s: any) =>
                                s.id === shift.id ? { ...s, actualStart: roundedValue } : s
                              )
                            );
                            await updateShiftActualTimes(shift.id, roundedValue, shift.actualEnd || null);
                          }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
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
                                s.id === shift.id ? { ...s, actualEnd: value || undefined } : s
                              )
                            );
                          }}
                          onBlur={async (e) => {
                            const value = e.target.value;
                            if (!value || !isValidFullTime(value)) return;
                            const roundedValue = roundTime(value);
                            setShifts((current: any) =>
                              current.map((s: any) =>
                                s.id === shift.id ? { ...s, actualEnd: roundedValue } : s
                              )
                            );
                            await updateShiftActualTimes(shift.id, shift.actualStart || null, roundedValue);
                          }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                      </div>
                    )}

                    {isAdmin && openMenuId === shift.id ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                        <button
                          type="button"
                          onClick={() => applyPlannedAsActual(shift.id)}
                          className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          Approve as Planned
                        </button>
                        {(shift.actualStart || shift.actualEnd) && !shift.approved ? (
                          <button
                            type="button"
                            onClick={() => setShiftApproval(shift.id, true)}
                            className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                          >
                            Approve Actual
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => resetPunch(shift.id)}
                          className="rounded-xl px-3 py-2 text-left text-xs text-amber-700 hover:bg-amber-50"
                        >
                          Reset Actual
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(shift)}
                          className="rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-100"
                        >
                          Edit Shift
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteShift(shift.id)}
                          className="rounded-xl px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50"
                        >
                          Delete Shift
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
