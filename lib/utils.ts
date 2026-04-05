import { days, defaultEmployees, monthNames } from "./constants";
import type { EmployeeConfig, Shift } from "../types/schedule";

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, amount: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function getDayNameFromDate(value: string) {
  const d = fromDateInputValue(value);
  const day = d.getDay();
  const map = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return map[day];
}

export function getWeekDates(weekStart: Date) {
  return days.map((dayName, index) => {
    const d = addDays(weekStart, index);
    return {
      dayName,
      date: toDateInputValue(d),
      label: `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`,
    };
  });
}

export function getISOWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const weekNumber = getISOWeekNumber(weekStart);

  const startDay = String(weekStart.getDate()).padStart(2, "0");
  const startMonth = monthNames[weekStart.getMonth() + 1].slice(0, 3);

  const endDay = String(weekEnd.getDate()).padStart(2, "0");
  const endMonth = monthNames[weekEnd.getMonth() + 1].slice(0, 3);

  const year = weekEnd.getFullYear();

  return {
    label: `W${weekNumber}`,
    range: `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`,
  };
}

export function getHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return (endMinutes - startMinutes) / 60;
}

export function isOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const toRange = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    let endMinutes = eh * 60 + em;

    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    return { start: startMinutes, end: endMinutes };
  };

  const a = toRange(aStart, aEnd);
  const b = toRange(bStart, bEnd);

  const shiftedA = [a, { start: a.start + 24 * 60, end: a.end + 24 * 60 }];
  const shiftedB = [b, { start: b.start + 24 * 60, end: b.end + 24 * 60 }];

  return shiftedA.some((rangeA) =>
    shiftedB.some(
      (rangeB) => rangeA.start < rangeB.end && rangeB.start < rangeA.end
    )
  );
}

export function roleStyles(role: string) {
  const normalized = role.toLowerCase();

  if (normalized.includes("kitchen")) return "border-amber-200 bg-amber-50 text-amber-800";
  if (normalized.includes("service")) return "border-blue-200 bg-blue-50 text-blue-800";
  if (normalized.includes("delivery")) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (normalized.includes("prep")) return "border-purple-200 bg-purple-50 text-purple-800";

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function formatHours(value: number) {
  return `${value.toFixed(1)} hrs`;
}

export function formatDKK(value: number) {
  return new Intl.NumberFormat("en-DK", {
    style: "currency",
    currency: "DKK",
  }).format(value);
}

export function roundTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (m <= 14) return `${String(h).padStart(2, "0")}:00`;
  if (m <= 44) return `${String(h).padStart(2, "0")}:30`;
  return `${String((h + 1) % 24).padStart(2, "0")}:00`;
}

export function normalizeManualTimeInput(value: string) {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
  if (digitsOnly.length <= 2) return digitsOnly;
  return digitsOnly.slice(0, 2) + ":" + digitsOnly.slice(2);
}

export function isValidFullTime(value: string) {
  if (value.length !== 5 || value[2] !== ":") return false;
  const h = Number(value.slice(0, 2));
  const m = Number(value.slice(3, 5));
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function normalizeEmployeesData(data: unknown): EmployeeConfig[] {
  if (!Array.isArray(data)) return defaultEmployees;

  return data.map((e: any) => ({
    name: e.name || "",
    hourlyRate: e.hourlyRate || 0,
    defaultRole: e.defaultRole || "Kitchen",
    unavailableDates: e.unavailableDates || [],
    active: e.active ?? true,
  }));
}

export function normalizeShiftsData(data: unknown): Shift[] {
  if (!Array.isArray(data)) return [];

  return data.map((s: any) => ({
    id: s.id || Date.now(),
    employee: s.employee || "",
    day: s.day || "",
    role: s.role || "Kitchen",
    start: s.start || "10:00",
    end: s.end || "15:00",
    notes: s.notes || "",
    date: s.date || toDateInputValue(new Date()),
    actualStart: s.actualStart,
    actualEnd: s.actualEnd,
  }));
}

export function getCurrentTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function getWorkedHours(shift: Shift) {
  if (!shift.actualStart || !shift.actualEnd) return 0;
  return getHours(shift.actualStart, shift.actualEnd);
}

export function getPlannedHours(shift: Shift) {
  return getHours(shift.start, shift.end);
}

export function getMonthCalendarDays(month: number, year: number) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);

  const start = startOfWeek(first);
  const end = addDays(startOfWeek(last), 6);

  const result = [];
  let current = new Date(start);

  while (current <= end) {
    result.push({
      date: toDateInputValue(current),
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month - 1,
    });
    current = addDays(current, 1);
  }

  return result;
}

export function sortEmployeesForDisplay(employees: EmployeeConfig[]) {
  return [...employees].sort((a, b) =>
    a.active === b.active ? a.name.localeCompare(b.name) : a.active ? -1 : 1
  );
}