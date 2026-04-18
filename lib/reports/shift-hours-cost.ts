import type { Shift } from "../../types/schedule";
import { getPlannedHours, getWorkedHours } from "../utils";

/** Hours for reporting: worked when punched, otherwise planned. */
export function reportHoursForShift(shift: Shift): number {
  if (shift.actualStart && shift.actualEnd) {
    return getWorkedHours(shift);
  }
  return getPlannedHours(shift);
}

/** Display start/end: actual window when punched, else scheduled. */
export function reportStartDisplay(shift: Shift): string {
  return shift.actualStart || shift.start;
}

export function reportEndDisplay(shift: Shift): string {
  return shift.actualEnd || shift.end;
}
