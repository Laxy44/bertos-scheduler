/* eslint-disable @typescript-eslint/no-explicit-any */

export type ShiftLike = {
  id: string;
  employee: string;
  role: string;
  start: string;
  end: string;
  date: string;
  notes?: string;
  actualStart?: string;
  actualEnd?: string;
  approved?: boolean;
};

export type MonthDayMeta = {
  shiftCount: number;
  plannedHours: number;
  plannedPayroll: number;
};
