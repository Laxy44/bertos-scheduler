"use client";

import { useMemo, useState, useTransition } from "react";

import { updatePayrollSettingsAction } from "@/app/settings/actions";

const commonCurrencies = ["DKK", "EUR", "SEK", "NOK", "GBP", "USD"] as const;

type Props = {
  initialCurrency: string;
  initialDefaultHourlyWage: number | null;
};

export default function PayrollSettingsForm({ initialCurrency, initialDefaultHourlyWage }: Props) {
  const [currency, setCurrency] = useState((initialCurrency || "DKK").toUpperCase());
  const [wage, setWage] = useState(
    initialDefaultHourlyWage != null ? String(initialDefaultHourlyWage) : ""
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const currencyOptions = useMemo(() => {
    const list = [...commonCurrencies];
    if (currency && !list.includes(currency as (typeof commonCurrencies)[number])) {
      return [currency, ...list];
    }
    return list;
  }, [currency]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updatePayrollSettingsAction({ currency, defaultHourlyWage: wage });
      setMessage(res.ok ? "Saved." : res.error);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Payroll defaults</h2>
      <p className="mt-1 text-sm text-slate-500">
        Currency is used for reporting labels. Default hourly wage pre-fills new employees (you can still
        edit each person).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            className="mt-1 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-400">
            Three-letter ISO codes. More currencies can ship with accounting integrations later.
          </span>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Default hourly wage</span>
          <input
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 130"
            className="mt-1 w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm"
          />
          <span className="mt-1 block text-xs text-slate-400">Leave empty to use only per-employee rates.</span>
        </label>

        {message ? (
          <p
            className={`text-sm ${message === "Saved." ? "text-emerald-700" : "text-red-600"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
