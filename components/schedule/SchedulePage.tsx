"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addCalendarMonthsFirst,
  formatScheduleRangeLabel,
  getPlannerColumnDates,
  snapAnchorForView,
  type ScheduleViewKind,
} from "../../lib/schedule-view-utils";
import { buildPlannerShiftHandlers } from "../../lib/schedule-planner-handlers";
import {
  addDays,
  fromDateInputValue,
  getMonthCalendarDays,
  getWeekDates,
  startOfWeekWithPreference,
  toDateInputValue,
  type WeekStartPreference,
} from "../../lib/utils";
import ScheduleBulkSelectionBar from "./ScheduleBulkSelectionBar";
import ScheduleControls from "./ScheduleControls";
import PlannerSubTabsRow from "./PlannerSubTabsRow";
import ScheduleViewRouter from "./ScheduleViewRouter";

/**
 * Single schedule experience: view router + controls; `isReadOnly` derives from admin membership.
 */
export default function SchedulePage(props: any) {
  const isReadOnly = !props.isAdmin;

  const {
    setWeekStart,
    monthNames,
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
    scheduleGridEmployees: scheduleGridEmployeesFromParent,
  } = props;

  const weekStartsOn: WeekStartPreference = props.weekStartsOn ?? "monday";

  const safeSetWeekStart = setWeekStart ?? (() => {});

  const [scheduleView, setScheduleView] = useState<ScheduleViewKind>("week");
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const shiftListSurfaceRef = useRef<HTMLDivElement>(null);
  const bulkBarRef = useRef<HTMLDivElement>(null);
  const [navigatorAnchor, setNavigatorAnchor] = useState<Date>(() => {
    const ws = props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart);
    return startOfWeekWithPreference(ws, weekStartsOn);
  });

  useEffect(() => {
    if (scheduleView !== "week" && scheduleView !== "two_weeks") return;
    const anchor = startOfWeekWithPreference(
      props.weekStart instanceof Date ? props.weekStart : new Date(props.weekStart),
      weekStartsOn
    );
    setNavigatorAnchor((prev) => (prev.getTime() === anchor.getTime() ? prev : anchor));
  }, [props.weekStart, scheduleView, weekStartsOn]);

  useEffect(() => {
    if (scheduleView !== "day") return;
    const d = fromDateInputValue(selectedDate);
    d.setHours(0, 0, 0, 0);
    setNavigatorAnchor((prev) => (prev.getTime() === d.getTime() ? prev : d));
  }, [selectedDate, scheduleView]);

  const handleViewKindChange = useCallback(
    (next: ScheduleViewKind) => {
      const ref = fromDateInputValue(selectedDate);
      const anchor = snapAnchorForView(next, ref, weekStartsOn);
      setNavigatorAnchor(anchor);
      safeSetWeekStart(startOfWeekWithPreference(ref, weekStartsOn));
      setScheduleView(next);
    },
    [selectedDate, safeSetWeekStart, weekStartsOn]
  );

  const handleGoPrev = useCallback(() => {
    if (scheduleView === "day") {
      const d = addDays(navigatorAnchor, -1);
      setNavigatorAnchor(d);
      setSelectedDate(toDateInputValue(d));
      safeSetWeekStart(startOfWeekWithPreference(d, weekStartsOn));
      return;
    }
    if (scheduleView === "week") {
      const d = addDays(navigatorAnchor, -7);
      setNavigatorAnchor(d);
      safeSetWeekStart(d);
      setSelectedDate(toDateInputValue(d));
      return;
    }
    if (scheduleView === "two_weeks") {
      const d = addDays(navigatorAnchor, -14);
      setNavigatorAnchor(d);
      safeSetWeekStart(d);
      setSelectedDate(toDateInputValue(d));
      return;
    }
    const firstPrev = addCalendarMonthsFirst(navigatorAnchor, -1);
    setNavigatorAnchor(firstPrev);
    safeSetWeekStart(startOfWeekWithPreference(firstPrev, weekStartsOn));
    setSelectedDate(toDateInputValue(firstPrev));
  }, [navigatorAnchor, scheduleView, safeSetWeekStart, setSelectedDate, weekStartsOn]);

  const handleGoNext = useCallback(() => {
    if (scheduleView === "day") {
      const d = addDays(navigatorAnchor, 1);
      setNavigatorAnchor(d);
      setSelectedDate(toDateInputValue(d));
      safeSetWeekStart(startOfWeekWithPreference(d, weekStartsOn));
      return;
    }
    if (scheduleView === "week") {
      const d = addDays(navigatorAnchor, 7);
      setNavigatorAnchor(d);
      safeSetWeekStart(d);
      setSelectedDate(toDateInputValue(d));
      return;
    }
    if (scheduleView === "two_weeks") {
      const d = addDays(navigatorAnchor, 14);
      setNavigatorAnchor(d);
      safeSetWeekStart(d);
      setSelectedDate(toDateInputValue(d));
      return;
    }
    const firstNext = addCalendarMonthsFirst(navigatorAnchor, 1);
    setNavigatorAnchor(firstNext);
    safeSetWeekStart(startOfWeekWithPreference(firstNext, weekStartsOn));
    setSelectedDate(toDateInputValue(firstNext));
  }, [navigatorAnchor, scheduleView, safeSetWeekStart, setSelectedDate, weekStartsOn]);

  const handleGoToday = useCallback(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (scheduleView === "day") {
      setNavigatorAnchor(t);
      safeSetWeekStart(startOfWeekWithPreference(t, weekStartsOn));
      setSelectedDate(toDateInputValue(t));
      return;
    }
    if (scheduleView === "week" || scheduleView === "two_weeks") {
      const w = startOfWeekWithPreference(t, weekStartsOn);
      setNavigatorAnchor(w);
      safeSetWeekStart(w);
      setSelectedDate(toDateInputValue(t));
      return;
    }
    const first = new Date(t.getFullYear(), t.getMonth(), 1);
    setNavigatorAnchor(first);
    safeSetWeekStart(startOfWeekWithPreference(t, weekStartsOn));
    setSelectedDate(toDateInputValue(t));
  }, [scheduleView, safeSetWeekStart, setSelectedDate, weekStartsOn]);

  const columnDates = useMemo(() => {
    if (scheduleView === "week") {
      return getWeekDates(startOfWeekWithPreference(navigatorAnchor, weekStartsOn), weekStartsOn);
    }
    if (scheduleView === "two_weeks") {
      return getPlannerColumnDates(
        startOfWeekWithPreference(navigatorAnchor, weekStartsOn),
        14
      );
    }
    if (scheduleView === "day") {
      return getPlannerColumnDates(navigatorAnchor, 1);
    }
    return getWeekDates(startOfWeekWithPreference(navigatorAnchor, weekStartsOn), weekStartsOn);
  }, [scheduleView, navigatorAnchor, weekStartsOn]);

  const visibleDateSet = useMemo(() => {
    if (scheduleView === "month") {
      const month = navigatorAnchor.getMonth() + 1;
      const year = navigatorAnchor.getFullYear();
      return new Set(getMonthCalendarDays(month, year).map((c) => c.date));
    }
    return new Set(columnDates.map((item: any) => item.date));
  }, [scheduleView, navigatorAnchor, columnDates]);

  const gridShifts = useMemo(() => {
    if (!isReadOnly) return shifts;
    const self = (employeeName || "").trim();
    if (!self) return [];
    return shifts.filter((s: any) => s.employee === self);
  }, [isReadOnly, shifts, employeeName]);

  const scheduleGridEmployees = useMemo(
    () =>
      scheduleGridEmployeesFromParent ??
      (employeeFilter === "All"
        ? employeeNames.filter((name: string) =>
            employees.some((employee: any) => employee.name === name && employee.active)
          )
        : employeeNames.filter((name: string) => name === employeeFilter)),
    [scheduleGridEmployeesFromParent, employeeFilter, employeeNames, employees]
  );

  const weekRangeLabel = useMemo(
    () => formatScheduleRangeLabel(scheduleView, navigatorAnchor, monthNames, weekStartsOn),
    [scheduleView, navigatorAnchor, monthNames, weekStartsOn]
  );

  const visiblePeriodShifts = useMemo(
    () => gridShifts.filter((shift: any) => visibleDateSet.has(shift.date)),
    [gridShifts, visibleDateSet]
  );

  const employeeRateByName = useMemo(
    () =>
      employees.reduce((acc: Record<string, number>, employee: any) => {
        acc[employee.name] = Number(employee.hourlyRate || 0);
        return acc;
      }, {}),
    [employees]
  );

  const { weeklyPlannedHours, weeklyWorkedHours, weeklyPlannedPayroll, weeklyWorkedPayroll } =
    useMemo(() => {
      const weeklyPlannedHoursInner = visiblePeriodShifts.reduce(
        (sum: number, shift: any) => sum + getPlannedHours(shift),
        0
      );
      const weeklyWorkedHoursInner = visiblePeriodShifts.reduce(
        (sum: number, shift: any) => sum + getWorkedHours(shift),
        0
      );
      const weeklyPlannedPayrollInner = visiblePeriodShifts.reduce((sum: number, shift: any) => {
        return sum + getPlannedHours(shift) * (employeeRateByName[shift.employee] || 0);
      }, 0);
      const weeklyWorkedPayrollInner = visiblePeriodShifts.reduce((sum: number, shift: any) => {
        return sum + getWorkedHours(shift) * (employeeRateByName[shift.employee] || 0);
      }, 0);
      return {
        weeklyPlannedHours: weeklyPlannedHoursInner,
        weeklyWorkedHours: weeklyWorkedHoursInner,
        weeklyPlannedPayroll: weeklyPlannedPayrollInner,
        weeklyWorkedPayroll: weeklyWorkedPayrollInner,
      };
    }, [visiblePeriodShifts, employeeRateByName, getPlannedHours, getWorkedHours]);

  const { openQuickAddForCell, openShiftFromGrid, onEmptyMonthDayQuickAdd } = useMemo(
    () =>
      buildPlannerShiftHandlers({
        isReadOnly,
        isAdmin,
        employeeName: employeeName || "",
        scheduleGridEmployees,
        employees,
        employeeRoleMap,
        setSelectedDate,
        setShiftRoleMode,
        setEditingId,
        setForm,
        setOpenMenuId,
        setShowShiftForm,
        startEdit,
        onCreateShiftCta,
      }),
    [
      isReadOnly,
      isAdmin,
      employeeName,
      scheduleGridEmployees,
      employees,
      employeeRoleMap,
      setSelectedDate,
      setShiftRoleMode,
      setEditingId,
      setForm,
      setOpenMenuId,
      setShowShiftForm,
      startEdit,
      onCreateShiftCta,
    ]
  );

  const self = (employeeName || "").trim();
  const isOwnShift = (shift: any) => Boolean(self) && shift.employee === self;

  const onPickMonthCalendarDate = useCallback(
    (date: string) => {
      const d = fromDateInputValue(date);
      setNavigatorAnchor(new Date(d.getFullYear(), d.getMonth(), 1));
      safeSetWeekStart(startOfWeekWithPreference(d, weekStartsOn));
      setSelectedDate(date);
      setForm((current: any) => ({ ...current, date }));
      setOpenMenuId(null);
    },
    [safeSetWeekStart, setSelectedDate, setForm, setOpenMenuId, weekStartsOn]
  );

  const kpiCardClass = isReadOnly
    ? "flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200/90 bg-slate-50 px-4 py-3 shadow-sm"
    : "flex min-h-[92px] flex-col justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm";

  const selectedCount = selectedShiftIds.length;

  const toggleShiftSelected = useCallback(
    (id: string) => {
      setSelectedShiftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      setOpenMenuId(null);
    },
    [setOpenMenuId]
  );

  const clearShiftSelection = useCallback(() => {
    setSelectedShiftIds([]);
    setOpenMenuId(null);
  }, [setOpenMenuId]);

  useEffect(() => {
    setSelectedShiftIds([]);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedCount === 0) return;
    function onMouseDown(e: MouseEvent) {
      const node = e.target as Node;
      if (shiftListSurfaceRef.current?.contains(node)) return;
      if (bulkBarRef.current?.contains(node)) return;
      setSelectedShiftIds([]);
      setOpenMenuId(null);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [selectedCount, setOpenMenuId]);

  useEffect(() => {
    if (selectedCount === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedShiftIds([]);
        setOpenMenuId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCount, setOpenMenuId]);

  const handleBulkEdit = useCallback(() => {
    if (selectedShiftIds.length !== 1) return;
    const id = selectedShiftIds[0];
    const shift = shifts.find((s: any) => s.id === id);
    if (!shift) return;
    setSelectedShiftIds([]);
    setOpenMenuId(null);
    startEdit(shift);
  }, [selectedShiftIds, shifts, startEdit, setOpenMenuId]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedShiftIds.length === 0) return;
    if (!confirm(`Delete ${selectedShiftIds.length} shifts? This cannot be undone.`)) return;
    const ids = [...selectedShiftIds];
    setSelectedShiftIds([]);
    setOpenMenuId(null);
    for (const id of ids) {
      await deleteShift(id);
    }
  }, [selectedShiftIds, deleteShift, setOpenMenuId]);

  const handleBulkApprove = useCallback(async () => {
    if (selectedShiftIds.length === 0) return;
    const ids = [...selectedShiftIds];
    try {
      for (const id of ids) {
        const shift = shifts.find((s: any) => s.id === id);
        if (shift && !shift.approved) {
          await setShiftApproval(id, true);
        }
      }
      setSelectedShiftIds([]);
      setOpenMenuId(null);
    } catch (e: any) {
      alert(e?.message || "Could not approve one or more shifts.");
    }
  }, [selectedShiftIds, shifts, setShiftApproval, setOpenMenuId]);

  return (
    <section className="w-full space-y-4 sm:space-y-5">
      {isReadOnly ? (
        <ScheduleControls
          isReadOnly
          viewKind={scheduleView}
          onViewKindChange={handleViewKindChange}
          goToday={handleGoToday}
          goPrev={handleGoPrev}
          goNext={handleGoNext}
          weekRangeLabel={weekRangeLabel}
        />
      ) : (
        <div className="space-y-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <ScheduleControls
            isReadOnly={false}
            viewKind={scheduleView}
            onViewKindChange={handleViewKindChange}
            goToday={handleGoToday}
            goPrev={handleGoPrev}
            goNext={handleGoNext}
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

      <ScheduleViewRouter
        view={scheduleView}
        month={navigatorAnchor.getMonth() + 1}
        year={navigatorAnchor.getFullYear()}
        monthNames={monthNames}
        onMonthSelectDay={onPickMonthCalendarDate}
        columnDates={columnDates}
        isReadOnly={isReadOnly}
        isAdmin={isAdmin}
        employeeRateByName={employeeRateByName}
        shifts={gridShifts}
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
        onEmptyMonthDayQuickAdd={onEmptyMonthDayQuickAdd}
      />

      <div className="w-full">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Worked hours</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">
              {weeklyWorkedHours.toFixed(1)}
            </p>
          </div>
          <div className={kpiCardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payroll (worked)</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-emerald-800">
              £{weeklyWorkedPayroll.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={shiftListSurfaceRef}
        className={`rounded-lg border p-5 shadow-sm sm:p-6 ${
          isReadOnly ? "border-slate-200/90 bg-slate-50/60" : "border-slate-200 bg-white"
        } ${!isReadOnly && selectedCount > 0 ? "pb-28 sm:pb-24" : ""}`}
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
                    className={`flex gap-3 rounded-2xl border p-3 ${
                      isApproved ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div
                      className="flex shrink-0 items-start pt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedShiftIds.includes(shift.id)}
                        onChange={() => toggleShiftSelected(shift.id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label={`Select shift for ${shift.employee}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
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
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {isAdmin ? (
        <ScheduleBulkSelectionBar
          barRef={bulkBarRef}
          count={selectedCount}
          onDeselectAll={clearShiftSelection}
          onEdit={handleBulkEdit}
          onDelete={handleBulkDelete}
          onApprove={handleBulkApprove}
          editDisabled={selectedCount !== 1}
        />
      ) : null}
    </section>
  );
}
