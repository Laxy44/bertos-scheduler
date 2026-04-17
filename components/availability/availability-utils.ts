import { toDateInputValue } from "../../lib/utils";

export function getMonthRange(year: number, monthIndex1Based: number): { from: string; to: string } {
  const start = new Date(year, monthIndex1Based - 1, 1);
  const end = new Date(year, monthIndex1Based, 0);
  return { from: toDateInputValue(start), to: toDateInputValue(end) };
}

export function listDaysInMonth(year: number, monthIndex1Based: number): string[] {
  const lastDay = new Date(year, monthIndex1Based, 0).getDate();
  return Array.from({ length: lastDay }, (_, i) =>
    toDateInputValue(new Date(year, monthIndex1Based - 1, i + 1))
  );
}

export function formatMonthHeading(year: number, monthIndex1Based: number, monthNames: readonly string[]) {
  return `${monthNames[monthIndex1Based]} ${year}`;
}

export function shiftMonth(year: number, monthIndex1Based: number, delta: number): { year: number; month: number } {
  const d = new Date(year, monthIndex1Based - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
