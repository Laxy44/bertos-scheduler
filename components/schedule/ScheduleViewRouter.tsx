"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ComponentProps } from "react";
import type { ScheduleViewKind } from "../../lib/schedule-view-utils";
import ScheduleGrid from "./ScheduleGrid";
import DayScheduleView from "./views/DayScheduleView";
import MonthScheduleView from "./views/MonthScheduleView";
import TwoWeekScheduleView from "./views/TwoWeekScheduleView";
import WeekScheduleView from "./views/WeekScheduleView";

type PlannerProps = {
  columnDates: any[];
  isReadOnly: boolean;
  isAdmin: boolean;
  employeeRateByName: Record<string, number>;
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
  onEmptyMonthDayQuickAdd: (date: string) => void;
};

function toScheduleGridProps(planner: PlannerProps): ComponentProps<typeof ScheduleGrid> {
  const { isAdmin, employeeRateByName, onEmptyMonthDayQuickAdd, ...rest } = planner;
  void isAdmin;
  void employeeRateByName;
  void onEmptyMonthDayQuickAdd;
  return rest;
}

type ScheduleViewRouterProps = {
  view: ScheduleViewKind;
  month: number;
  year: number;
  monthNames: readonly string[];
  onMonthSelectDay: (date: string) => void;
} & PlannerProps;

export default function ScheduleViewRouter({
  view,
  month,
  year,
  monthNames,
  onMonthSelectDay,
  ...planner
}: ScheduleViewRouterProps) {
  const gridProps = toScheduleGridProps(planner);

  if (view === "month") {
    return (
      <MonthScheduleView
        month={month}
        year={year}
        monthNames={monthNames}
        shifts={planner.shifts}
        selectedDate={planner.selectedDate}
        onMonthSelectDay={onMonthSelectDay}
        isReadOnly={planner.isReadOnly}
        isAdmin={planner.isAdmin}
        employeeRateByName={planner.employeeRateByName}
        getPlannedHours={planner.getPlannedHours}
        getWorkedHours={planner.getWorkedHours}
        openShiftFromGrid={planner.openShiftFromGrid}
        onEmptyMonthDayQuickAdd={planner.onEmptyMonthDayQuickAdd}
      />
    );
  }

  if (view === "day") {
    return <DayScheduleView {...gridProps} />;
  }

  if (view === "two_weeks") {
    return <TwoWeekScheduleView {...gridProps} />;
  }

  return <WeekScheduleView {...gridProps} />;
}
