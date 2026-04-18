"use client";

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { EmployeeConfig, FormState } from "../../types/schedule";

type ShiftFormModalProps = {
  workspaceName: string;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editingId: string | null;
  activeEmployees: EmployeeConfig[];
  roleSuggestions: string[];
  isFormEmployeeUnavailable: boolean;
  handleEmployeeChange: (name: string) => void;
  saveShift: () => Promise<void>;
  onDismiss: () => void;
};

function formatHeaderDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ShiftFormModal({
  workspaceName,
  form,
  setForm,
  editingId,
  activeEmployees,
  roleSuggestions,
  isFormEmployeeUnavailable,
  handleEmployeeChange,
  saveShift,
  onDismiss,
}: ShiftFormModalProps) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const roleListId = "shift-form-role-suggestions";

  const mergedRoleSuggestions = useMemo(() => {
    const s = new Set(roleSuggestions);
    if (form.role?.trim()) s.add(form.role.trim());
    return Array.from(s).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [roleSuggestions, form.role]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      startInputRef.current?.focus();
      startInputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await saveShift();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-form-title"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="max-h-[90vh] overflow-y-auto">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{workspaceName}</p>
            <h2 id="shift-form-title" className="mt-1 text-xl font-bold text-slate-900">
              {editingId ? "Edit shift" : "Create shift"}
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-800">{form.employee || "Select employee"}</p>
            <p className="mt-0.5 text-sm text-slate-600">{formatHeaderDate(form.date)}</p>
          </div>

          <div className="space-y-4 px-5 py-4 sm:px-6">
            {isFormEmployeeUnavailable ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                This employee is marked unavailable on this date. Change the employee or date before saving.
              </div>
            ) : null}

            <div>
              <label htmlFor="shift-form-employee" className="mb-1 block text-xs font-semibold text-slate-600">
                Employee
              </label>
              <select
                id="shift-form-employee"
                value={form.employee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              >
                {form.employee && !activeEmployees.some((e) => e.name === form.employee) ? (
                  <option value={form.employee}>{form.employee} (inactive)</option>
                ) : null}
                {activeEmployees.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="shift-form-date" className="mb-1 block text-xs font-semibold text-slate-600">
                Date
              </label>
              <input
                id="shift-form-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="shift-form-start" className="mb-1 block text-xs font-semibold text-slate-600">
                  From
                </label>
                <input
                  ref={startInputRef}
                  id="shift-form-start"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="off"
                  value={form.start}
                  onChange={(e) => setForm((prev) => ({ ...prev, start: e.target.value }))}
                  placeholder="09:00"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium tabular-nums text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label htmlFor="shift-form-end" className="mb-1 block text-xs font-semibold text-slate-600">
                  To
                </label>
                <input
                  id="shift-form-end"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  autoComplete="off"
                  value={form.end}
                  onChange={(e) => setForm((prev) => ({ ...prev, end: e.target.value }))}
                  placeholder="17:00"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium tabular-nums text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shift-form-role" className="mb-1 block text-xs font-semibold text-slate-600">
                Shift type / role
              </label>
              <input
                id="shift-form-role"
                type="text"
                list={roleListId}
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Kitchen"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              />
              <datalist id={roleListId}>
                {mergedRoleSuggestions.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="shift-form-notes" className="mb-1 block text-xs font-semibold text-slate-600">
                Notes
              </label>
              <textarea
                id="shift-form-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
              />
            </div>

            <p className="text-xs text-slate-500">
              Save adds or updates this shift on the schedule. Use the day list below the grid for approvals and
              actual times.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3 sm:px-6">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || isFormEmployeeUnavailable || activeEmployees.length === 0}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
