"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import ShiftMiniCard from "./ShiftMiniCard";
import ScheduleControlsBar from "./ScheduleControlsBar";
import PlannerSubTabsRow from "./PlannerSubTabsRow";

/** Admin / owner planner: full grid, planning tools, and shift management. */
export default function AdminScheduleBoard({
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
}: any) {
  const [activeEmployeeRow, setActiveEmployeeRow] = useState<string | null>(null);

  const scheduleGridEmployees =
    employeeFilter === "All"
      ? employeeNames.filter((name: string) =>
          employees.some((employee: any) => employee.name === name && employee.active)
        )
      : employeeNames.filter((name: string) => name === employeeFilter);

  const dayShiftCountMap = weekDates.reduce((acc: Record<string, number>, item: any) => {
    acc[item.date] = shifts.filter((shift: any) => shift.date === item.date).length;
    return acc;
  }, {});

  const weekRangeLabel = `${weekDates[0]?.date || ""} - ${
    weekDates[weekDates.length - 1]?.date || ""
  }`;
  const todayDate = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

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

  const getShiftStatusLabel = (shift: any) => {
    if (shift.approved) return "Approved";
    if (shift.actualStart && shift.actualEnd) return "Actual saved";
    if (shift.actualStart && !shift.actualEnd) return "Clocked in";
    return "Planned";
  };

  const getShiftStatusStyles = (shift: any) => {
    if (shift.approved) return "border-emerald-300 bg-emerald-100 text-emerald-800";
    if (shift.actualStart) return "border-blue-200 bg-blue-50 text-blue-700";
    return "border-slate-200 bg-white text-slate-600";
  };

  const self = (employeeName || "").trim();
  const isOwnShift = (shift: any) => Boolean(self) && shift.employee === self;

  const openQuickAddForCell = (employeeNameValue: string, date: string, employeeInfo: any) => {
    setSelectedDate(date);
    setShiftRoleMode("default");
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

  const getEmployeeWeekStats = (employeeNameValue: string) => {
    const employeeShifts = visibleWeekShifts.filter(
      (shift: any) => shift.employee === employeeNameValue
    );
    const planned = employeeShifts.reduce(
      (sum: number, shift: any) => sum + getPlannedHours(shift),
      0
    );
    return { shifts: employeeShifts.length, planned };
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "--";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };

  const gridTemplate =
    "grid grid-cols-[minmax(14rem,17rem)_repeat(7,minmax(7.75rem,1fr))]";

  return (
    <section className="w-full space-y-5">
      <div className="space-y-0 rounded-xl border border-slate-200 bg-white shadow-sm">
        <ScheduleControlsBar
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

      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[76vh] w-full overflow-auto">
          <div className="min-w-[1020px]">
            <div
              className={`sticky top-0 z-20 ${gridTemplate} border-b-2 border-slate-200 bg-slate-100 shadow-[0_1px_0_0_rgba(15,23,42,0.06)]`}
            >
              <div className="sticky left-0 z-30 border-r-2 border-slate-200 bg-slate-100 px-3 py-3 shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] sm:px-4 sm:py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Schedule</p>
                <p className="mt-0.5 text-sm font-semibold leading-tight text-slate-900">People & open shifts</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">Rail stays fixed while you scroll dates.</p>
              </div>
              {weekDates.map((item: any) => {
                const dateObj = new Date(item.date);
                const isSelected = selectedDate === item.date;
                const isToday = item.date === todayDate;
                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.date);
                      setForm((current: any) => ({ ...current, date: item.date }));
                      setOpenMenuId(null);
                    }}
                    className={`border-r border-slate-200 px-3 py-3 text-left transition last:border-r-0 sm:px-4 sm:py-3.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-[inset_0_-3px_0_rgba(255,255,255,0.12)]"
                        : isToday
                        ? "bg-sky-50 text-slate-900 ring-1 ring-inset ring-sky-200/90 hover:bg-sky-100/80"
                        : "bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        isSelected ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      {item.dayName.slice(0, 3)}
                    </div>
                    <div className="mt-1 text-base font-bold tabular-nums">
                      {String(dateObj.getDate()).padStart(2, "0")}
                    </div>
                    <div
                      className={`mt-0.5 text-xs font-medium ${
                        isSelected ? "text-indigo-100" : isToday ? "text-sky-800" : "text-slate-500"
                      }`}
                    >
                      {dateObj.toLocaleString("en-US", { month: "short" })}
                    </div>
                    <div
                      className={`mt-1 text-[11px] font-medium tabular-nums ${
                        isSelected ? "text-indigo-100/90" : "text-slate-500"
                      }`}
                    >
                      {dayShiftCountMap[item.date] || 0} shifts
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={`${gridTemplate} border-b border-slate-200 bg-slate-50/40`}>
              <div className="sticky left-0 z-10 border-r-2 border-slate-200 bg-slate-50 px-3 py-3 shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] sm:px-4">
                <div className="rounded-md border border-dashed border-slate-300 bg-white px-2.5 py-2 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Open shifts</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">0 unassigned</p>
                </div>
              </div>
              {weekDates.map((item: any) => (
                <div
                  key={`open-${item.date}`}
                  className={`min-h-[92px] border-r border-slate-200 bg-white px-2.5 py-2.5 transition last:border-r-0 sm:min-h-[96px] sm:px-3 sm:py-3 ${
                    item.date === todayDate ? "bg-sky-50/60" : ""
                  }`}
                >
                  <div className="text-[11px] font-medium text-slate-500">No open shift</div>
                </div>
              ))}
            </div>

            {scheduleGridEmployees.length === 0 ? (
              <div className={gridTemplate}>
                <div className="sticky left-0 z-10 border-r-2 border-slate-200 bg-slate-50 p-3 sm:p-4">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={onAddEmployeeCta}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      + Create employee
                    </button>
                  ) : null}
                </div>
                <div className="col-span-7 p-8 text-center sm:p-10">
                  <p className="text-lg font-semibold text-slate-900">No shifts scheduled yet</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Click a cell to create your first shift, or add more employees.
                  </p>
                  {isAdmin ? (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={onCreateShiftCta}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                      >
                        Create shift
                      </button>
                      <button
                        type="button"
                        onClick={onAddEmployeeCta}
                        className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      >
                        Add employee
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {scheduleGridEmployees.map((employeeNameValue: string) => {
                  const employeeInfo = employees.find((employee: any) => employee.name === employeeNameValue);
                  const employeeStats = getEmployeeWeekStats(employeeNameValue);
                  return (
                    <div
                      key={employeeNameValue}
                      className={`${gridTemplate} border-b border-slate-200 transition last:border-b-0 ${
                        activeEmployeeRow === employeeNameValue ? "bg-slate-50/80" : "bg-white"
                      }`}
                      onMouseEnter={() => setActiveEmployeeRow(employeeNameValue)}
                    >
                      <div
                        className={`sticky left-0 z-10 border-r-2 border-slate-200 px-3 py-3 shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] transition sm:px-4 sm:py-3.5 ${
                          activeEmployeeRow === employeeNameValue
                            ? "bg-slate-100"
                            : "bg-slate-50 hover:bg-slate-100/90"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-950 text-xs font-bold text-white shadow-sm">
                            {getInitials(employeeNameValue)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{employeeNameValue}</p>
                            <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-500">
                              {employeeInfo?.defaultRole || "No role"} · {employeeStats.shifts} shifts ·{" "}
                              {employeeStats.planned.toFixed(1)}h planned
                            </p>
                          </div>
                        </div>
                      </div>
                      {weekDates.map((item: any) => {
                        const dayShifts = shifts
                          .filter((shift: any) => shift.employee === employeeNameValue && shift.date === item.date)
                          .sort((a: any, b: any) => a.start.localeCompare(b.start));
                        const isUnavailable = employeeInfo?.unavailableDates?.includes(item.date);
                        const isSelected = selectedDate === item.date;
                        const totalPlannedHours = dayShifts.reduce((sum: number, shift: any) => sum + getPlannedHours(shift), 0);
                        const totalWorkedHours = dayShifts.reduce((sum: number, shift: any) => sum + getWorkedHours(shift), 0);
                        return (
                          <div
                            key={`${employeeNameValue}-${item.date}`}
                            onClick={() => {
                              setSelectedDate(item.date);
                              setActiveEmployeeRow(employeeNameValue);
                              setForm((current: any) => ({
                                ...current,
                                employee: employeeNameValue,
                                date: item.date,
                                role: employeeRoleMap[employeeNameValue] || employeeInfo?.defaultRole || current.role,
                              }));
                              setOpenMenuId(null);
                            }}
                            className={`group min-h-[118px] cursor-pointer border-r border-slate-200 bg-white px-2.5 py-2.5 align-top transition last:border-r-0 sm:min-h-[128px] sm:px-3 sm:py-3 ${
                              isSelected
                                ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300/90"
                                : item.date === todayDate
                                ? "bg-sky-50/70 hover:bg-sky-50"
                                : "hover:bg-slate-50/90"
                            }`}
                          >
                            {dayShifts.length > 0 ? (
                              <div>
                                <div className="mb-3 flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-xs font-semibold text-slate-900">{dayShifts.length} shift{dayShifts.length === 1 ? "" : "s"}</div>
                                    <div className="mt-1 text-[11px] text-slate-500">
                                      Planned {totalPlannedHours.toFixed(1)}h{totalWorkedHours > 0 ? ` • Actual ${totalWorkedHours.toFixed(1)}h` : ""}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
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
                              <div className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900">
                                Unavailable
                              </div>
                            ) : (
                              <div className="flex h-full flex-col justify-between">
                                <div className="text-xs text-slate-400 transition group-hover:text-slate-500">
                                  No shift planned
                                </div>
                                {isAdmin ? (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openQuickAddForCell(employeeNameValue, item.date, employeeInfo);
                                    }}
                                    className="w-fit rounded-full border border-dashed border-slate-300 px-3 py-1 text-[11px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100 hover:border-slate-400 hover:bg-slate-100"
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
                })}

                <div className={`${gridTemplate} border-t border-slate-200 bg-slate-50/50`}>
                  <div className="sticky left-0 z-10 border-r-2 border-slate-200 bg-slate-50 p-3 sm:p-4">
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={onAddEmployeeCta}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                      >
                        + Create employee
                      </button>
                    ) : null}
                  </div>
                  {weekDates.map((item: any) => (
                    <div
                      key={`foot-${item.date}`}
                      className="min-h-[52px] border-r border-slate-200 bg-white px-2.5 py-2 last:border-r-0 sm:min-h-[56px] sm:px-3 sm:py-2.5"
                    >
                      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-300">—</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Planned hours</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{weeklyPlannedHours.toFixed(1)}</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payroll (planned)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">£{weeklyPlannedPayroll.toFixed(2)}</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Revenue (forecast)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">£{weeklyForecastRevenue.toFixed(2)}</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Revenue (actual)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">£{weeklyActualRevenue.toFixed(2)}</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payroll %</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{payrollPercentage.toFixed(1)}%</p>
          </div>
          <div className="flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Worked hours</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{weeklyWorkedHours.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{selectedDayName}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Shift list and time actions for the selected day.</p>
          </div>
          <p className="text-xs font-semibold tabular-nums text-slate-600 sm:text-right">
            Planned {dayHours.toFixed(1)}h <span className="text-slate-300">·</span> Actual {dayWorkedHours.toFixed(1)}h
          </p>
        </div>
        {filteredShifts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">Nothing scheduled</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Pick another day in the grid or add a shift to build coverage for this date.
            </p>
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
                  <div key={shift.id} className={`rounded-2xl border p-3 ${isApproved ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {shift.employee} • {shift.start}-{shift.end}
                          </p>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleStyles(shift.role)}`}>
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
                            <button onClick={() => punchIn(shift.id)} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Punch In</button>
                          ) : null}
                          {shift.actualStart && !shift.actualEnd ? (
                            <button onClick={() => punchOut(shift.id)} className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">Punch Out</button>
                          ) : null}
                          {isAdmin ? (
                            <button onClick={() => setOpenMenuId(openMenuId === shift.id ? null : shift.id)} className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
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
                              current.map((s: any) => (s.id === shift.id ? { ...s, actualStart: value || undefined } : s))
                            );
                          }}
                          onBlur={async (e) => {
                            const value = e.target.value;
                            if (!value || !isValidFullTime(value)) return;
                            const roundedValue = roundTime(value);
                            setShifts((current: any) =>
                              current.map((s: any) => (s.id === shift.id ? { ...s, actualStart: roundedValue } : s))
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
                              current.map((s: any) => (s.id === shift.id ? { ...s, actualEnd: value || undefined } : s))
                            );
                          }}
                          onBlur={async (e) => {
                            const value = e.target.value;
                            if (!value || !isValidFullTime(value)) return;
                            const roundedValue = roundTime(value);
                            setShifts((current: any) =>
                              current.map((s: any) => (s.id === shift.id ? { ...s, actualEnd: roundedValue } : s))
                            );
                            await updateShiftActualTimes(shift.id, shift.actualStart || null, roundedValue);
                          }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                        />
                      </div>
                    )}

                    {isAdmin && openMenuId === shift.id ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                        <button onClick={() => applyPlannedAsActual(shift.id)} className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                          Approve as Planned
                        </button>
                        {(shift.actualStart || shift.actualEnd) && !shift.approved ? (
                          <button onClick={() => setShiftApproval(shift.id, true)} className="rounded-xl px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                            Approve Actual
                          </button>
                        ) : null}
                        <button onClick={() => resetPunch(shift.id)} className="rounded-xl px-3 py-2 text-left text-xs text-amber-700 hover:bg-amber-50">
                          Reset Actual
                        </button>
                        <button onClick={() => startEdit(shift)} className="rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-100">
                          Edit Shift
                        </button>
                        <button onClick={() => deleteShift(shift.id)} className="rounded-xl px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50">
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
