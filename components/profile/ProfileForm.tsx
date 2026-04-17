"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { saveProfileEmployeeAction, type ProfileEmployeeView } from "@/app/profile/actions";

type Props = {
  authEmail: string | null;
  companyName: string | null;
  initialEmployee: ProfileEmployeeView | null;
};

export default function ProfileForm({ authEmail, companyName, initialEmployee }: Props) {
  const [employee, setEmployee] = useState<ProfileEmployeeView | null>(initialEmployee);
  const [name, setName] = useState(initialEmployee?.name ?? "");
  const [email, setEmail] = useState(initialEmployee?.email ?? "");
  const [phone, setPhone] = useState(initialEmployee?.phone ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    initialEmployee != null ? String(initialEmployee.hourlyRate) : ""
  );
  const [defaultRole, setDefaultRole] = useState(initialEmployee?.defaultRole ?? "Service");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "—";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }, [name]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!employee) {
      setError("No employee record is linked to your account yet.");
      return;
    }

    const rate = Number(hourlyRate);
    if (Number.isNaN(rate) || rate < 0) {
      setError("Hourly rate must be a valid number (0 or greater).");
      return;
    }

    startTransition(async () => {
      const result = await saveProfileEmployeeAction({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        hourlyRate: rate,
        defaultRole: defaultRole.trim(),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setEmployee(result.employee);
      setName(result.employee.name);
      setEmail(result.employee.email);
      setPhone(result.employee.phone);
      setHourlyRate(String(result.employee.hourlyRate));
      setDefaultRole(result.employee.defaultRole);
      setSuccess("Profile saved.");
    });
  }

  const hasRecord = Boolean(employee);

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <aside className="lg:col-span-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-950 text-sm font-bold text-white">
            {initials}
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Signed in</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{name.trim() || "Your name"}</p>
          {authEmail ? (
            <p className="mt-2 text-xs text-slate-500">Login email: {authEmail}</p>
          ) : null}
          {companyName ? (
            <p className="mt-1 text-xs font-medium text-slate-600">Workspace: {companyName}</p>
          ) : null}
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {hasRecord
              ? "Details below are stored on your employee record in Supabase and load on every visit."
              : "Once an employee row is linked to your account, you can edit your work profile here."}
          </p>
        </div>
      </aside>

      <div className="space-y-6 lg:col-span-8">
        {!hasRecord ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-amber-950">No employee record linked</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
              We could not find an <span className="font-medium">employees</span> row with your{" "}
              <span className="font-medium">user id</span>, and either your login email does not match
              an employee work email or more than one unlinked row shares that email.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
              Ask a workspace admin to set your <span className="font-medium">email</span> on your
              employee profile to match your Planyo login, or apply the latest database migration and
              ensure your account has an employee row with <span className="font-medium">user_id</span>{" "}
              set.
            </p>
          </section>
        ) : null}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Personal & work info</h2>
            <p className="mt-1 text-xs text-slate-500">
              Saved to the <span className="font-medium">employees</span> table for your workspace.
              Changing your name updates matching shifts so scheduling stays consistent.
            </p>
          </div>

          {error ? (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {success}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Full name</span>
                <input
                  required
                  disabled={!hasRecord || isPending}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Work email</span>
                <input
                  type="email"
                  disabled={!hasRecord || isPending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authEmail || "you@company.com"}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Used for HR and linking; login email stays with your auth account.
                </span>
              </label>
            </div>

            <label className="block text-sm">
              <span className="font-medium text-slate-700">Phone</span>
              <input
                type="tel"
                disabled={!hasRecord || isPending}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Default role</span>
                <input
                  disabled={!hasRecord || isPending}
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Hourly rate</span>
                <input
                  inputMode="decimal"
                  disabled={!hasRecord || isPending}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!hasRecord || isPending}
                className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
              >
                Back to app
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
