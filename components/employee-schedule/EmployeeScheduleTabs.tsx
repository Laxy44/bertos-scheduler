"use client";

export type EmployeeScheduleSectionTab = "schedule" | "week" | "month" | "open";

type EmployeeScheduleTabsProps = {
  active: EmployeeScheduleSectionTab;
  onChange: (tab: EmployeeScheduleSectionTab) => void;
};

const tabs: { id: EmployeeScheduleSectionTab; label: string }[] = [
  { id: "schedule", label: "Your schedule" },
  { id: "week", label: "Per week" },
  { id: "month", label: "Per month" },
  { id: "open", label: "Open shifts" },
];

export default function EmployeeScheduleTabs({ active, onChange }: EmployeeScheduleTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Schedule views"
      className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50/80 p-1 shadow-sm"
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
