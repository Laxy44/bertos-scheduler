/**
 * Timesheet/reporting uses the same hour rules as payroll (`lib/payroll/compute`).
 */
export {
  hoursForPayrollShift as reportHoursForShift,
  startDisplayForShift as reportStartDisplay,
  endDisplayForShift as reportEndDisplay,
} from "../payroll/compute";
