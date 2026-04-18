import type { Shift } from "../../types/schedule";
import { getPlannedHours, getWorkedHours } from "../utils";

/**
 * Hours for payroll: actual punch duration when both actuals exist, otherwise planned shift length.
 * Earnings = hours × employee hourly rate (see `earningsForShift`).
 *
 * Future extension points (not implemented): accounting exports, payslip generation, payroll locking.
 */
export function hoursForPayrollShift(shift: Shift): number {
  if (shift.actualStart && shift.actualEnd) {
    return getWorkedHours(shift);
  }
  return getPlannedHours(shift);
}

export function earningsForShift(shift: Shift, hourlyRate: number): number {
  return hoursForPayrollShift(shift) * hourlyRate;
}

export function startDisplayForShift(shift: Shift): string {
  return shift.actualStart || shift.start;
}

export function endDisplayForShift(shift: Shift): string {
  return shift.actualEnd || shift.end;
}
