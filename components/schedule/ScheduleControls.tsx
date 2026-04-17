"use client";

import ScheduleControlsBar from "./ScheduleControlsBar";
import ScheduleViewNavigation from "./ScheduleViewNavigation";

type ScheduleControlsProps = {
  isReadOnly: boolean;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  weekRangeLabel: string;
};

/**
 * Same top row structure as admin: view selector + Today + arrows + range; admin adds planner-only controls.
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
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <ScheduleViewNavigation
            goToday={goToday}
            goPrev={goPrev}
            goNext={goNext}
            weekRangeLabel={weekRangeLabel}
          />
          <p className="text-xs font-semibold text-slate-600 lg:text-right">
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
