"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMonthCalendarDays } from "../../../lib/utils";
import MonthCalendarGrid from "./month/MonthCalendarGrid";
import MonthDayDetailsPanel from "./month/MonthDayDetailsPanel";
import MonthHeaderRow from "./month/MonthHeaderRow";
import type { MonthDayMeta, ShiftLike } from "./month/types";

export type MonthScheduleViewProps = {
  month: number;
  year: number;
  monthNames: readonly string[];
  shifts: ShiftLike[];
  selectedDate: string;
  /** Syncs selected day + month anchor + week shell (same as previous onPickDate). */
  onMonthSelectDay: (date: string) => void;
  isReadOnly: boolean;
  isAdmin: boolean;
  employeeRateByName: Record<string, number>;
  getPlannedHours: (s: ShiftLike) => number;
  getWorkedHours: (s: ShiftLike) => number;
  openShiftFromGrid: (shift: ShiftLike) => void;
  onEmptyMonthDayQuickAdd: (date: string) => void;
};

export default function MonthScheduleView({
  month,
  year,
  monthNames,
  shifts,
  selectedDate,
  onMonthSelectDay,
  isReadOnly,
  isAdmin,
  employeeRateByName,
  getPlannedHours,
  getWorkedHours,
  openShiftFromGrid,
  onEmptyMonthDayQuickAdd,
}: MonthScheduleViewProps) {
  const [detailsDate, setDetailsDate] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setDetailsDate(null);
    });
  }, [month, year]);

  const cells = useMemo(() => getMonthCalendarDays(month, year), [month, year]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const { shiftsByDate, dayMetaByDate } = useMemo(() => {
    const byDate = new Map<string, ShiftLike[]>();
    const meta = new Map<string, MonthDayMeta>();

    for (const shift of shifts) {
      const list = byDate.get(shift.date) || [];
      list.push(shift);
      byDate.set(shift.date, list);
    }

    for (const [date, list] of byDate) {
      list.sort((a, b) => a.start.localeCompare(b.start));
      const plannedHours = list.reduce((s, sh) => s + getPlannedHours(sh), 0);
      const plannedPayroll = list.reduce(
        (s, sh) => s + getPlannedHours(sh) * (employeeRateByName[sh.employee] || 0),
        0
      );
      meta.set(date, { shiftCount: list.length, plannedHours, plannedPayroll });
    }

    return { shiftsByDate: byDate, dayMetaByDate: meta };
  }, [shifts, getPlannedHours, employeeRateByName]);

  const handleActivateDay = useCallback(
    (date: string) => {
      onMonthSelectDay(date);
      const list = shiftsByDate.get(date) || [];
      if (isReadOnly) {
        if (list.length > 0) {
          setDetailsDate(date);
        }
        return;
      }
      if (isAdmin) {
        setDetailsDate(null);
        onEmptyMonthDayQuickAdd(date);
      }
    },
    [isAdmin, isReadOnly, onMonthSelectDay, onEmptyMonthDayQuickAdd, shiftsByDate]
  );

  const handleShiftSelect = useCallback(
    (shift: ShiftLike) => {
      onMonthSelectDay(shift.date);
      if (isReadOnly) {
        setDetailsDate(shift.date);
        return;
      }
      openShiftFromGrid(shift);
      setDetailsDate(null);
    },
    [isReadOnly, onMonthSelectDay, openShiftFromGrid]
  );

  const detailsShifts = detailsDate ? shiftsByDate.get(detailsDate) || [] : [];
  const detailsLabel = useMemo(() => {
    if (!detailsDate) return "";
    const [y, m, d] = detailsDate.split("-").map(Number);
    if (!y || !m || !d) return detailsDate;
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [detailsDate]);

  const handlePanelAddShift = useCallback(() => {
    if (!detailsDate) return;
    setDetailsDate(null);
    onEmptyMonthDayQuickAdd(detailsDate);
  }, [detailsDate, onEmptyMonthDayQuickAdd]);

  const handlePanelEditShift = useCallback(
    (shift: ShiftLike) => {
      setDetailsDate(null);
      openShiftFromGrid(shift);
    },
    [openShiftFromGrid]
  );

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[720px] p-3 sm:p-4">
        <MonthHeaderRow monthNames={monthNames} month={month} year={year} />

        <MonthCalendarGrid
          cells={cells}
          shiftsByDate={shiftsByDate}
          dayMetaByDate={dayMetaByDate}
          todayStr={todayStr}
          selectedDate={selectedDate}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          onActivateDay={handleActivateDay}
          onShiftSelect={handleShiftSelect}
        />
      </div>

      {detailsDate && isReadOnly ? (
        <MonthDayDetailsPanel
          date={detailsDate}
          dateLabel={detailsLabel}
          shifts={detailsShifts}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          onClose={() => setDetailsDate(null)}
          onAddShift={handlePanelAddShift}
          onEditShift={handlePanelEditShift}
          getPlannedHours={getPlannedHours}
          getWorkedHours={getWorkedHours}
        />
      ) : null}
    </div>
  );
}
