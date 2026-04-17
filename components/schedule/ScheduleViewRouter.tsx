"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ScheduleViewKind } from "../../lib/schedule-view-utils";
import DayScheduleView from "./views/DayScheduleView";
import MonthScheduleView from "./views/MonthScheduleView";
import TwoWeekScheduleView from "./views/TwoWeekScheduleView";
import WeekScheduleView from "./views/WeekScheduleView";

type PlannerProps = {
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

type ScheduleViewRouterProps = {
  view: ScheduleViewKind;
  month: number;
  year: number;
  monthNames: readonly string[];
  onPickMonthCalendarDate: (date: string) => void;
} & PlannerProps;

export default function ScheduleViewRouter({
  view,
  month,
  year,
  monthNames,
  onPickMonthCalendarDate,
  ...planner
}: ScheduleViewRouterProps) {
  if (view === "month") {
    return (
      <MonthScheduleView
        month={month}
        year={year}
        monthNames={monthNames}
        shifts={planner.shifts}
        selectedDate={planner.selectedDate}
        onPickDate={onPickMonthCalendarDate}
        isReadOnly={planner.isReadOnly}
        openShiftFromGrid={planner.openShiftFromGrid}
      />
    );
  }

  if (view === "day") {
    return <DayScheduleView {...planner} />;
  }

  if (view === "two_weeks") {
    return <TwoWeekScheduleView {...planner} />;
  }

  return <WeekScheduleView {...planner} />;
}
