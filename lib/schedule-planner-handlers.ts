/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared shift interactions for week/day grids and month planner surfaces.
 * Keeps create / edit / month empty-day behavior aligned across views.
 */
export type PlannerShiftHandlerDeps = {
  isReadOnly: boolean;
  isAdmin: boolean;
  employeeName: string;
  scheduleGridEmployees: string[];
  employees: any[];
  employeeRoleMap: Record<string, string>;
  setSelectedDate: (d: string) => void;
  setShiftRoleMode: (mode: "preset" | "custom") => void;
  setEditingId: (id: string | null) => void;
  setForm: (updater: any) => void;
  setOpenMenuId: (id: string | null) => void;
  setShowShiftForm: (show: boolean) => void;
  startEdit: (shift: any) => void;
  onCreateShiftCta: () => void;
};

export function buildPlannerShiftHandlers(deps: PlannerShiftHandlerDeps) {
  const self = (deps.employeeName || "").trim();
  const isOwnShift = (shift: any) => Boolean(self) && shift.employee === self;

  function openQuickAddForCell(employeeNameValue: string, date: string, employeeInfo: any) {
    if (deps.isReadOnly) return;
    deps.setSelectedDate(date);
    deps.setShiftRoleMode("preset");
    deps.setEditingId(null);
    deps.setForm((current: any) => ({
      ...current,
      employee: employeeNameValue,
      date,
      role: deps.employeeRoleMap[employeeNameValue] || employeeInfo?.defaultRole || current.role,
      start: current.start || "09:00",
      end: current.end || "17:00",
    }));
    deps.setOpenMenuId(null);
    deps.setShowShiftForm(true);
  }

  function openShiftFromGrid(shift: any) {
    if (deps.isReadOnly) return;
    if (!deps.isAdmin && !isOwnShift(shift)) return;
    if (deps.isAdmin) {
      deps.setSelectedDate(shift.date);
      deps.startEdit(shift);
      deps.setOpenMenuId(null);
      return;
    }
    deps.setSelectedDate(shift.date);
    deps.setOpenMenuId(null);
  }

  function onEmptyMonthDayQuickAdd(date: string) {
    if (deps.isReadOnly) return;
    const name = deps.scheduleGridEmployees[0];
    if (!name) {
      deps.onCreateShiftCta();
      return;
    }
    const info = deps.employees.find((e: any) => e.name === name);
    openQuickAddForCell(name, date, info || {});
  }

  return { openQuickAddForCell, openShiftFromGrid, onEmptyMonthDayQuickAdd, isOwnShift };
}
