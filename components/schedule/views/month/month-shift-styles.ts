import type { ShiftLike } from "./types";

export function getMonthShiftBorderClass(shift: ShiftLike): string {
  if (shift.approved) return "border-emerald-300 bg-emerald-50/90 text-emerald-900";
  if (shift.actualStart && shift.actualEnd) return "border-blue-200 bg-blue-50/90 text-blue-900";
  if (shift.actualStart) return "border-sky-300 bg-sky-50/90 text-sky-900";
  return "border-slate-200 bg-white text-slate-800";
}

/** Match week `ScheduleGrid` shift status labels for consistent UX. */
export function getMonthShiftStatusLabel(shift: ShiftLike): string {
  if (shift.approved) return "Approved";
  if (shift.actualStart && shift.actualEnd) return "Actual saved";
  if (shift.actualStart) return "Clocked in";
  return "Planned";
}

/** Compact pill styles aligned with `ScheduleGrid` `getShiftStatusStyles`. */
export function getMonthShiftStatusPillClass(shift: ShiftLike): string {
  if (shift.approved) return "border-emerald-300 bg-emerald-100 text-emerald-800";
  if (shift.actualStart) return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-white text-slate-600";
}
