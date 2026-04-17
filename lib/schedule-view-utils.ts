import { addDays, startOfWeek, toDateInputValue } from "./utils";

export type ScheduleViewKind = "day" | "week" | "two_weeks" | "month";

export type PlannerColumnDate = {
  dayName: string;
  date: string;
  label: string;
};

/** Move by whole calendar months while keeping the 1st (use when anchor is start-of-month). */
export function addCalendarMonthsFirst(anchor: Date, delta: number): Date {
  return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1, 0, 0, 0, 0);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function getPlannerColumnDates(start: Date, count: number): PlannerColumnDate[] {
  const normalized = new Date(start);
  normalized.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const d = addDays(normalized, index);
    const dayName = d.toLocaleString("en-GB", { weekday: "long" });
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { dayName, date: toDateInputValue(d), label };
  });
}

function shortMonth(monthNames: readonly string[], monthIndex0: number) {
  return monthNames[monthIndex0 + 1]?.slice(0, 3) ?? "";
}

function formatDayMonthYear(d: Date, monthNames: readonly string[]) {
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${shortMonth(monthNames, d.getMonth())} ${d.getFullYear()}`;
}

export function formatScheduleRangeLabel(
  view: ScheduleViewKind,
  navigatorAnchor: Date,
  monthNames: readonly string[]
): string {
  const a = new Date(navigatorAnchor);
  a.setHours(0, 0, 0, 0);

  if (view === "day") {
    return formatDayMonthYear(a, monthNames);
  }

  if (view === "week") {
    const start = startOfWeek(a);
    const end = addDays(start, 6);
    return `${formatDayMonthYear(start, monthNames)} – ${formatDayMonthYear(end, monthNames)}`;
  }

  if (view === "two_weeks") {
    const start = startOfWeek(a);
    const end = addDays(start, 13);
    return `${formatDayMonthYear(start, monthNames)} – ${formatDayMonthYear(end, monthNames)}`;
  }

  const first = startOfMonth(a);
  const last = new Date(a.getFullYear(), a.getMonth() + 1, 0);
  return `${formatDayMonthYear(first, monthNames)} – ${formatDayMonthYear(last, monthNames)}`;
}

export function labelFromViewKind(kind: ScheduleViewKind): string {
  if (kind === "day") return "Day";
  if (kind === "week") return "Week";
  if (kind === "two_weeks") return "2 Weeks";
  return "Month";
}

export function snapAnchorForView(kind: ScheduleViewKind, reference: Date): Date {
  const r = new Date(reference);
  r.setHours(0, 0, 0, 0);
  if (kind === "day") return r;
  if (kind === "week" || kind === "two_weeks") return startOfWeek(r);
  return startOfMonth(r);
}
