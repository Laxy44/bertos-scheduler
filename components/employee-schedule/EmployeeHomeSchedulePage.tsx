"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import type { Shift } from "../../types/schedule";
import { fromDateInputValue, getPlannedHours, startOfWeek, toDateInputValue } from "../../lib/utils";
import EmployeePortalShell from "./EmployeePortalShell";
import EmployeeScheduleTable, { type ScheduleTableGroup } from "./EmployeeScheduleTable";
import EmployeeScheduleTabs, { type EmployeeScheduleSectionTab } from "./EmployeeScheduleTabs";
import MiniMonthCalendarSidebar from "./MiniMonthCalendarSidebar";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function addMonthsFirst(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1, 0, 0, 0, 0);
}

function endOfMonthInclusive(d: Date): string {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return toDateInputValue(last);
}

function ymLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });
}

function weekHeading(mondayIso: string) {
  const start = fromDateInputValue(mondayIso);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const a = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const b = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `Week ${a} – ${b}`;
}

type EmployeeHomeSchedulePageProps = {
  shifts: Shift[];
  hourlyRate: number;
  employeeDisplayName: string;
  companyName: string | null;
};

export default function EmployeeHomeSchedulePage({
  shifts: initialShifts,
  hourlyRate,
  employeeDisplayName,
  companyName,
}: EmployeeHomeSchedulePageProps) {
  const [sectionTab, setSectionTab] = useState<EmployeeScheduleSectionTab>("week");
  const [anchorMonth, setAnchorMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayFilterOnly, setDayFilterOnly] = useState(false);
  const [showRangeBanner, setShowRangeBanner] = useState(false);

  const rangeStartStr = useMemo(() => toDateInputValue(anchorMonth), [anchorMonth]);
  const rangeEndStr = useMemo(() => endOfMonthInclusive(addMonthsFirst(anchorMonth, 2)), [anchorMonth]);

  const rangeFiltered = useMemo(() => {
    return initialShifts
      .filter((s) => s.date >= rangeStartStr && s.date <= rangeEndStr)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [initialShifts, rangeStartStr, rangeEndStr]);

  const tableShifts = useMemo(() => {
    let list = rangeFiltered;
    if (dayFilterOnly && selectedDate) {
      list = list.filter((s) => s.date === selectedDate);
    }
    return list;
  }, [rangeFiltered, dayFilterOnly, selectedDate]);

  const totalPlannedHours = useMemo(
    () => tableShifts.reduce((sum, s) => sum + getPlannedHours(s), 0),
    [tableShifts]
  );

  const weekGroups: ScheduleTableGroup[] = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of tableShifts) {
      const mon = toDateInputValue(startOfWeek(fromDateInputValue(s.date)));
      if (!map.has(mon)) map.set(mon, []);
      map.get(mon)!.push(s);
    }
    const keys = Array.from(map.keys()).sort();
    return keys.map((k) => ({
      id: k,
      label: weekHeading(k),
      shifts: (map.get(k) || []).slice().sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)),
    }));
  }, [tableShifts]);

  const monthGroups: ScheduleTableGroup[] = useMemo(() => {
    const map = new Map<string, Shift[]>();
    for (const s of tableShifts) {
      const ym = s.date.slice(0, 7);
      if (!map.has(ym)) map.set(ym, []);
      map.get(ym)!.push(s);
    }
    const keys = Array.from(map.keys()).sort();
    return keys.map((k) => ({
      id: k,
      label: ymLabel(k),
      shifts: (map.get(k) || []).slice().sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)),
    }));
  }, [tableShifts]);

  const onSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setAnchorMonth(startOfMonth(fromDateInputValue(date)));
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const rangeDescription = `${rangeStartStr} → ${rangeEndStr}`;

  return (
    <EmployeePortalShell displayName={employeeDisplayName} companyName={companyName} activeHref="/app/your-schedule">
      <div id="employee-schedule-print-root" className="space-y-5">
        <div className="flex flex-col gap-1 border-b border-slate-200/80 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your schedule</h1>
          <p className="text-sm text-slate-600">
            Your shifts only (read-only). For the company planner, open the{" "}
            <Link href="/app" className="font-semibold text-indigo-700 underline-offset-2 hover:underline">
              dashboard
            </Link>{" "}
            and use <span className="font-semibold">Schedule</span>.
          </p>
        </div>

        <EmployeeScheduleTabs active={sectionTab} onChange={setSectionTab} />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Total planned hours</span>{" "}
            <span className="tabular-nums text-slate-900">{totalPlannedHours.toFixed(1)}</span> h
          </p>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Print
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRangeBanner((v) => !v)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Show date range
          </button>
          <button
            type="button"
            disabled={!selectedDate}
            onClick={() => setDayFilterOnly((d) => !d)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {dayFilterOnly ? "Show full range" : "Filter to selected day"}
          </button>
          <span className="text-xs text-slate-500">
            {selectedDate ? `Selected: ${selectedDate}` : "Pick a day in the mini calendars to highlight or filter."}
          </span>
        </div>

        {showRangeBanner ? (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-2 text-sm font-medium text-indigo-950">
            Showing shifts between <span className="tabular-nums">{rangeDescription}</span>
            {dayFilterOnly && selectedDate ? (
              <span>
                {" "}
                · filtered to <span className="tabular-nums">{selectedDate}</span>
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <MiniMonthCalendarSidebar
              anchorMonth={anchorMonth}
              onAnchorMonthChange={setAnchorMonth}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
            <div className="min-w-0 flex-1 space-y-4">
              {sectionTab === "schedule" ? (
                <EmployeeScheduleTable
                  shifts={tableShifts}
                  hourlyRate={hourlyRate}
                  highlightDate={selectedDate}
                />
              ) : null}
              {sectionTab === "week" ? (
                <EmployeeScheduleTable
                  shifts={tableShifts}
                  hourlyRate={hourlyRate}
                  highlightDate={selectedDate}
                  grouped={weekGroups}
                />
              ) : null}
              {sectionTab === "month" ? (
                <EmployeeScheduleTable
                  shifts={tableShifts}
                  hourlyRate={hourlyRate}
                  highlightDate={selectedDate}
                  grouped={monthGroups}
                />
              ) : null}
            </div>
          </div>
      </div>
    </EmployeePortalShell>
  );
}
