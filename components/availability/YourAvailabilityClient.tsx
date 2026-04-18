"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { monthNames } from "../../lib/constants";
import { createClient } from "../../lib/supabase";
import type { AvailabilityStatus, EmployeeAvailabilityRow } from "../../types/availability";
import EmployeePortalShell from "../employee-schedule/EmployeePortalShell";
import {
  formatMonthHeading,
  getMonthRange,
  listDaysInMonth,
  shiftMonth,
} from "./availability-utils";

type LocalDayRow = {
  date: string;
  status: AvailabilityStatus;
  notes: string;
  locked: boolean;
  id?: string;
};

type YourAvailabilityClientProps = {
  userId: string;
  companyId: string;
  displayName: string;
  companyName: string | null;
  employeeName: string;
  initialYear: number;
  initialMonth: number;
};

function mapDbToLocal(r: EmployeeAvailabilityRow): LocalDayRow {
  return {
    date: r.date,
    status: r.status,
    notes: r.notes ?? "",
    locked: r.locked,
    id: r.id,
  };
}

function parseDbRow(raw: Record<string, unknown>): EmployeeAvailabilityRow {
  return {
    id: String(raw.id),
    user_id: String(raw.user_id),
    company_id: String(raw.company_id),
    date: String(raw.date),
    status: raw.status as AvailabilityStatus,
    notes: raw.notes != null ? String(raw.notes) : null,
    locked: Boolean(raw.locked),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

const STATUS_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "undecided", label: "Undecided" },
  { value: "can_work", label: "Can work" },
  { value: "cannot_work", label: "Cannot work" },
];

