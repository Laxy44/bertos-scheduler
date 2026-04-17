import type { ShiftLike } from "./types";

export function getMonthShiftBorderClass(shift: ShiftLike): string {
  if (shift.approved) return "border-emerald-300 bg-emerald-50/90 text-emerald-900";
  if (shift.actualStart && shift.actualEnd) return "border-blue-200 bg-blue-50/90 text-blue-900";
  if (shift.actualStart) return "border-sky-300 bg-sky-50/90 text-sky-900";
  return "border-slate-200 bg-white text-slate-800";
}
