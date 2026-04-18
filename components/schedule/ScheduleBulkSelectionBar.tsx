"use client";

import type { RefObject } from "react";

type ScheduleBulkSelectionBarProps = {
  barRef: RefObject<HTMLDivElement | null>;
  count: number;
  onDeselectAll: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
  editDisabled: boolean;
};

export default function ScheduleBulkSelectionBar({
  barRef,
  count,
  onDeselectAll,
  onEdit,
  onDelete,
  onApprove,
  editDisabled,
}: ScheduleBulkSelectionBarProps) {
  const open = count > 0;

  return (
    <div
      ref={barRef}
      role="region"
      aria-label="Bulk shift actions"
      aria-hidden={!open}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 relative"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-900/12 via-slate-900/5 to-transparent transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative w-full max-w-3xl will-change-[transform,opacity] transition-all duration-300 ease-out motion-reduce:transition-none ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[110%] opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-8px_32px_rgba(15,23,42,0.12),0_-1px_0_rgba(15,23,42,0.06)] backdrop-blur-sm ring-1 ring-slate-900/5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900" aria-live="polite" aria-atomic="true">
              {count} shift{count === 1 ? "" : "s"} selected
            </p>
            <button
              type="button"
              onClick={onDeselectAll}
              className="mt-0.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
            >
              Deselect all
            </button>
          </div>
          <div
            className="flex flex-wrap items-center gap-2 sm:justify-end"
            role="toolbar"
            aria-label="Actions for selected shifts"
          >
            <button
              type="button"
              onClick={onEdit}
              disabled={editDisabled}
              title={editDisabled ? "Select exactly one shift to edit" : "Edit selected shift"}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 shadow-sm hover:bg-red-100"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