export default function YourAvailabilityClient({
  userId,
  companyId,
  displayName,
  companyName,
  employeeName,
  initialYear,
  initialMonth,
}: YourAvailabilityClientProps) {
  const supabase = createClient();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [rowsByDate, setRowsByDate] = useState<Record<string, LocalDayRow>>({});
  const [onDutyDates, setOnDutyDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const notesDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rowsRef = useRef(rowsByDate);

  useEffect(() => {
    rowsRef.current = rowsByDate;
  }, [rowsByDate]);

  const days = useMemo(() => listDaysInMonth(year, month), [year, month]);
  const rangeLabel = useMemo(() => {
    const { from, to } = getMonthRange(year, month);
    const a = fromDateLabel(from);
    const b = fromDateLabel(to);
    return `${a} – ${b}`;
  }, [year, month]);

  const heading = useMemo(() => formatMonthHeading(year, month, monthNames), [year, month]);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    setSaveError(null);
    const { from, to } = getMonthRange(year, month);

    const { data: avRows, error: avError } = await supabase
      .from("employee_availability")
      .select("*")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .gte("date", from)
      .lte("date", to);

    if (avError) {
      setSaveError(avError.message);
      setLoading(false);
      return;
    }

    const next: Record<string, LocalDayRow> = {};
    for (const d of listDaysInMonth(year, month)) {
      next[d] = { date: d, status: "undecided", notes: "", locked: false };
    }
    for (const raw of avRows || []) {
      const r = parseDbRow(raw as Record<string, unknown>);
      next[r.date] = mapDbToLocal(r);
    }
    setRowsByDate(next);

    let duty = new Set<string>();
    if (employeeName.trim()) {
      const { data: shiftRows, error: shError } = await supabase
        .from("shifts")
        .select("date")
        .eq("company_id", companyId)
        .eq("employee", employeeName.trim())
        .gte("date", from)
        .lte("date", to);
      if (!shError && shiftRows) {
        duty = new Set(shiftRows.map((s: { date: string }) => s.date));
      }
    }
    setOnDutyDates(duty);
    setLoading(false);
  }, [supabase, userId, companyId, year, month, employeeName]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMonth();
    });
  }, [loadMonth]);

  const persistDay = useCallback(
    async (date: string, patch: Partial<Pick<LocalDayRow, "status" | "notes">>) => {
      const row = rowsRef.current[date];
      if (!row || row.locked) return;

      const status = patch.status ?? row.status;
      const notes = patch.notes !== undefined ? patch.notes : row.notes;

      const payload = {
        user_id: userId,
        company_id: companyId,
        date,
        status,
        notes: notes.trim() ? notes.trim() : null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("employee_availability")
        .upsert(payload, { onConflict: "user_id,company_id,date" })
        .select("id,status,notes,locked");

      if (error) {
        setSaveError(error.message);
        return;
      }

      setSaveError(null);
      const returned = Array.isArray(data) ? data[0] : data;
      if (returned) {
        const d = returned as { id: string; status: AvailabilityStatus; notes: string | null; locked: boolean };
        setRowsByDate((prev) => ({
          ...prev,
          [date]: {
            ...prev[date],
            id: d.id,
            status: d.status,
            notes: d.notes ?? "",
            locked: d.locked,
          },
        }));
      }
    },
    [supabase, userId, companyId]
  );

  const onStatusChange = useCallback(
    (date: string, status: AvailabilityStatus) => {
      setRowsByDate((prev) => ({
        ...prev,
        [date]: { ...prev[date], status },
      }));
      void persistDay(date, { status });
    },
    [persistDay]
  );

  const scheduleNotesSave = useCallback(
    (date: string, notes: string) => {
      if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
      notesDebounceRef.current = setTimeout(() => {
        void persistDay(date, { notes });
      }, 500);
    },
    [persistDay]
  );

  useEffect(() => {
    return () => {
      if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    };
  }, []);

  const onNotesChange = useCallback(
    (date: string, notes: string) => {
      setRowsByDate((prev) => ({
        ...prev,
        [date]: { ...prev[date], notes },
      }));
      scheduleNotesSave(date, notes);
    },
    [scheduleNotesSave]
  );

  const goPrev = () => {
    const n = shiftMonth(year, month, -1);
    setYear(n.year);
    setMonth(n.month);
  };

  const goNext = () => {
    const n = shiftMonth(year, month, 1);
    setYear(n.year);
    setMonth(n.month);
  };

  return (
    <EmployeePortalShell displayName={displayName} companyName={companyName} activeHref="/app/your-availability">
      <div className="space-y-5">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your availability</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Set whether you can work each day. This is your personal calendar only — managers may lock
            individual days; locked rows cannot be edited here.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visible range</p>
            <p className="text-sm font-semibold text-slate-900">{heading}</p>
            <p className="mt-0.5 text-xs tabular-nums text-slate-600">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        {saveError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {saveError}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Notes</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">On duty</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Locked by manager
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      Loading…
                    </td>
                  </tr>
                ) : (
                  days.map((date) => {
                    const row = rowsByDate[date] || {
                      date,
                      status: "undecided" as AvailabilityStatus,
                      notes: "",
                      locked: false,
                    };
                    const onDuty = onDutyDates.has(date);
                    const locked = row.locked;
                    const cannot = row.status === "cannot_work";
                    return (
                      <tr
                        key={date}
                        className={cannot ? "bg-amber-50/40" : onDuty ? "bg-sky-50/30" : undefined}
                      >
                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-900">
                          {formatRowDate(date)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {cannot ? (
                              <span
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-[10px] font-bold text-amber-800"
                                title="Cannot work"
                              >
                                !
                              </span>
                            ) : null}
                            <select
                              value={row.status}
                              disabled={locked}
                              onChange={(e) => onStatusChange(date, e.target.value as AvailabilityStatus)}
                              className="w-full min-w-[10rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100"
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={row.notes}
                            disabled={locked}
                            onChange={(e) => onNotesChange(date, e.target.value)}
                            placeholder="Optional"
                            className="w-full min-w-[12rem] rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          {onDuty ? (
                            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-900">
                              Shift
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                          {locked ? (
                            <span className="text-xs font-semibold text-slate-700">Yes</span>
                          ) : (
                            <span className="text-xs text-slate-400">No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </EmployeePortalShell>
  );
}

function fromDateLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRowDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
