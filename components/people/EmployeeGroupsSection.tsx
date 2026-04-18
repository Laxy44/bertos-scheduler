"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

type GroupRow = {
  id: string;
  name: string;
  hourly_wage: number | null;
};

type EmployeeGroupsSectionProps = {
  companyId: string | null | undefined;
  supabase: SupabaseClient;
  onGroupsChanged: () => void | Promise<void>;
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100";

export default function EmployeeGroupsSection({
  companyId,
  supabase,
  onGroupsChanged,
}: EmployeeGroupsSectionProps) {
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newWage, setNewWage] = useState("");
  const [savingId, setSavingId] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { name: string; wage: string }>>({});

  const load = useCallback(async () => {
    if (!companyId) {
      setRows([]);
      setDrafts({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: qerr } = await supabase
      .from("employee_groups")
      .select("id, name, hourly_wage")
      .eq("company_id", companyId)
      .order("name", { ascending: true });
    setLoading(false);
    if (qerr) {
      setError(qerr.message);
      return;
    }
    setError(null);
    const list = (data || []) as GroupRow[];
    setRows(list);
    const nextDrafts: Record<string, { name: string; wage: string }> = {};
    for (const r of list) {
      nextDrafts[r.id] = {
        name: r.name,
        wage: r.hourly_wage != null ? String(r.hourly_wage) : "",
      };
    }
    setDrafts(nextDrafts);
  }, [companyId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const parseWage = (raw: string): number | null => {
    const t = raw.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isNaN(n) || n < 0) return Number.NaN;
    return n;
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Enter a group name.");
      return;
    }
    const w = parseWage(newWage);
    if (Number.isNaN(w)) {
      setError("Optional hourly wage must be a valid number.");
      return;
    }
    setSavingId("new");
    setError(null);
    const { error: insErr } = await supabase.from("employee_groups").insert({
      company_id: companyId,
      name: trimmed,
      hourly_wage: w,
    });
    setSavingId(null);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setNewName("");
    setNewWage("");
    await load();
    void onGroupsChanged();
  }

  async function saveRow(id: string) {
    if (!companyId) return;
    const d = drafts[id];
    if (!d) return;
    const trimmed = d.name.trim();
    if (!trimmed) {
      setError("Group name cannot be empty.");
      return;
    }
    const w = parseWage(d.wage);
    if (Number.isNaN(w)) {
      setError("Hourly wage must be empty or a valid number.");
      return;
    }
    setSavingId(id);
    setError(null);
    const { error: upErr } = await supabase
      .from("employee_groups")
      .update({ name: trimmed, hourly_wage: w })
      .eq("id", id)
      .eq("company_id", companyId);
    setSavingId(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    await load();
    void onGroupsChanged();
  }

  async function deleteRow(id: string, label: string) {
    if (!companyId) return;
    const ok = window.confirm(`Delete group "${label}"? Employees in this group become ungrouped.`);
    if (!ok) return;
    setSavingId(id);
    setError(null);
    const { error: delErr } = await supabase
      .from("employee_groups")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId);
    setSavingId(null);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    await load();
    void onGroupsChanged();
  }

  const dirtyIds = useMemo(() => {
    return rows.filter((r) => {
      const d = drafts[r.id];
      if (!d) return false;
      const wageDb = r.hourly_wage != null ? String(r.hourly_wage) : "";
      return d.name.trim() !== r.name.trim() || d.wage.trim() !== wageDb.trim();
    }).map((r) => r.id);
  }, [rows, drafts]);

  if (!companyId) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Select a workspace to manage employee groups.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 md:px-6">
        <h2 className="text-lg font-semibold text-slate-900">Employee groups</h2>
        <p className="mt-1 text-sm text-slate-500">
          Name each crew or station (e.g. Kitchen, FOH). Optional hourly wage can be used as a
          reference when setting pay — keep it simple for now.
        </p>
      </div>

      <div className="p-5 md:p-6">
        {error ? (
          <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleCreate}
          className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <div className="min-w-[12rem] flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              New group name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Kitchen"
            />
          </div>
          <div className="w-full min-w-[10rem] sm:w-40">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Hourly wage (optional)
            </label>
            <input
              value={newWage}
              onChange={(e) => setNewWage(e.target.value)}
              className={inputClass}
              placeholder="DKK"
              inputMode="decimal"
            />
          </div>
          <button
            type="submit"
            disabled={savingId !== null}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {savingId === "new" ? "Adding…" : "Add group"}
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-slate-500">Loading groups…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">No groups yet. Add one above, then assign people on the Employees page.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hourly wage (optional)
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const d = drafts[row.id] ?? { name: row.name, wage: row.hourly_wage != null ? String(row.hourly_wage) : "" };
                  const isDirty = dirtyIds.includes(row.id);
                  return (
                    <tr key={row.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 align-middle">
                        <input
                          value={d.name}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [row.id]: { ...d, name: e.target.value },
                            }))
                          }
                          className={inputClass}
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          value={d.wage}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [row.id]: { ...d, wage: e.target.value },
                            }))
                          }
                          className={inputClass}
                          placeholder="—"
                          inputMode="decimal"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle text-slate-600">
                        {isDirty ? (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200">
                            Unsaved
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Saved</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            disabled={!isDirty || savingId !== null}
                            onClick={() => void saveRow(row.id)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-40"
                          >
                            {savingId === row.id ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            disabled={savingId !== null}
                            onClick={() => void deleteRow(row.id, d.name)}
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 ring-1 ring-red-100 hover:bg-red-100 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
