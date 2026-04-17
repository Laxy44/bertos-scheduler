type TeamEmployee = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type TeamValues = {
  roles: string[];
  customRole: string;
  employees: TeamEmployee[];
  sendInvites: boolean;
};

type StepTeamProps = {
  values: TeamValues;
  onChangeCustomRole: (value: string) => void;
  onAddRole: () => void;
  onRemoveRole: (role: string) => void;
  onUpdateEmployee: (index: number, patch: Partial<TeamEmployee>) => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (index: number) => void;
  onToggleInvites: (checked: boolean) => void;
};

export default function StepTeam({
  values,
  onChangeCustomRole,
  onAddRole,
  onRemoveRole,
  onUpdateEmployee,
  onAddEmployee,
  onRemoveEmployee,
  onToggleInvites,
}: StepTeamProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-700">Roles</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {values.roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onRemoveRole(role)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
              title="Remove role"
            >
              {role} x
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={values.customRole}
            onChange={(e) => onChangeCustomRole(e.target.value)}
            placeholder="Add role"
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={onAddRole}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">First employees</p>
          <button
            type="button"
            onClick={onAddEmployee}
            className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
          >
            Add employee
          </button>
        </div>

        <div className="space-y-3">
          {values.employees.map((employee, index) => (
            <div key={`employee-${index}`} className="rounded-2xl border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={employee.firstName}
                  onChange={(e) => onUpdateEmployee(index, { firstName: e.target.value })}
                  placeholder="First name"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <input
                  value={employee.lastName}
                  onChange={(e) => onUpdateEmployee(index, { lastName: e.target.value })}
                  placeholder="Last name"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr,160px,auto]">
                <input
                  type="email"
                  value={employee.email}
                  onChange={(e) => onUpdateEmployee(index, { email: e.target.value })}
                  placeholder="email@company.com"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <select
                  value={employee.role}
                  onChange={(e) => onUpdateEmployee(index, { role: e.target.value })}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  {values.roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveEmployee(index)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={values.sendInvites}
          onChange={(e) => onToggleInvites(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Send invite emails automatically after setup
      </label>
    </section>
  );
}
