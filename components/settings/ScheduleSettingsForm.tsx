"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  addShiftTypeAction,
  deleteShiftTypeAction,
  updateBreakRulesAction,
  updateShiftTypeAction,
} from "@/app/app/settings/actions";
import type { ShiftTypeRow } from "@/lib/settings/workspace-settings";

type Props = {
  initialShiftTypes: ShiftTypeRow[];
  initialDefaultBreakMinutes: number | undefined;
  initialMinGapMinutes: number | undefined;
};

export default function ScheduleSettingsForm({
  initialShiftTypes,
  initialDefaultBreakMinutes,
  initialMinGapMinutes,
}: Props) {
  const router = useRouter();
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeRow[]>(initialShiftTypes);
  const [newName, setNewName] = useState("");
  const [breakDef, setBreakDef] = useState(
    initialDefaultBreakMinutes != null ? String(initialDefaultBreakMinutes) : ""
  );
  const [minGap, setMinGap] = useState(
    initialMinGapMinutes != null ? String(initialMinGapMinutes) : ""
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refreshFromServer() {
    router.refresh();
  }

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await addShiftTypeAction({ name: newName.trim() });
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setNewName("");
      setMessage("Saved.");
      refreshFromServer();
    });
  }

  function onRename(id: string, name: string) {
    startTransition(async () => {
      const res = await updateShiftTypeAction({ id, name });
      setMessage(res.ok ? "Saved." : res.error);
      if (res.ok) {
        setShiftTypes((rows) => rows.map((r) => (r.id === id ? { ...r, name } : r)));
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const res = await deleteShiftTypeAction({ id });
      setMessage(res.ok ? "Saved." : res.error);
      if (res.ok) {
        setShiftTypes((rows) => rows.filter((r) => r.id !== id));
      }
    });
  }

  function onSaveBreaks(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateBreakRulesAction({
        defaultBreakMinutes: breakDef,
        minGapBetweenShiftsMinutes: minGap,
      });
      setMessage(res.ok ? "Saved." : res.error);
    });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Shift types</h2>
        <p className="mt-1 text-sm text-slate-500">
          Labels for roles or shift templates (scheduling rules can grow on top of this later).
        </p>

        <ul className="mt-4 space-y-2">
          {shiftTypes.length === 0 ? (
            <li className="text-sm text-slate-500">No custom types yet — add one below.</li>
          ) : (
            shiftTypes.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <input
                  defaultValue={row.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== row.name) onRename(row.id, v);
                  }}
                  className="min-w-[8rem] flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>

        <form onSubmit={onAdd} className="mt-4 flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="font-medium text-slate-700">New type</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Opening"
              className="mt-1 block w-56 rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Add
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Break rules</h2>
        <p className="mt-1 text-sm text-slate-500">
          Simple defaults for your team (enforcement in scheduling can come later).
        </p>

        <form onSubmit={onSaveBreaks} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-slate-700">Default break (minutes)</span>
            <input
              value={breakDef}
              onChange={(e) => setBreakDef(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 30"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Min. gap between shifts (minutes)</span>
            <input
              value={minGap}
              onChange={(e) => setMinGap(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 8"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save break rules"}
            </button>
          </div>
        </form>
      </div>

      {message ? (
        <p
          className={`text-sm ${message === "Saved." ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
