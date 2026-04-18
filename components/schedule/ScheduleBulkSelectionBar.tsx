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
      aria-hidden={!open}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4"
    >
      <div
        className={`w-full max-w-3xl transition-all duration-300 ease-out ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
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
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
