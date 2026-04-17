"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-100";

const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500";

function splitEmployeeDisplayName(full: string) {
  const t = full.trim();
  if (!t) return { firstName: "", surname: "" };
  const parts = t.split(/\s+/);
  return { firstName: parts[0] ?? "", surname: parts.slice(1).join(" ") };
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type EmployeeEditPanelProps = {
  employee: {
    name: string;
    hourlyRate: number;
    defaultRole: string;
    unavailableDates: string[];
    active: boolean;
  };
  updateEmployeeName: (oldName: string, newName: string) => Promise<void>;
  updateEmployeeRate: (name: string, newRate: number) => Promise<void>;
  updateEmployeeRole: (name: string, newRole: string) => Promise<void>;
  setEmployeeActiveStatus: (name: string, active: boolean) => Promise<void>;
  deleteEmployee: (name: string) => Promise<void>;
  availabilityDrafts: Record<string, string>;
  updateAvailabilityDraft: (name: string, value: string) => void;
  addUnavailableDate: (name: string) => Promise<void>;
  removeUnavailableDate: (name: string, date: string) => Promise<void>;
};

function EmployeeEditPanel({
  employee,
  updateEmployeeName,
  updateEmployeeRate,
  updateEmployeeRole,
  setEmployeeActiveStatus,
  deleteEmployee,
  availabilityDrafts,
  updateAvailabilityDraft,
  addUnavailableDate,
  removeUnavailableDate,
}: EmployeeEditPanelProps) {
  const parsed = useMemo(() => splitEmployeeDisplayName(employee.name), [employee.name]);

  const [firstName, setFirstName] = useState(parsed.firstName);
  const [surname, setSurname] = useState(parsed.surname);
  const [hourlyRate, setHourlyRate] = useState(String(employee.hourlyRate));
  const [defaultRole, setDefaultRole] = useState(employee.defaultRole);
  const [emailDraft, setEmailDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [taxId, setTaxId] = useState("");
  const [payrollPin, setPayrollPin] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const next = splitEmployeeDisplayName(employee.name);
    setFirstName(next.firstName);
    setSurname(next.surname);
    setHourlyRate(String(employee.hourlyRate));
    setDefaultRole(employee.defaultRole);
  }, [employee.name, employee.hourlyRate, employee.defaultRole]);

  const displayName = useMemo(
    () => [firstName, surname].filter(Boolean).join(" ").trim() || employee.name,
    [firstName, surname, employee.name]
  );

  const resetDraft = useCallback(() => {
    const next = splitEmployeeDisplayName(employee.name);
    setFirstName(next.firstName);
    setSurname(next.surname);
    setHourlyRate(String(employee.hourlyRate));
    setDefaultRole(employee.defaultRole);
    setEmailDraft("");
    setPhoneDraft("");
    setBirthday("");
    setGender("");
    setAddressLine("");
    setCity("");
    setPostcode("");
    setCountry("");
    setBankAccount("");
    setTaxId("");
    setPayrollPin("");
  }, [employee.defaultRole, employee.hourlyRate, employee.name]);

  const handleSave = async () => {
    const fullName = [firstName, surname].filter(Boolean).join(" ").trim();
    if (!fullName) {
      window.alert("Please enter at least a first name or surname.");
      return;
    }
    const rate = Number(hourlyRate);
    if (Number.isNaN(rate) || rate < 0) {
      window.alert("Please enter a valid hourly rate.");
      return;
    }

    setIsSaving(true);
    try {
      await updateEmployeeRate(employee.name, rate);
      await updateEmployeeRole(employee.name, defaultRole.trim());
      if (fullName !== employee.name.trim()) {
        await updateEmployeeName(employee.name, fullName);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setEmployeeActiveStatus(employee.name, true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              employee.active
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setEmployeeActiveStatus(employee.name, false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              !employee.active
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            Inactive
          </button>
        </div>
        <button
          type="button"
          onClick={() => void deleteEmployee(employee.name)}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-100 transition hover:bg-red-100"
        >
          Delete employee
        </button>
      </div>

      <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-12 lg:gap-8">
        <aside className="lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {initialsFromName(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-slate-900">{displayName}</p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {emailDraft.trim() ? emailDraft.trim() : "No email on file"}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{defaultRole || "—"}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <SectionCard
            title="Personal info"
            description="Name and role are saved with Save. Other fields are UI-only until backend support is added."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className={labelClass}>Surname</label>
                <input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className={inputClass}
                  placeholder="Surname"
                />
              </div>
              <div>
                <label className={labelClass}>Birthday</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Contact info"
            description="Not stored in Planyo yet — captured for future sync."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className={inputClass}
                  placeholder="name@company.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Phone</label>
                <input
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  className={inputClass}
                  placeholder="+45 12 34 56 78"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Address"
            description="Not stored in Planyo yet — captured for future sync."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Street address</label>
                <input
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className={inputClass}
                  placeholder="Street and number"
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                  placeholder="City"
                />
              </div>
              <div>
                <label className={labelClass}>Postcode</label>
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  className={inputClass}
                  placeholder="Postcode"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Country</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                  placeholder="Country"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Payroll & scheduling">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Hourly rate (DKK)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Default role</label>
                <input
                  value={defaultRole}
                  onChange={(e) => setDefaultRole(e.target.value)}
                  className={inputClass}
                  placeholder="Role"
                />
              </div>
              <div>
                <label className={labelClass}>Bank account</label>
                <input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className={inputClass}
                  placeholder="IBAN or account no."
                />
              </div>
              <div>
                <label className={labelClass}>Tax ID</label>
                <input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className={inputClass}
                  placeholder="CPR / tax number"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>PIN / reference</label>
                <input
                  value={payrollPin}
                  onChange={(e) => setPayrollPin(e.target.value)}
                  className={inputClass}
                  placeholder="Internal reference"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Bank, tax ID, and PIN are not saved yet. Hourly rate and default role are saved with Save.
            </p>
          </SectionCard>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={resetDraft}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-50"
          >
            Reset changes
          </button>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="border-t border-slate-100 p-5 md:p-6">
        <h4 className="text-sm font-semibold text-slate-900">Availability</h4>
        <p className="mt-1 text-xs text-slate-500">
          Unavailable dates apply immediately when you add or remove.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            value={availabilityDrafts[employee.name] || ""}
            onChange={(e) => updateAvailabilityDraft(employee.name, e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => addUnavailableDate(employee.name)}
            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Add date
          </button>
        </div>
        {employee.unavailableDates.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No unavailable dates.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {employee.unavailableDates.map((date: string) => (
              <span
                key={date}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {date}
                <button
                  type="button"
                  onClick={() => removeUnavailableDate(employee.name, date)}
                  className="rounded-full px-1.5 text-red-600 hover:bg-red-50"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function EmployeesSection({
  sortedEmployeesData,
  newEmployeeForm,
  setNewEmployeeForm,
  newEmployeeRoleMode,
  setNewEmployeeRoleMode,
  roleSuggestions,
  CUSTOM_ROLE_OPTION,
  addEmployee,
  setEmployeeActiveStatus,
  deleteEmployee,
  updateEmployeeName,
  updateEmployeeRate,
  updateEmployeeRole,
  availabilityDrafts,
  updateAvailabilityDraft,
  addUnavailableDate,
  removeUnavailableDate,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [modalForm, setModalForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    role: "Service",
    hourlyRate: "130",
    phone: "",
    visibleToOthers: false,
    birthday: "",
    hireDate: "",
    inviteToPlanyo: false,
    /** App membership role for Supabase invite (not scheduling role). */
    inviteAppRole: "employee" as "employee" | "admin",
    sendWelcome: false,
  });

  function openModal() {
    setStatusMessage(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setIsModalOpen(false);
  }

  async function handleCreateEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const trimmedFirst = modalForm.firstName.trim();
    const trimmedSurname = modalForm.surname.trim();
    const name = [trimmedFirst, trimmedSurname].filter(Boolean).join(" ").trim();
    const hourlyRate = Number(modalForm.hourlyRate);

    if (!name) {
      setErrorMessage("Please enter at least a first name or surname.");
      return;
    }
    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      setErrorMessage("Please enter a valid hourly rate.");
      return;
    }

    if (modalForm.inviteToPlanyo && !modalForm.email.trim()) {
      setErrorMessage("Enter an email address to send a Planyo invite.");
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultRole = modalForm.role || "Service";

      // Pass payload directly so addEmployee does not rely on async parent state.
      await addEmployee({
        name,
        hourlyRate,
        defaultRole,
      });

      let inviteNote = "";
      if (modalForm.inviteToPlanyo) {
        const inviteEmail = modalForm.email.trim().toLowerCase();
        const inviteRes = await fetch("/api/invites", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: inviteEmail,
            role: modalForm.inviteAppRole,
          }),
        });
        const inviteJson = (await inviteRes.json().catch(() => ({}))) as {
          error?: string;
        };
        if (!inviteRes.ok) {
          inviteNote = ` Invite email was not sent: ${inviteJson.error || inviteRes.statusText}.`;
        } else {
          inviteNote =
            " Invite email sent (if nothing arrives in a few minutes, check spam and Supabase Auth → email / SMTP).";
        }
      }

      setStatusMessage(`Employee added successfully.${inviteNote}`);
      setModalForm((current) => ({
        ...current,
        firstName: "",
        surname: "",
        email: "",
        hourlyRate: "130",
        phone: "",
        birthday: "",
        hireDate: "",
        inviteToPlanyo: current.inviteToPlanyo,
        inviteAppRole: current.inviteAppRole,
        sendWelcome: current.sendWelcome,
      }));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating employee:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to add employee. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Employees</h2>
        <p className="mt-1 text-sm text-slate-500">
          Active employees are shown first in A-Z order. Inactive employees
          stay at the bottom. Permanent delete is only allowed when an
          employee has no shifts.
        </p>
      </div>
      <section className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold">Employees</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create staff records for scheduling. You can also optionally invite them
              to access Planyo.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={openModal}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create employee
            </button>
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
            {statusMessage}
          </div>
        ) : null}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create employee</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use this form to add a staff member for scheduling. You can also send
                  an invite so they can log in to Planyo.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Esc
              </button>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">First name</label>
                  <input
                    value={modalForm.firstName}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, firstName: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Surname</label>
                  <input
                    value={modalForm.surname}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, surname: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    placeholder="Surname"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email (used for invite)
                  </label>
                  <input
                    type="email"
                    value={modalForm.email}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, email: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    placeholder="employee@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Mobile (optional)</label>
                  <input
                    value={modalForm.phone}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, phone: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                    placeholder="+45 12 34 56 78"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Role</label>
                  <select
                    value={modalForm.role}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, role: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    {roleSuggestions.map((role: string) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Hourly rate (DKK)
                  </label>
                  <input
                    type="number"
                    value={modalForm.hourlyRate}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, hourlyRate: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="mb-1 block text-sm font-medium">
                    Visibility & dates (optional)
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={modalForm.visibleToOthers}
                        onChange={(e) =>
                          setModalForm((current) => ({
                            ...current,
                            visibleToOthers: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      Visible to other employees
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Birthday (optional)
                  </label>
                  <input
                    type="date"
                    value={modalForm.birthday}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, birthday: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Hire date (optional)
                  </label>
                  <input
                    type="date"
                    value={modalForm.hireDate}
                    onChange={(e) =>
                      setModalForm((current) => ({ ...current, hireDate: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={modalForm.inviteToPlanyo}
                    onChange={(e) =>
                      setModalForm((current) => ({
                        ...current,
                        inviteToPlanyo: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <span>Invite to Planyo (sends email to the address above)</span>
                </label>
                {modalForm.inviteToPlanyo ? (
                  <div className="pl-7">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Planyo access role
                    </label>
                    <select
                      value={modalForm.inviteAppRole}
                      onChange={(e) =>
                        setModalForm((current) => ({
                          ...current,
                          inviteAppRole: e.target.value as "employee" | "admin",
                        }))
                      }
                      className="w-full max-w-xs rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                ) : null}
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={modalForm.sendWelcome}
                    onChange={(e) =>
                      setModalForm((current) => ({
                        ...current,
                        sendWelcome: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <span>Send welcome message (placeholder only)</span>
                </label>
              </div>

              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {isSubmitting ? "Saving…" : "Save employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {sortedEmployeesData.map((employee: any) => (
          <EmployeeEditPanel
            key={employee.name}
            employee={employee}
            updateEmployeeName={updateEmployeeName}
            updateEmployeeRate={updateEmployeeRate}
            updateEmployeeRole={updateEmployeeRole}
            setEmployeeActiveStatus={setEmployeeActiveStatus}
            deleteEmployee={deleteEmployee}
            availabilityDrafts={availabilityDrafts}
            updateAvailabilityDraft={updateAvailabilityDraft}
            addUnavailableDate={addUnavailableDate}
            removeUnavailableDate={removeUnavailableDate}
          />
        ))}
      </div>
    </section>
  );
}