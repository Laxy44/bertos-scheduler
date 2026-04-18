"use client";

import { useMemo, useState, useTransition } from "react";

import { updateGeneralSettingsAction } from "@/app/settings/actions";

const timezones = [
  "Europe/Copenhagen",
  "Europe/Stockholm",
  "Europe/Oslo",
  "Europe/Helsinki",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/London",
  "UTC",
] as const;

type Props = {
  initialName: string;
  initialTimezone: string;
  initialWeekStartsOn: "monday" | "sunday";
};

export default function GeneralSettingsForm({
  initialName,
  initialTimezone,
  initialWeekStartsOn,
}: Props) {
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [weekStartsOn, setWeekStartsOn] = useState<"monday" | "sunday">(initialWeekStartsOn);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const timezoneOptions = useMemo(() => {
    const list = [...timezones];
    if (timezone && !list.includes(timezone as (typeof timezones)[number])) {
      return [timezone, ...list];
    }
    return list;
  }, [timezone]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateGeneralSettingsAction({ companyName: name, timezone, weekStartsOn });
      setMessage(res.ok ? "Saved." : res.error);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">General</h2>
      <p className="mt-1 text-sm text-slate-500">Company identity and how dates align in the schedule.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Company name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full max-w-md rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-400"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Timezone</span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="text-sm">
          <legend className="font-medium text-slate-700">Default week starts on</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="week"
                checked={weekStartsOn === "monday"}
                onChange={() => setWeekStartsOn("monday")}
              />
              <span>Monday</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="week"
                checked={weekStartsOn === "sunday"}
                onChange={() => setWeekStartsOn("sunday")}
              />
              <span>Sunday</span>
            </label>
          </div>
        </fieldset>

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
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
