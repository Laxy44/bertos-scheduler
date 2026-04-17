type BusinessValues = {
  companyName: string;
  country: string;
  businessType: string;
  employeeCount: string;
};

type StepBusinessProps = {
  values: BusinessValues;
  onChange: (next: Partial<BusinessValues>) => void;
};

const COUNTRY_OPTIONS = ["Denmark", "Sweden", "Norway", "Germany", "Other"];
const BUSINESS_OPTIONS = ["Restaurant", "Retail", "Healthcare", "Hospitality", "Other"];
const EMPLOYEE_COUNT_OPTIONS = ["1-5", "6-15", "16-50", "51-200", "200+"];

export default function StepBusiness({ values, onChange }: StepBusinessProps) {
  return (
    <section className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
        <input
          value={values.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          placeholder="Planyo Bistro ApS"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
          <select
            value={values.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Select country</option>
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Business type</label>
          <select
            value={values.businessType}
            onChange={(e) => onChange({ businessType: e.target.value })}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Select business type</option>
            {BUSINESS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Employee count</label>
        <select
          value={values.employeeCount}
          onChange={(e) => onChange({ employeeCount: e.target.value })}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
        >
          <option value="">Select team size</option>
          {EMPLOYEE_COUNT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
