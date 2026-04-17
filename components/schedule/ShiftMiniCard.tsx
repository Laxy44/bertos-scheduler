"use client";

export type ShiftMiniLike = {
  id: string;
  start: string;
  end: string;
  role: string;
  actualStart?: string;
  actualEnd?: string;
  approved?: boolean;
};

type ShiftMiniCardProps = {
  shift: ShiftMiniLike;
  getShiftStatusLabel: (shift: ShiftMiniLike) => string;
  getShiftStatusStyles: (shift: ShiftMiniLike) => string;
  onClick?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export default function ShiftMiniCard({
  shift,
  getShiftStatusLabel,
  getShiftStatusStyles,
  onClick,
  disabled,
  readOnly,
}: ShiftMiniCardProps) {
  const isApproved = shift.approved === true;
  const hasSavedActual = Boolean(shift.actualStart) && Boolean(shift.actualEnd);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-900">
            {shift.start}-{shift.end}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{shift.role}</div>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getShiftStatusStyles(
            shift
          )}`}
        >
          {getShiftStatusLabel(shift)}
        </span>
      </div>
      {shift.actualStart || shift.actualEnd ? (
        <div className="mt-2 text-[10px] text-slate-500">
          Actual {shift.actualStart || "--:--"} - {shift.actualEnd || "--:--"}
        </div>
      ) : null}
    </>
  );

  if (readOnly) {
    return (
      <div
        className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-sm shadow-sm ${
          isApproved
            ? "border-emerald-300 bg-emerald-50"
            : hasSavedActual
            ? "border-blue-200 bg-blue-50"
            : "border-slate-200 bg-white"
        }`}
      >
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-sm shadow-sm transition ${
        disabled ? "cursor-default" : "hover:border-slate-300"
      } ${
        isApproved
          ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-50"
          : hasSavedActual
          ? "border-blue-200 bg-blue-50 hover:bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      {inner}
    </button>
  );
}
