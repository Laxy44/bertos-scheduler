"use client";

import { useRef, useState } from "react";
import type { ScheduleViewKind } from "../../lib/schedule-view-utils";
import { AnchoredMenu } from "../ui/AnchoredMenu";
import ScheduleViewNavigation from "./ScheduleViewNavigation";

type ToolbarKey = "templates" | "tools" | "filters" | null;

type ScheduleControlsBarProps = {
  viewKind: ScheduleViewKind;
  onViewKindChange: (next: ScheduleViewKind) => void;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;
  weekRangeLabel: string;
};

const templateOptions = ["Shift templates", "Saved patterns", "Import template"];
const toolsOptions = ["Bulk actions", "Copy week", "Auto assign"];
const filtersOptions = ["All shifts", "Unpublished", "Unassigned"];

/**
 * Admin planner row: shared view navigation + templates / tools / filters / publish.
 */
export default function ScheduleControlsBar({
  viewKind,
  onViewKindChange,
  goToday,
  goPrev,
  goNext,
  weekRangeLabel,
}: ScheduleControlsBarProps) {
  const [openToolbarMenu, setOpenToolbarMenu] = useState<ToolbarKey>(null);
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState("Shift templates");
  const [selectedToolsLabel, setSelectedToolsLabel] = useState("Bulk actions");
  const [selectedFiltersLabel, setSelectedFiltersLabel] = useState("All shifts");

  const templatesAnchorRef = useRef<HTMLDivElement>(null);
  const toolsAnchorRef = useRef<HTMLDivElement>(null);
  const filtersAnchorRef = useRef<HTMLDivElement>(null);

  function closeToolbarMenus() {
    setOpenToolbarMenu(null);
  }

  function toggleToolbarMenu(key: ToolbarKey) {
    setOpenToolbarMenu((current) => (current === key ? null : key));
  }

  return (
    <div className="rounded-t-xl border border-b-0 border-slate-200 bg-white px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ScheduleViewNavigation
          viewKind={viewKind}
          onViewKindChange={onViewKindChange}
          goToday={goToday}
          goPrev={goPrev}
          goNext={goNext}
          weekRangeLabel={weekRangeLabel}
        />

        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
          >
            View settings
          </button>

          <div className="relative" ref={templatesAnchorRef}>
            <button
              type="button"
              onClick={() => toggleToolbarMenu("templates")}
              aria-haspopup="menu"
              aria-expanded={openToolbarMenu === "templates"}
              className={`inline-flex min-w-[6.5rem] items-center justify-between rounded-md border px-2.5 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.99] sm:min-w-[7.5rem] ${
                openToolbarMenu === "templates"
                  ? "border-slate-300 bg-slate-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Templates
              <span
                className={`ml-2 text-xs text-slate-500 transition-transform duration-150 ${
                  openToolbarMenu === "templates" ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            <AnchoredMenu
              open={openToolbarMenu === "templates"}
              onClose={closeToolbarMenus}
              anchorRef={templatesAnchorRef}
              contentClassName="w-[200px]"
            >
              {templateOptions.map((option) => {
                const isActive = selectedTemplateLabel === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      setSelectedTemplateLabel(option);
                      closeToolbarMenus();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "font-medium text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`text-xs ${isActive ? "text-slate-700" : "text-transparent"}`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </AnchoredMenu>
          </div>

          <div className="relative" ref={toolsAnchorRef}>
            <button
              type="button"
              onClick={() => toggleToolbarMenu("tools")}
              aria-haspopup="menu"
              aria-expanded={openToolbarMenu === "tools"}
              className={`inline-flex min-w-[6rem] items-center justify-between rounded-md border px-2.5 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.99] sm:min-w-[6.75rem] ${
                openToolbarMenu === "tools"
                  ? "border-slate-300 bg-slate-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Tools
              <span
                className={`ml-2 text-xs text-slate-500 transition-transform duration-150 ${
                  openToolbarMenu === "tools" ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            <AnchoredMenu
              open={openToolbarMenu === "tools"}
              onClose={closeToolbarMenus}
              anchorRef={toolsAnchorRef}
              contentClassName="w-[190px]"
            >
              {toolsOptions.map((option) => {
                const isActive = selectedToolsLabel === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      setSelectedToolsLabel(option);
                      closeToolbarMenus();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "font-medium text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`text-xs ${isActive ? "text-slate-700" : "text-transparent"}`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </AnchoredMenu>
          </div>

          <div className="relative" ref={filtersAnchorRef}>
            <button
              type="button"
              onClick={() => toggleToolbarMenu("filters")}
              aria-haspopup="menu"
              aria-expanded={openToolbarMenu === "filters"}
              className={`inline-flex min-w-[6.25rem] items-center justify-between rounded-md border px-2.5 py-1.5 text-sm font-medium shadow-sm transition active:scale-[0.99] sm:min-w-[7rem] ${
                openToolbarMenu === "filters"
                  ? "border-slate-300 bg-slate-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Filters
              <span
                className={`ml-2 text-xs text-slate-500 transition-transform duration-150 ${
                  openToolbarMenu === "filters" ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            <AnchoredMenu
              open={openToolbarMenu === "filters"}
              onClose={closeToolbarMenus}
              anchorRef={filtersAnchorRef}
              contentClassName="w-[190px]"
            >
              {filtersOptions.map((option) => {
                const isActive = selectedFiltersLabel === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => {
                      setSelectedFiltersLabel(option);
                      closeToolbarMenus();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "font-medium text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`text-xs ${isActive ? "text-slate-700" : "text-transparent"}`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </AnchoredMenu>
          </div>

          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] sm:px-4"
          >
            Publish shifts
          </button>
        </div>
      </div>
    </div>
  );
}
