"use client";

import { useState } from "react";

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

      <div className="grid gap-4">
        {sortedEmployeesData.map((employee: any) => (
          <div
            key={employee.name}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">{employee.name}</h3>
                <p className="text-sm text-slate-500">
                  {employee.active ? "Active employee" : "Inactive employee"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEmployeeActiveStatus(employee.name, true)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    employee.active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Active
                </button>

                <button
                  onClick={() => setEmployeeActiveStatus(employee.name, false)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    !employee.active
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Inactive
                </button>

                <button
                  onClick={() => deleteEmployee(employee.name)}
                  className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  defaultValue={employee.name}
                  onBlur={(e) => updateEmployeeName(employee.name, e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Hourly Rate (DKK)
                </label>
                <input
                  type="number"
                  value={employee.hourlyRate}
                  onChange={(e) =>
                    updateEmployeeRate(employee.name, Number(e.target.value))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Default Role
                </label>
                <input
                  value={employee.defaultRole}
                  onChange={(e) =>
                    updateEmployeeRole(employee.name, e.target.value)
                  }
                  placeholder="Write or choose role"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Summary</p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">Status:</span>{" "}
                  {employee.active ? "Active" : "Inactive"}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold">Unavailable:</span>{" "}
                  {employee.unavailableDates.length}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-medium">
                Add Unavailable Date
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="date"
                  value={availabilityDrafts[employee.name] || ""}
                  onChange={(e) =>
                    updateAvailabilityDraft(employee.name, e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
                <button
                  onClick={() => addUnavailableDate(employee.name)}
                  className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-600"
                >
                  Add
                </button>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-slate-700">
                  Unavailable Dates
                </p>

                {employee.unavailableDates.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">
                    No unavailable dates added.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {employee.unavailableDates.map((date: string) => (
                      <div
                        key={date}
                        className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-amber-800"
                      >
                        <span>{date}</span>
                        <button
                          onClick={() =>
                            removeUnavailableDate(employee.name, date)
                          }
                          className="rounded-full bg-white px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}