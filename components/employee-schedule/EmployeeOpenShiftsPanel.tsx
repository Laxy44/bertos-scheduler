"use client";

/**
 * Placeholder until open / unassigned shifts are modeled in the API.
 * Read-only list surface for future claim/request flows.
 */
export default function EmployeeOpenShiftsPanel() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-800">Open shifts</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        There are no open shifts to show yet. When your workspace publishes unassigned shifts you can
        browse them here (view-only for now).
      </p>
    </div>
  );
}
