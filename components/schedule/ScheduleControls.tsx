"use client";

import ScheduleControlsBar from "./ScheduleControlsBar";

type ScheduleControlsProps = {
  isReadOnly: boolean;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  weekRangeLabel: string;
};

/**
 * Week navigation for everyone; full admin toolbar only when not read-only.
 */
export default function ScheduleControls({
  isReadOnly,
  goToday,
  goPrev,
  goNext,
  weekRangeLabel,
}: ScheduleControlsProps) {
  if (isReadOnly) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 shadow-sm sm:px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm">
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
            <div className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold tabular-nums text-slate-800 sm:text-sm">
              {weekRangeLabel}
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-600 sm:text-right">
            Your schedule (read-only)
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScheduleControlsBar
      goToday={goToday}
      goPrev={goPrev}
      goNext={goNext}
      weekRangeLabel={weekRangeLabel}
    />
  );
}
