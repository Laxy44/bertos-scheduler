"use client";

import { useRef, useState } from "react";
import { AnchoredMenu } from "../ui/AnchoredMenu";
import type { ScheduleViewKind } from "../../lib/schedule-view-utils";
import { labelFromViewKind } from "../../lib/schedule-view-utils";

export const SCHEDULE_VIEW_OPTIONS = ["Day", "Week", "2 Weeks", "Month"] as const;

type ScheduleViewNavigationProps = {
  viewKind: ScheduleViewKind;
  onViewKindChange: (next: ScheduleViewKind) => void;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  weekRangeLabel: string;
};

/**
 * Shared left cluster: view range (Day / Week / …) + Today + step controls + date range badge.
 */
export default function ScheduleViewNavigation({
  viewKind,
  onViewKindChange,
  goToday,
  goPrev,
  goNext,
  weekRangeLabel,
}: ScheduleViewNavigationProps) {
  const [openViewMenu, setOpenViewMenu] = useState(false);
  const viewAnchorRef = useRef<HTMLDivElement>(null);

  const selectedViewLabel = labelFromViewKind(viewKind);

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <div className="relative" ref={viewAnchorRef}>
        <button
          type="button"
          onClick={() => setOpenViewMenu((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={openViewMenu}
          className={`inline-flex min-w-[7.5rem] items-center justify-between rounded-md border px-2.5 py-1.5 text-sm font-semibold transition active:scale-[0.99] ${
            openViewMenu
              ? "border-slate-300 bg-slate-50 text-slate-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>{selectedViewLabel}</span>
          <span
            className={`ml-2 text-xs text-slate-500 transition-transform duration-150 ${
              openViewMenu ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
        <AnchoredMenu
          open={openViewMenu}
          onClose={() => setOpenViewMenu(false)}
          anchorRef={viewAnchorRef}
          contentClassName="w-[180px]"
        >
          {SCHEDULE_VIEW_OPTIONS.map((option) => {
            const isActive = selectedViewLabel === option;
            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  const map: Record<string, ScheduleViewKind> = {
                    Day: "day",
                    Week: "week",
                    "2 Weeks": "two_weeks",
                    Month: "month",
                  };
                  const next = map[option];
                  if (next) onViewKindChange(next);
                  setOpenViewMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : "font-medium text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{option}</span>
                <span className={`text-xs ${isActive ? "text-slate-700" : "text-transparent"}`}>
                  ✓
                </span>
              </button>
            );
          })}
        </AnchoredMenu>
      </div>

      <button
        type="button"
        onClick={goToday}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
      >
        Today
      </button>
      <button
        type="button"
        onClick={goPrev}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
      >
        ←
      </button>
      <button
        type="button"
        onClick={goNext}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
      >
        →
      </button>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-slate-800 sm:text-sm">
        {weekRangeLabel}
      </div>
    </div>
  );
}
