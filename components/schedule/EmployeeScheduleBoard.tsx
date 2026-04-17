"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react";
import ShiftMiniCard from "./ShiftMiniCard";

/**
 * Employee personal schedule: read-only week grid + simple day list (no planner tooling).
 */
export default function EmployeeScheduleBoard({
  goPrev,
  goNext,
  goToday,
  weekDates,
  shifts,
  selectedDate,
  setSelectedDate,
  setForm,
  setOpenMenuId,
  selectedDayName,
  filteredShifts,
  employeeName,
  roleStyles,
  getPlannedHours,
  getWorkedHours,
  dayHours,
  dayWorkedHours,
}: any) {
  const self = (employeeName || "").trim();

  const weekRangeLabel = `${weekDates[0]?.date || ""} – ${
    weekDates[weekDates.length - 1]?.date || ""
  }`;

  const todayDate = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const weekDateSet = new Set(weekDates.map((item: any) => item.date));
  const myWeekShifts = shifts.filter(
    (shift: any) => shift.employee === self && weekDateSet.has(shift.date)
  );

  const weeklyPlannedHours = myWeekShifts.reduce(
    (sum: number, shift: any) => sum + getPlannedHours(shift),
    0
  );
  const weeklyWorkedHours = myWeekShifts.reduce(
    (sum: number, shift: any) => sum + getWorkedHours(shift),
    0
  );

  const dayShiftCountMap = weekDates.reduce((acc: Record<string, number>, item: any) => {
    acc[item.date] = shifts.filter(
      (shift: any) => shift.employee === self && shift.date === item.date
    ).length;
    return acc;
  }, {});

  const getShiftStatusLabel = (shift: any) => {
    if (shift.approved) return "Approved";
    if (shift.actualStart && shift.actualEnd) return "Actual saved";
    if (shift.actualStart && !shift.actualEnd) return "Clocked in";
    return "Planned";
  };

  const getShiftStatusStyles = (shift: any) => {
    if (shift.approved) return "border-emerald-300 bg-emerald-100 text-emerald-800";
    if (shift.actualStart) return "border-blue-200 bg-blue-50 text-blue-700";
    return "border-slate-200 bg-white text-slate-600";
  };

  const gridTemplate =
    "grid grid-cols-[minmax(12rem,14rem)_repeat(7,minmax(6.5rem,1fr))]";

  return (
    <section className="w-full space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-800">
              Week
            </span>
            <button
              type="button"
              onClick={goToday}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              →
            </button>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-slate-800 sm:text-sm">
              {weekRangeLabel}
            </div>
          </div>
          <p className="text-sm font-medium text-slate-600">Your schedule · read-only</p>
        </div>
      </div>

      {!self ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Your profile is not linked to an employee name, so shifts cannot be shown. Ask an admin to
          link your account.
        </div>
      ) : null}

      {self ? (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[70vh] w-full min-w-[880px] overflow-auto">
            <div
              className={`sticky top-0 z-20 ${gridTemplate} border-b-2 border-slate-200 bg-slate-100`}
            >
              <div className="sticky left-0 z-30 border-r border-slate-200 bg-slate-100 px-3 py-3 sm:px-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Your week
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">My schedule</p>
              </div>
              {weekDates.map((item: any) => {
                const dateObj = new Date(item.date);
                const isSelected = selectedDate === item.date;
                const isToday = item.date === todayDate;
                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(item.date);
                      setForm((current: any) => ({ ...current, date: item.date }));
                      setOpenMenuId(null);
                    }}
                    className={`border-r border-slate-200 px-2 py-2.5 text-left transition last:border-r-0 sm:px-3 sm:py-3 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : isToday
                        ? "bg-sky-50 text-slate-900 ring-1 ring-inset ring-sky-200"
                        : "bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-bold uppercase ${
                        isSelected ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      {item.dayName.slice(0, 3)}
                    </div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums">
                      {String(dateObj.getDate()).padStart(2, "0")}
                    </div>
                    <div
                      className={`mt-0.5 text-[10px] font-medium ${
                        isSelected ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      {dayShiftCountMap[item.date] || 0} shifts
                    </div>
                  </button>
                );
              })}
            </div>

            <div className={`${gridTemplate} border-b border-slate-200 bg-white`}>
              <div className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
                <p className="truncate text-sm font-semibold text-slate-900">{self}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Assigned shifts</p>
              </div>
              {weekDates.map((item: any) => {
                const dayShifts = shifts
                  .filter((shift: any) => shift.employee === self && shift.date === item.date)
                  .sort((a: any, b: any) => a.start.localeCompare(b.start));
                const isSelected = selectedDate === item.date;
                return (
                  <div
                    key={`me-${item.date}`}
                    className={`min-h-[100px] border-r border-slate-200 px-2 py-2 align-top last:border-r-0 sm:min-h-[110px] sm:px-2.5 sm:py-2.5 ${
                      isSelected ? "bg-indigo-50/60 ring-1 ring-inset ring-indigo-200/80" : ""
                    } ${item.date === todayDate ? "bg-sky-50/40" : ""}`}
                  >
                    {dayShifts.length === 0 ? (
                      <p className="text-[11px] text-slate-400">Off</p>
                    ) : (
                      <div className="space-y-1">
                        {dayShifts.map((shift: any) => (
                          <ShiftMiniCard
                            key={shift.id}
                            shift={shift}
                            getShiftStatusLabel={getShiftStatusLabel}
                            getShiftStatusStyles={getShiftStatusStyles}
                            readOnly
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Planned this week
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {weeklyPlannedHours.toFixed(1)}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Worked this week
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {weeklyWorkedHours.toFixed(1)}h
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-1 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{selectedDayName}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Your shifts on this day (read-only). Use Punch clock from the menu if you need to
              register time.
            </p>
          </div>
          <p className="text-xs font-semibold tabular-nums text-slate-600 sm:text-right">
            Planned {dayHours.toFixed(1)}h <span className="text-slate-300">·</span> Actual{" "}
            {dayWorkedHours.toFixed(1)}h
          </p>
        </div>
        {filteredShifts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">Nothing scheduled this day</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Pick another day above or check back when your manager publishes shifts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShifts
              .slice()
              .sort((a: any, b: any) => a.start.localeCompare(b.start))
              .map((shift: any) => {
                const workedHours = getWorkedHours(shift);
                return (
                  <div
                    key={shift.id}
                    className={`rounded-2xl border p-4 ${
                      shift.approved
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {shift.start}–{shift.end}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${roleStyles(
                          shift.role
                        )}`}
                      >
                        {shift.role}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {getShiftStatusLabel(shift)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Planned {getPlannedHours(shift).toFixed(1)}h · Actual {workedHours.toFixed(1)}h
                    </p>
                    {shift.notes ? (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-medium text-slate-500">Notes: </span>
                        {shift.notes}
                      </p>
                    ) : null}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
