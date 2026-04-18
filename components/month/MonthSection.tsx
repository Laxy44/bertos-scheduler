"use client";

import { useCallback, useMemo } from "react";
import { buildPlannerShiftHandlers } from "../../lib/schedule-planner-handlers";
import MonthScheduleView from "../schedule/views/MonthScheduleView";

type MonthSectionProps = {
  monthFilter: number;
  setMonthFilter: (n: number) => void;
  yearFilter: number;
  setYearFilter: (n: number) => void;
  yearsAvailable: number[];
  monthlyTotalPlanned: number;
  monthlyTotalWorked: number;
  shifts: any[];
  getPlannedHours: (s: any) => number;
  getWorkedHours: (s: any) => number;
  employeeNames: string[];
  employees: any[];
  monthlyHours: Record<string, { planned: number; worked: number }>;
  formatHours: (n: number) => string;
  employeeName?: string | null;
  monthNames: readonly string[];
  selectedDate: string;
  onMonthPlannerSelectDay: (date: string) => void;
  isAdmin: boolean;
  scheduleGridEmployees: string[];
  employeeRoleMap: Record<string, string>;
  setSelectedDate: (d: string) => void;
  setForm: (fn: any) => void;
  setOpenMenuId: (id: string | null) => void;
  setEditingId: (id: string | null) => void;
  setShiftRoleMode: (mode: "preset" | "custom") => void;
  setShowShiftForm: (show: boolean) => void;
  startEdit: (shift: any) => void;
  onCreateShiftCta: () => void;
};

export default function MonthSection({
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  yearsAvailable,
  monthlyTotalPlanned,
  monthlyTotalWorked,
  shifts,
  getPlannedHours,
  getWorkedHours,
  employeeNames,
  employees,
  monthlyHours,
  formatHours,
  employeeName,
  monthNames,
  selectedDate,
  onMonthPlannerSelectDay,
  isAdmin,
  scheduleGridEmployees,
  employeeRoleMap,
  setSelectedDate,
  setForm,
  setOpenMenuId,
  setEditingId,
  setShiftRoleMode,
  setShowShiftForm,
  startEdit,
  onCreateShiftCta,
}: MonthSectionProps) {
  const isReadOnly = !isAdmin;

  const gridShifts = useMemo(() => {
    if (!isReadOnly) return shifts;
    const self = (employeeName || "").trim();
    if (!self) return [];
    return shifts.filter((s: any) => s.employee === self);
  }, [isReadOnly, shifts, employeeName]);

  const employeeRateByName = useMemo(() => {
    return employees.reduce((acc: Record<string, number>, employee: any) => {
      acc[employee.name] = Number(employee.hourlyRate || 0);
      return acc;
    }, {});
  }, [employees]);

  const { openShiftFromGrid, onEmptyMonthDayQuickAdd } = useMemo(
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

  const onMonthSelectDay = useCallback(
    (date: string) => {
      onMonthPlannerSelectDay(date);
    },
    [onMonthPlannerSelectDay]
  );

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
          <p className="mt-1 text-3xl font-bold">{monthlyTotalPlanned.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-slate-900">
          <p className="text-sm text-emerald-700">Month Actual Hours</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{monthlyTotalWorked.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-slate-900">
          <p className="text-sm text-blue-700">Month Shifts</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">
            {
              shifts.filter((shift: any) => {
                const d = new Date(shift.date);
                return d.getMonth() + 1 === monthFilter && d.getFullYear() === yearFilter;
              }).length
            }
          </p>
        </div>
      </div>

      <div className="mt-2">
        <MonthScheduleView
          month={monthFilter}
          year={yearFilter}
          monthNames={monthNames}
          shifts={gridShifts}
          selectedDate={selectedDate}
          onMonthSelectDay={onMonthSelectDay}
          isReadOnly={isReadOnly}
          isAdmin={isAdmin}
          employeeRateByName={employeeRateByName}
          getPlannedHours={getPlannedHours}
          getWorkedHours={getWorkedHours}
          openShiftFromGrid={openShiftFromGrid}
          onEmptyMonthDayQuickAdd={onEmptyMonthDayQuickAdd}
        />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {employeeNames.map((employee: string) => {
          const employeeConfig = employees.find((item: any) => item.name === employee);

          return (
            <div
              key={employee}
              className={`rounded-2xl border p-4 ${
                employeeName && employee === employeeName ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"
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
              <p className="text-sm text-emerald-700">Actual: {formatHours(monthlyHours[employee].worked)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
