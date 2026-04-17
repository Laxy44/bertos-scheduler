type AccountValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type StepAccountProps = {
  values: AccountValues;
  onChange: (next: Partial<AccountValues>) => void;
  isLoggedInWithoutMembership: boolean;
};

export default function StepAccount({
  values,
  onChange,
  isLoggedInWithoutMembership,
}: StepAccountProps) {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
          <input
            value={values.firstName}
            name="owner_onboarding_first_name"
            autoComplete="off"
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            placeholder="Alex"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
          <input
            value={values.lastName}
            name="owner_onboarding_last_name"
            autoComplete="off"
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            placeholder="Jensen"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={values.email}
          name="owner_onboarding_email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={isLoggedInWithoutMembership}
          onChange={(e) => onChange({ email: e.target.value })}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="owner@company.com"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {isLoggedInWithoutMembership ? "Password (not needed while signed in)" : "Password"}
        </label>
        <input
          type="password"
          value={values.password}
          name="owner_onboarding_password"
          autoComplete="new-password"
          disabled={isLoggedInWithoutMembership}
          onChange={(e) => onChange({ password: e.target.value })}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="At least 6 characters"
        />
      </div>

      {isLoggedInWithoutMembership ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
          You are already signed in. Planyo will create the workspace under this account.
        </div>
      ) : null}
    </section>
  );
}
