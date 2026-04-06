"use client";

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
        <h3 className="text-lg font-bold">Add Employee</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              value={newEmployeeForm.name}
              onChange={(e) =>
                setNewEmployeeForm((current: any) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              placeholder="Employee name"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Hourly Rate (DKK)
            </label>
            <input
              type="number"
              value={newEmployeeForm.hourlyRate}
              onChange={(e) =>
                setNewEmployeeForm((current: any) => ({
                  ...current,
                  hourlyRate: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Default Role
            </label>
            <div className="space-y-2">
              <select
                value={
                  newEmployeeRoleMode === "custom"
                    ? CUSTOM_ROLE_OPTION
                    : newEmployeeForm.defaultRole
                }
                onChange={(e) => {
                  if (e.target.value === CUSTOM_ROLE_OPTION) {
                    setNewEmployeeRoleMode("custom");
                    setNewEmployeeForm((current: any) => ({
                      ...current,
                      defaultRole:
                        current.defaultRole &&
                        !roleSuggestions.includes(current.defaultRole)
                          ? current.defaultRole
                          : "",
                    }));
                    return;
                  }

                  setNewEmployeeRoleMode("preset");
                  setNewEmployeeForm((current: any) => ({
                    ...current,
                    defaultRole: e.target.value,
                  }));
                }}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              >
                {roleSuggestions.map((role: string) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
                <option value={CUSTOM_ROLE_OPTION}>Custom role…</option>
              </select>

              {newEmployeeRoleMode === "custom" ? (
                <input
                  value={newEmployeeForm.defaultRole}
                  onChange={(e) =>
                    setNewEmployeeForm((current: any) => ({
                      ...current,
                      defaultRole: e.target.value,
                    }))
                  }
                  placeholder="Write default role"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={addEmployee}
            className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Add Employee
          </button>
        </div>
      </section>

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