"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import ScheduleGrid from "../ScheduleGrid";

type DayScheduleViewProps = {
  columnDates: any[];
  isReadOnly: boolean;
  shifts: any[];
  employees: any[];
  scheduleGridEmployees: string[];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  setForm: (fn: any) => void;
  setOpenMenuId: (id: string | null) => void;
  employeeRoleMap: Record<string, string>;
  getPlannedHours: (s: any) => number;
  getWorkedHours: (s: any) => number;
  onCreateShiftCta: () => void;
  onAddEmployeeCta: () => void;
  openQuickAddForCell: (employeeNameValue: string, date: string, employeeInfo: any) => void;
  openShiftFromGrid: (shift: any) => void;
};

export default function DayScheduleView(props: DayScheduleViewProps) {
  const primary = props.columnDates[0];
  const dateObj = primary ? new Date(primary.date) : new Date();
  const heading = dateObj.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Selected day</p>
        <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{heading}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {props.isReadOnly
            ? "Read-only view of your shifts for this date."
            : "Plan coverage and manage shifts for this single date."}
        </p>
      </div>
      <ScheduleGrid {...props} plannerVariant="day" />
    </div>
  );
}
