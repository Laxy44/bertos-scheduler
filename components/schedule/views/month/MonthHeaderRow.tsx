"use client";

type MonthHeaderRowProps = {
  monthNames: readonly string[];
  month: number;
  year: number;
};

export default function MonthHeaderRow({ monthNames, month, year }: MonthHeaderRowProps) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Month</p>
        <h2 className="text-lg font-semibold text-slate-900">
          {monthNames[month]} {year}
        </h2>
      </div>
    </div>
  );
}
