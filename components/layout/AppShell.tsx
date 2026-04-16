"use client";



import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase";
import WeekNavigator from "../schedule/WeekNavigator";
import ScheduleSection from "../schedule/ScheduleSection";
import WeekSection from "../schedule/WeekSection";
import MonthSection from "../month/MonthSection";
import PayrollSection from "../payroll/PayrollSection";
import EmployeesSection from "../employees/EmployeesSection";
import { useRouter } from "next/navigation";
import Link from "next/link";



import type {
  
  AppTab,
  EmployeeConfig,
  FormState,
  NewEmployeeForm,
  Shift,
} from "../../types/schedule";

import {
  CUSTOM_ROLE_OPTION,
  monthNames,
  roles,
} from "../../lib/constants";

import {
  addDays,
  formatDKK,
  formatHours,
  fromDateInputValue,
  getCurrentTimeString,
  getDayNameFromDate,
  getMonthCalendarDays,
  getPlannedHours,
  getWeekDates,
  getWorkedHours,
  isOverlap,
  isValidFullTime,
  normalizeManualTimeInput,
  roleStyles,
  roundTime,
  sortEmployeesForDisplay,
  startOfWeek,
  toDateInputValue,
} from "../../lib/utils";







  









function createDefaultForm(date: string): FormState {
  return {
    employee: "",
    role: "",
    start: "10:00",
    end: "15:00",
    notes: "",
    date,
  };
}

const defaultNewEmployeeForm: NewEmployeeForm = {
  name: "",
  hourlyRate: "130",
  defaultRole: "Service",
};

type AppShellProps = {
  role: string;
  employeeName: string | null;
  companyName?: string | null;
  companyCvr?: string | null;
  activeCompanyId?: string | null;
};

export default function AppShell({
  role,
  employeeName,
  companyName,
  companyCvr,
  activeCompanyId,
}: AppShellProps) {
  const normalizedRole = (role || "employee").toLowerCase();
  const isAdmin = ["owner", "admin", "manager"].includes(normalizedRole);
  const workspaceName = companyName || "Workspace";
  const workspaceCvr = companyCvr || "";
  const supabase = createClient();
  const router = useRouter();

async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}

  const today = new Date();
  const todayDate = toDateInputValue(today);
  const todayWeekStart = startOfWeek(today);
  const initialWeekDates = getWeekDates(todayWeekStart);

  const currentYear = new Date().getFullYear();

  
  const [activeTab, setActiveTab] = useState<AppTab>("schedule");
  const [employees, setEmployees] =
    useState<EmployeeConfig[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showShiftForm, setShowShiftForm] = useState(false);

  useEffect(() => {
  async function fetchEmployees() {
    if (!activeCompanyId) {
      setEmployees([]);
      return;
    }

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("company_id", activeCompanyId);

    if (error) {
      console.log("Error fetching employees:", error);
      return;
    }

    const mappedEmployees: any[] = (data || []).map((emp) => ({
      id: emp.id,
      name: emp.name,
      hourlyRate: Number(emp.hourly_rate),
      defaultRole: emp.default_role,
      unavailableDates: Array.isArray(emp.unavailable_dates) ? emp.unavailable_dates : [],
      active: emp.active,
    }));

    setEmployees(mappedEmployees);
  }

  async function fetchShifts() {
    if (!activeCompanyId) {
      setShifts([]);
      return;
    }

    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("company_id", activeCompanyId)
      .order("date", { ascending: true })
      .order("start", { ascending: true });

    if (error) {
      console.log("Error fetching shifts:", error);
      return;
    }

    const mappedShifts: Shift[] = (data || []).map((shift) => ({
      id: shift.id,
      employee: shift.employee,
      day: getDayNameFromDate(shift.date),
      role: shift.role,
      start: shift.start,
      end: shift.end,
      notes: shift.notes || "",
      date: shift.date,
      actualStart: shift.actual_start || undefined,
      actualEnd: shift.actual_end || undefined,
      approved: shift.approved ?? false,
    }));

    setShifts(mappedShifts);
  }

  fetchEmployees();
  fetchShifts();
}, [activeCompanyId, supabase]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(todayWeekStart);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [form, setForm] = useState<FormState>(() => createDefaultForm(todayDate));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [copyFromDate, setCopyFromDate] = useState(initialWeekDates[0].date);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [availabilityDrafts, setAvailabilityDrafts] = useState<
    Record<string, string>
  >({});
  const [newEmployeeForm, setNewEmployeeForm] = useState<NewEmployeeForm>(
    defaultNewEmployeeForm
  );
  const [timesheetEmployee, setTimesheetEmployee] = useState(employeeName || "");
  const [shiftRoleMode, setShiftRoleMode] = useState<"preset" | "custom">("preset");
  const [newEmployeeRoleMode, setNewEmployeeRoleMode] = useState<"preset" | "custom">("preset");
  const [employeePeriodFrom, setEmployeePeriodFrom] = useState(() => {
    const now = new Date();
    return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));
  });
  const [employeePeriodTo, setEmployeePeriodTo] = useState(todayDate);

  const sortedEmployeesData = useMemo(
    () => sortEmployeesForDisplay(employees),
    [employees]
  );

  const activeEmployees = useMemo(
    () => sortedEmployeesData.filter((employee) => employee.active),
    [sortedEmployeesData]
  );

  const activeEmployeeNames = useMemo(
    () => activeEmployees.map((employee) => employee.name),
    [activeEmployees]
  );

  const employeeNames = useMemo(
    () => sortedEmployeesData.map((e) => e.name),
    [sortedEmployeesData]
  );

  const employeeRateMap = useMemo(() => {
    const result: Record<string, number> = {};
    employees.forEach((e) => {
      result[e.name] = e.hourlyRate;
    });
    return result;
  }, [employees]);

  const employeeRoleMap = useMemo(() => {
    const result: Record<string, string> = {};
    employees.forEach((e) => {
      result[e.name] = e.defaultRole;
    });
    return result;
  }, [employees]);

  const employeeUnavailableMap = useMemo(() => {
    const result: Record<string, string[]> = {};
    employees.forEach((e) => {
      result[e.name] = e.unavailableDates || [];
    });
    return result;
  }, [employees]);

  const roleSuggestions = useMemo(() => {
    const allRoles = new Set<string>(roles);

    employees.forEach((employee) => {
      if (employee.defaultRole.trim()) {
        allRoles.add(employee.defaultRole.trim());
      }
    });

    shifts.forEach((shift) => {
      if (shift.role.trim()) {
        allRoles.add(shift.role.trim());
      }
    });

    return Array.from(allRoles).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [employees, shifts]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const selectedDayName = useMemo(
    () => getDayNameFromDate(selectedDate),
    [selectedDate]
  );

  const currentEmployeeUnavailableDates = useMemo(() => {
    return employeeUnavailableMap[form.employee] || [];
  }, [employeeUnavailableMap, form.employee]);

  const isFormEmployeeUnavailable = useMemo(() => {
    return currentEmployeeUnavailableDates.includes(form.date);
  }, [currentEmployeeUnavailableDates, form.date]);

  

  

  

  useEffect(() => {
    const existsInWeek = weekDates.some((item) => item.date === selectedDate);
    if (!existsInWeek) {
      setSelectedDate(weekDates[0].date);
      setCopyFromDate(weekDates[0].date);
      setForm((current) => ({
        ...current,
        date: weekDates[0].date,
      }));
    }
  }, [weekDates, selectedDate]);

  useEffect(() => {
    const selectedEmployeeStillActive = activeEmployeeNames.includes(form.employee);

    if (!selectedEmployeeStillActive && activeEmployees.length > 0) {
      setForm((current) => ({
        ...current,
        employee: activeEmployees[0].name,
        role: activeEmployees[0].defaultRole,
      }));
    }
  }, [activeEmployeeNames, activeEmployees, form.employee]);

  useEffect(() => {
    if (employeeFilter !== "All" && !employeeNames.includes(employeeFilter)) {
      setEmployeeFilter("All");
    }
  }, [employeeFilter, employeeNames]);

  useEffect(() => {
    if (!employeeNames.includes(timesheetEmployee) && employeeNames.length > 0) {
      setTimesheetEmployee(employeeNames[0]);
    }
  }, [employeeNames, timesheetEmployee]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const dateMatch = shift.date === selectedDate;
      const employeeMatch =
        employeeFilter === "All" || shift.employee === employeeFilter;
      return dateMatch && employeeMatch;
    });
  }, [shifts, selectedDate, employeeFilter]);

  const selectedDateTotals = useMemo(() => {
    const totals: Record<string, { planned: number; worked: number }> = {};
    for (const employee of employeeNames) {
      totals[employee] = { planned: 0, worked: 0 };
    }

    shifts.forEach((shift) => {
      if (shift.date !== selectedDate) return;
      if (!totals[shift.employee]) {
        totals[shift.employee] = { planned: 0, worked: 0 };
      }
      totals[shift.employee].planned += getPlannedHours(shift);
      totals[shift.employee].worked += getWorkedHours(shift);
    });

    return totals;
  }, [shifts, selectedDate, employeeNames]);

  const dayHours = useMemo(() => {
    return filteredShifts.reduce(
      (sum, shift) => sum + getPlannedHours(shift),
      0
    );
  }, [filteredShifts]);

  const dayWorkedHours = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => sum + getWorkedHours(shift), 0);
  }, [filteredShifts]);

  const weeklyOverview = useMemo(() => {
    const result: Record<string, Record<string, Shift[]>> = {};
    for (const employee of employeeNames) {
      result[employee] = {};
      for (const item of weekDates) {
        result[employee][item.date] = shifts.filter(
          (shift) => shift.employee === employee && shift.date === item.date
        );
      }
    }
    return result;
  }, [shifts, weekDates, employeeNames]);

  const weeklyTotals = useMemo(() => {
    const totals: Record<string, { planned: number; worked: number }> = {};
    for (const employee of employeeNames) {
      totals[employee] = { planned: 0, worked: 0 };
    }

    shifts.forEach((shift) => {
      const inCurrentWeek = weekDates.some((item) => item.date === shift.date);
      if (!inCurrentWeek) return;

      if (!totals[shift.employee]) {
        totals[shift.employee] = { planned: 0, worked: 0 };
      }

      totals[shift.employee].planned += getPlannedHours(shift);
      totals[shift.employee].worked += getWorkedHours(shift);
    });

    return totals;
  }, [shifts, weekDates, employeeNames]);

  const monthlyHours = useMemo(() => {
    const totals: Record<string, { planned: number; worked: number }> = {};
    for (const employee of employeeNames) {
      totals[employee] = { planned: 0, worked: 0 };
    }

    for (const shift of shifts) {
      const shiftDate = new Date(shift.date);
      const shiftMonth = shiftDate.getMonth() + 1;
      const shiftYear = shiftDate.getFullYear();

      if (shiftMonth === monthFilter && shiftYear === yearFilter) {
        if (!totals[shift.employee]) {
          totals[shift.employee] = { planned: 0, worked: 0 };
        }
        totals[shift.employee].planned += getPlannedHours(shift);
        totals[shift.employee].worked += getWorkedHours(shift);
      }
    }

    return totals;
  }, [shifts, monthFilter, yearFilter, employeeNames]);

  const payrollCosts = useMemo(() => {
    const totals: Record<string, { plannedCost: number; workedCost: number }> =
      {};
    for (const employee of employeeNames) {
      const rate = employeeRateMap[employee] || 0;
      totals[employee] = {
        plannedCost: monthlyHours[employee].planned * rate,
        workedCost: monthlyHours[employee].worked * rate,
      };
    }
    return totals;
  }, [monthlyHours, employeeRateMap, employeeNames]);

  const monthlyTotalPlanned = useMemo(() => {
    return Object.values(monthlyHours).reduce(
      (sum, item) => sum + item.planned,
      0
    );
  }, [monthlyHours]);

  const monthlyTotalWorked = useMemo(() => {
    return Object.values(monthlyHours).reduce(
      (sum, item) => sum + item.worked,
      0
    );
  }, [monthlyHours]);

  const monthlyTotalPlannedCost = useMemo(() => {
    return Object.values(payrollCosts).reduce(
      (sum, item) => sum + item.plannedCost,
      0
    );
  }, [payrollCosts]);

  const monthlyTotalWorkedCost = useMemo(() => {
    return Object.values(payrollCosts).reduce(
      (sum, item) => sum + item.workedCost,
      0
    );
  }, [payrollCosts]);

  // Employee personal stats (for employee mode)
  const myStats = useMemo(() => {
    if (!employeeName) return { planned: 0, worked: 0, approved: 0, shifts: 0 };

    let planned = 0;
    let worked = 0;
    let approved = 0;
    let shiftsCount = 0;

    shifts.forEach((shift) => {
      if (shift.employee !== employeeName) return;

      shiftsCount += 1;
      planned += getPlannedHours(shift);
      worked += getWorkedHours(shift);

      if (shift.approved) {
        approved += getWorkedHours(shift);
      }
    });

    return { planned, worked, approved, shifts: shiftsCount };
  }, [shifts, employeeName]);

  const employeePeriodRows = useMemo(() => {
    if (!employeeName) return [];

    return shifts
      .filter((shift) => {
        if (shift.employee !== employeeName) return false;
        if (employeePeriodFrom && shift.date < employeePeriodFrom) return false;
        if (employeePeriodTo && shift.date > employeePeriodTo) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [shifts, employeeName, employeePeriodFrom, employeePeriodTo]);

  const employeePeriodStats = useMemo(() => {
    return employeePeriodRows.reduce(
      (acc, shift) => {
        acc.shifts += 1;
        acc.planned += getPlannedHours(shift);
        acc.worked += getWorkedHours(shift);
        if (shift.approved) {
          acc.approved += getWorkedHours(shift);
        }
        return acc;
      },
      { shifts: 0, planned: 0, worked: 0, approved: 0 }
    );
  }, [employeePeriodRows]);

  const yearsAvailable = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    shifts.forEach((shift) => {
      years.add(new Date(shift.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [shifts, currentYear]);

  const monthCalendarDays = useMemo(() => {
    return getMonthCalendarDays(monthFilter, yearFilter);
  }, [monthFilter, yearFilter]);

  const monthGroupedWeeks = useMemo(() => {
    const groups: typeof monthCalendarDays[] = [];
    for (let i = 0; i < monthCalendarDays.length; i += 7) {
      groups.push(monthCalendarDays.slice(i, i + 7));
    }
    return groups;
  }, [monthCalendarDays]);

  const selectedTimesheetRows = useMemo(() => {
    return shifts
      .filter((shift) => {
        const d = new Date(shift.date);
        return (
          shift.employee === timesheetEmployee &&
          d.getMonth() + 1 === monthFilter &&
          d.getFullYear() === yearFilter
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts, timesheetEmployee, monthFilter, yearFilter]);

  const selectedTimesheetSummary = useMemo(() => {
    return selectedTimesheetRows.reduce(
      (acc, shift) => {
        acc.planned += getPlannedHours(shift);
        acc.worked += getWorkedHours(shift);
        return acc;
      },
      { planned: 0, worked: 0 }
    );
  }, [selectedTimesheetRows]);

  function resetForm() {
    const firstEmployee = activeEmployees[0];
    const firstEmployeeName = firstEmployee?.name || employees[0]?.name || "";

    setForm({
      employee: firstEmployeeName,
      role: firstEmployeeName ? employeeRoleMap[firstEmployeeName] || "" : "",
      start: "10:00",
      end: "15:00",
      notes: "",
      date: selectedDate,
    });
    setEditingId(null);
    setShowShiftForm(false);
    setShiftRoleMode("preset");
  }

  function isEmployeeUnavailable(employeeName: string, date: string) {
    const dates = employeeUnavailableMap[employeeName] || [];
    return dates.includes(date);
  }

  async function saveShift() {
    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
      return;
    }

    if (activeEmployees.length === 0) {
      alert("Please add at least one active employee first.");
      return;
    }

    if (!form.start || !form.end) {
      alert("Please enter start and end time.");
      return;
    }

    if (!form.date) {
      alert("Please choose a date.");
      return;
    }

    const selectedEmployee = employees.find(
      (employee) => employee.name === form.employee
    );

    if (!selectedEmployee || !selectedEmployee.active) {
      alert("This employee is inactive. Please choose an active employee.");
      return;
    }

    if (isEmployeeUnavailable(form.employee, form.date)) {
      alert(
        `${form.employee} is marked as unavailable on ${form.date}. Please choose another date or remove the unavailable day first.`
      );
      return;
    }

    const finalRole = form.role.trim();

    if (!finalRole) {
      alert("Please enter a role.");
      return;
    }

    const hasConflict = shifts.some((shift) => {
      if (editingId !== null && shift.id === editingId) return false;

      return (
        shift.employee === form.employee &&
        shift.date === form.date &&
        isOverlap(shift.start, shift.end, form.start, form.end)
      );
    });

    if (hasConflict) {
      alert("This employee already has an overlapping shift on this date.");
      return;
    }

    const dayName = getDayNameFromDate(form.date);

    const payload = {
      company_id: activeCompanyId,
      employee: form.employee,
      date: form.date,
      start: form.start,
      end: form.end,
      role: finalRole,
      notes: form.notes || null,
    };

    if (editingId !== null) {
      const { data, error } = await supabase
        .from("shifts")
        .update(payload)
        .eq("id", editingId)
        .eq("company_id", activeCompanyId)
        .select()
        .single();

      if (error) {
        alert(`Could not update shift: ${error.message}`);
        return;
      }

      const updatedShift: Shift = {
        id: data.id,
        employee: data.employee,
        date: data.date,
        start: data.start,
        end: data.end,
        role: data.role,
        notes: data.notes || "",
        day: dayName,
        actualStart: data.actual_start || undefined,
        actualEnd: data.actual_end || undefined,
        approved: data.approved ?? false,
      };

      setShifts((current) =>
        current.map((shift) => (shift.id === editingId ? updatedShift : shift))
      );
    } else {
      const { data, error } = await supabase
        .from("shifts")
        .insert(payload)
        .select()
        .single();

      if (error) {
        alert(`Could not save shift: ${error.message}`);
        return;
      }

      const newShift: Shift = {
        id: data.id,
        employee: data.employee,
        date: data.date,
        start: data.start,
        end: data.end,
        role: data.role,
        notes: data.notes || "",
        day: dayName,
        actualStart: data.actual_start || undefined,
        actualEnd: data.actual_end || undefined,
        approved: data.approved ?? false,
      };

      setShifts((current) => [...current, newShift]);
    }

    resetForm();
  }

  function startEdit(shift: Shift) {
    setShowShiftForm(true);
    setActiveTab("schedule");
    setEditingId(shift.id);
    setForm({
      employee: shift.employee,
      role: shift.role,
      start: shift.start,
      end: shift.end,
      notes: shift.notes,
      date: shift.date,
    });
    setShiftRoleMode(roleSuggestions.includes(shift.role) ? "preset" : "custom");
    setSelectedDate(shift.date);
    setWeekStart(startOfWeek(fromDateInputValue(shift.date)));
  }

  async function deleteShift(id: string) {
    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("id", id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(`Could not delete shift: ${error.message}`);
      return;
    }

    setShifts((current) => current.filter((shift) => shift.id !== id));
    if (editingId === id) resetForm();
  }

  function copyDayShifts() {
    const sourceShifts = shifts.filter((shift) => shift.date === copyFromDate);

    if (sourceShifts.length === 0) {
      alert("No shifts to copy from that date.");
      return;
    }

    const inactiveEmployees = sourceShifts
      .filter(
        (shift) =>
          !employees.find(
            (employee) => employee.name === shift.employee && employee.active
          )
      )
      .map((shift) => shift.employee);

    if (inactiveEmployees.length > 0) {
      const uniqueInactiveEmployees = Array.from(new Set(inactiveEmployees));
      alert(
        `Cannot copy because these employees are inactive: ${uniqueInactiveEmployees.join(
          ", "
        )}`
      );
      return;
    }

    const unavailableEmployees = sourceShifts
      .filter((shift) => isEmployeeUnavailable(shift.employee, selectedDate))
      .map((shift) => shift.employee);

    if (unavailableEmployees.length > 0) {
      const uniqueUnavailableEmployees = Array.from(
        new Set(unavailableEmployees)
      );
      alert(
        `Cannot copy because these employees are unavailable on ${selectedDate}: ${uniqueUnavailableEmployees.join(
          ", "
        )}`
      );
      return;
    }

    const conflictingEmployees = sourceShifts
      .filter((sourceShift) =>
        shifts.some(
          (existingShift) =>
            existingShift.employee === sourceShift.employee &&
            existingShift.date === selectedDate &&
            isOverlap(
              existingShift.start,
              existingShift.end,
              sourceShift.start,
              sourceShift.end
            )
        )
      )
      .map((shift) => shift.employee);

    if (conflictingEmployees.length > 0) {
      const uniqueConflictingEmployees = Array.from(
        new Set(conflictingEmployees)
      );
      alert(
        `Cannot copy because overlapping shifts already exist on ${selectedDate} for: ${uniqueConflictingEmployees.join(
          ", "
        )}`
      );
      return;
    }

    const copied = sourceShifts.map((shift) => ({
      ...shift,
      id: crypto.randomUUID(),
      date: selectedDate,
      day: getDayNameFromDate(selectedDate),
      actualStart: undefined,
      actualEnd: undefined,
    }));

    setShifts((current) => [...current, ...copied]);
  }

  async function clearSelectedDay() {
    const ok = window.confirm(
      `Delete all shifts for ${selectedDayName} (${selectedDate})?`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("date", selectedDate)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(`Could not clear shifts: ${error.message}`);
      return;
    }

    setShifts((current) =>
      current.filter((shift) => shift.date !== selectedDate)
    );
  }

  async function setShiftApproval(id: string, approved: boolean) {
    const { data, error } = await supabase
      .from("shifts")
      .update({ approved })
      .eq("id", id)
      .eq("company_id", activeCompanyId)
      .select()
      .single();

    if (error) throw error;

    setShifts((current) =>
      current.map((shift) =>
        shift.id === id
          ? {
              ...shift,
              actualStart: data.actual_start || undefined,
              actualEnd: data.actual_end || undefined,
              approved: data.approved ?? false,
            }
          : shift
      )
    );
  }

  async function applyPlannedAsActual(shiftId: string) {
    const targetShift = shifts.find((shift) => shift.id === shiftId);

    if (!targetShift) {
      alert("Shift not found.");
      return;
    }

    try {
      await updateShiftActualTimes(
        shiftId,
        roundTime(targetShift.start),
        roundTime(targetShift.end)
      );
      await setShiftApproval(shiftId, true);
    } catch (error: any) {
      alert(`Could not approve shift as planned: ${error.message}`);
    }
  }

  async function applyPlannedToAllSelectedDay() {
    const selectedDayShifts = shifts.filter((shift) => shift.date === selectedDate);

    if (selectedDayShifts.length === 0) {
      alert("No shifts found on selected day.");
      return;
    }

    try {
      await Promise.all(
        selectedDayShifts.map(async (shift) => {
          await updateShiftActualTimes(
            shift.id,
            roundTime(shift.start),
            roundTime(shift.end)
          );
          await setShiftApproval(shift.id, true);
        })
      );
    } catch (error: any) {
      alert(`Could not approve all shifts for this day: ${error.message}`);
    }
  }

  function goToPreviousWeek() {
    const newWeekStart = addDays(weekStart, -7);
    const newWeekDates = getWeekDates(newWeekStart);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekDates[0].date);
    setCopyFromDate(newWeekDates[0].date);
    setForm((current) => ({ ...current, date: newWeekDates[0].date }));
  }

  function goToNextWeek() {
    const newWeekStart = addDays(weekStart, 7);
    const newWeekDates = getWeekDates(newWeekStart);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekDates[0].date);
    setCopyFromDate(newWeekDates[0].date);
    setForm((current) => ({ ...current, date: newWeekDates[0].date }));
  }

  function goToThisWeek() {
    const newWeekStart = startOfWeek(new Date());
    const newWeekDates = getWeekDates(newWeekStart);
    setWeekStart(newWeekStart);
    setSelectedDate(todayDate);
    setCopyFromDate(newWeekDates[0].date);
    setForm((current) => ({ ...current, date: todayDate }));
  }

  async function updateEmployeeRate(name: string, newRate: number) {
    const emp = employees.find((e: any) => e.name === name);
    if (!emp) return;

    const safeRate = Number.isNaN(newRate) ? 0 : newRate;

    const { error } = await supabase
      .from("employees")
      .update({ hourly_rate: safeRate })
      .eq("id", emp.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current: any[]) =>
      current.map((employee) =>
        employee.name === name ? { ...employee, hourlyRate: safeRate } : employee
      )
    );
  }

  async function updateEmployeeRole(name: string, newRole: string) {
    const emp = employees.find((e: any) => e.name === name);
    if (!emp) return;

    const trimmedRole = newRole.trim() || "Kitchen";

    const { error } = await supabase
      .from("employees")
      .update({ default_role: trimmedRole })
      .eq("id", emp.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current: any[]) =>
      current.map((employee) =>
        employee.name === name ? { ...employee, defaultRole: trimmedRole } : employee
      )
    );

    if (form.employee === name) {
      setForm((current) => ({ ...current, role: trimmedRole }));
    }
  }

  function updateEmployeeName(oldName: string, newName: string) {
    const trimmed = newName.trim();

    if (!trimmed) {
      alert("Employee name cannot be empty.");
      return;
    }

    const nameExists = employees.some(
      (employee) =>
        employee.name.toLowerCase() === trimmed.toLowerCase() &&
        employee.name !== oldName
    );

    if (nameExists) {
      alert("An employee with this name already exists.");
      return;
    }

    setEmployees((current) =>
      current.map((employee) =>
        employee.name === oldName ? { ...employee, name: trimmed } : employee
      )
    );

    setShifts((current) =>
      current.map((shift) =>
        shift.employee === oldName ? { ...shift, employee: trimmed } : shift
      )
    );

    if (form.employee === oldName) {
      setForm((current) => ({ ...current, employee: trimmed }));
    }

    if (employeeFilter === oldName) {
      setEmployeeFilter(trimmed);
    }

    if (timesheetEmployee === oldName) {
      setTimesheetEmployee(trimmed);
    }
  }

  function setEmployeeActiveStatus(name: string, active: boolean) {
    const employee = employees.find((item) => item.name === name);
    if (!employee) return;

    if (!active) {
      const activeCount = employees.filter((item) => item.active).length;

      if (employee.active && activeCount === 1) {
        alert("You must keep at least one active employee.");
        return;
      }

      if (form.employee === name) {
        const replacement = sortEmployeesForDisplay(
          employees.filter((item) => item.active && item.name !== name)
        )[0];

        if (replacement) {
          setForm((current) => ({
            ...current,
            employee: replacement.name,
            role: replacement.defaultRole,
          }));
        }
      }
    }

    setEmployees((current) =>
      current.map((item) => (item.name === name ? { ...item, active } : item))
    );
  }

  async function deleteEmployee(name: string) {
    const employee = employees.find((item: any) => item.name === name);
    if (!employee) return;

    const hasShifts = shifts.some((shift) => shift.employee === name);
    if (hasShifts) {
      alert(
        "This employee has shift history, so permanent delete is blocked. Set the employee inactive instead."
      );
      return;
    }

    const activeCount = employees.filter((item) => item.active).length;
    if (employee.active && activeCount === 1) {
      alert("You must keep at least one active employee.");
      return;
    }

    const ok = window.confirm(
      `Delete employee \"${name}\" permanently? This cannot be undone.`
    );
    if (!ok) return;

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", employee.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current: any[]) =>
      current.filter((employeeItem) => employeeItem.name !== name)
    );

    if (form.employee === name) {
      const replacement = sortEmployeesForDisplay(
        employees.filter((item) => item.name !== name && item.active)
      )[0];

      if (replacement) {
        setForm((current) => ({
          ...current,
          employee: replacement.name,
          role: replacement.defaultRole,
        }));
      }
    }

    if (employeeFilter === name) {
      setEmployeeFilter("All");
    }

    if (timesheetEmployee === name) {
      const replacement = sortEmployeesForDisplay(
        employees.filter((item) => item.name !== name)
      )[0];
      if (replacement) {
        setTimesheetEmployee(replacement.name);
      }
    }
  }

  function handleEmployeeChange(name: string) {
    const nextRole = employeeRoleMap[name] || "Kitchen";

    setForm((current) => ({
      ...current,
      employee: name,
      role: nextRole,
    }));
    setShiftRoleMode(roleSuggestions.includes(nextRole) ? "preset" : "custom");
  }

  function updateAvailabilityDraft(name: string, value: string) {
    setAvailabilityDrafts((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function addUnavailableDate(name: string) {
    const dateToAdd = availabilityDrafts[name];

    if (!dateToAdd) {
      alert("Please choose a date first.");
      return;
    }

    setEmployees((current) =>
      current.map((employee) => {
        if (employee.name !== name) return employee;
        if (employee.unavailableDates.includes(dateToAdd)) return employee;

        return {
          ...employee,
          unavailableDates: [...employee.unavailableDates, dateToAdd].sort(),
        };
      })
    );

    setAvailabilityDrafts((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function removeUnavailableDate(name: string, dateToRemove: string) {
    setEmployees((current) =>
      current.map((employee) =>
        employee.name === name
          ? {
              ...employee,
              unavailableDates: employee.unavailableDates.filter(
                (date) => date !== dateToRemove
              ),
            }
          : employee
      )
    );
  }

  async function addEmployee() {
    const trimmedName = newEmployeeForm.name.trim();
    const hourlyRate = Number(newEmployeeForm.hourlyRate);
    const trimmedRole = newEmployeeForm.defaultRole.trim() || "Service";

    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
      return;
    }

    if (!trimmedName) {
      alert("Please enter employee name.");
      return;
    }

    const exists = employees.some(
      (employee) => employee.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      alert("Employee name already exists.");
      return;
    }

    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      alert("Please enter a valid hourly rate.");
      return;
    }

    const response = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId: activeCompanyId,
        name: trimmedName,
        hourlyRate,
        defaultRole: trimmedRole,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result?.employee) {
      alert(result?.error || "Could not add employee.");
      return;
    }
    const data = result.employee;

    const newEmployee: any = {
      id: data.id,
      name: data.name,
      hourlyRate: data.hourly_rate,
      defaultRole: data.default_role,
      unavailableDates: data.unavailable_dates || [],
      active: data.active,
    };

    setEmployees((current: any[]) => [...current, newEmployee]);

    if (activeEmployees.length === 0) {
      setForm((current) => ({
        ...current,
        employee: trimmedName,
        role: newEmployee.defaultRole,
      }));
    }

    if (employeeNames.length === 0) {
      setTimesheetEmployee(trimmedName);
    }

    setNewEmployeeForm(defaultNewEmployeeForm);
    setNewEmployeeRoleMode("preset");
  }

  async function punchIn(id: string) {
    const now = getCurrentTimeString();
    const rounded = roundTime(now);

    const { data, error } = await supabase
      .from("shifts")
      .update({ actual_start: rounded, actual_end: null, approved: false })
      .eq("id", id)
      .eq("company_id", activeCompanyId)
      .select()
      .single();

    if (error) {
      alert(`Could not punch in: ${error.message}`);
      return;
    }

    setShifts((current) =>
      current.map((shift) =>
        shift.id === id
          ? {
              ...shift,
              actualStart: data.actual_start || undefined,
              actualEnd: data.actual_end || undefined,
              approved: data.approved ?? false,
            }
          : shift
      )
    );
  }

  async function punchOut(id: string) {
    const now = getCurrentTimeString();
    const targetShift = shifts.find((shift) => shift.id === id);
    const roundedNow = roundTime(now);

    if (!targetShift?.actualStart) {
      alert("Please punch in first.");
      return;
    }

    const { data, error } = await supabase
      .from("shifts")
      .update({ actual_end: roundedNow, approved: false })
      .eq("id", id)
      .eq("company_id", activeCompanyId)
      .select()
      .single();

    if (error) {
      alert(`Could not punch out: ${error.message}`);
      return;
    }

    setShifts((current) =>
      current.map((shift) =>
        shift.id === id
          ? {
              ...shift,
              actualStart: data.actual_start || undefined,
              actualEnd: data.actual_end || undefined,
              approved: data.approved ?? false,
            }
          : shift
      )
    );
  }

  async function updateShiftActualTimes(
    id: string,
    actualStart: string | null,
    actualEnd: string | null
  ) {
    const { data, error } = await supabase
      .from("shifts")
      .update({
        actual_start: actualStart,
        actual_end: actualEnd,
        approved: false,
      })
      .eq("id", id)
      .eq("company_id", activeCompanyId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setShifts((current) =>
      current.map((shift) =>
        shift.id === id
          ? {
              ...shift,
              actualStart: data.actual_start || undefined,
              actualEnd: data.actual_end || undefined,
              approved: data.approved ?? false,
            }
          : shift
      )
    );

    return data;
  }

  async function resetPunch(id: string) {
    try {
      await updateShiftActualTimes(id, null, null);
    } catch (error: any) {
      alert(`Could not reset actual times: ${error.message}`);
    }
  }

  function goToDate(date: string) {
    setSelectedDate(date);
    setWeekStart(startOfWeek(fromDateInputValue(date)));
    setForm((current) => ({ ...current, date }));
    setActiveTab("schedule");
  }

  function downloadPayrollCsv() {
    const rows = [
      ["Company", workspaceName],
      ["CVR", workspaceCvr],
      ["Month", monthNames[monthFilter]],
      ["Year", String(yearFilter)],
      [],
      [
        "Employee",
        "Month",
        "Year",
        "Planned Hours",
        "Worked Hours",
        "Rate DKK",
        "Planned Cost DKK",
        "Worked Cost DKK",
      ],
      ...employeeNames.map((employee) => [
        employee,
        monthNames[monthFilter],
        String(yearFilter),
        monthlyHours[employee].planned.toFixed(1),
        monthlyHours[employee].worked.toFixed(1),
        String(employeeRateMap[employee] || 0),
        payrollCosts[employee].plannedCost.toFixed(2),
        payrollCosts[employee].workedCost.toFixed(2),
      ]),
      [],
      [
        "Totals",
        "",
        "",
        monthlyTotalPlanned.toFixed(1),
        monthlyTotalWorked.toFixed(1),
        "",
        monthlyTotalPlannedCost.toFixed(2),
        monthlyTotalWorkedCost.toFixed(2),
      ],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${workspaceName.replace(/\s+/g, "-").toLowerCase()}-${monthNames[
        monthFilter].toLowerCase()}-${yearFilter}-payroll.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadPayrollPdf() {
    const reportHtml = `
      <html>
        <head>
          <title>Payroll Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1, p { margin: 0 0 10px 0; }
            .header { margin-bottom: 24px; }
            .summary { margin: 20px 0; padding: 16px; border: 1px solid #d1d5db; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background: #f3f4f6; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${workspaceName}</h1>
            <p>CVR: ${workspaceCvr}</p>
            <p>Payroll Report for ${monthNames[monthFilter]} ${yearFilter}</p>
          </div>

          <div class="summary">
            <p><strong>Total Planned Hours:</strong> ${monthlyTotalPlanned.toFixed(
              1
            )} hrs</p>
            <p><strong>Total Worked Hours:</strong> ${monthlyTotalWorked.toFixed(
              1
            )} hrs</p>
            <p><strong>Planned Payroll Cost:</strong> ${formatDKK(
              monthlyTotalPlannedCost
            )}</p>
            <p><strong>Worked Payroll Cost:</strong> ${formatDKK(
              monthlyTotalWorkedCost
            )}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Planned Hours</th>
                <th>Worked Hours</th>
                <th>Rate (DKK/hr)</th>
                <th>Planned Cost</th>
                <th>Worked Cost</th>
              </tr>
            </thead>
            <tbody>
              ${employeeNames
                .map(
                  (employee) => `
                <tr>
                  <td>${employee}</td>
                  <td>${monthlyHours[employee].planned.toFixed(1)}</td>
                  <td>${monthlyHours[employee].worked.toFixed(1)}</td>
                  <td>${employeeRateMap[employee] || 0}</td>
                  <td>${payrollCosts[employee].plannedCost.toFixed(2)}</td>
                  <td>${payrollCosts[employee].workedCost.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <p class="total">Generated for ${workspaceName}</p>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups to export PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  function downloadMyPeriodTimesheetCsv() {
    if (!employeeName) {
      alert("No employee account found.");
      return;
    }

    const rows = [
      ["Company", workspaceName],
      ["CVR", workspaceCvr],
      ["Employee", employeeName],
      ["From", employeePeriodFrom || ""],
      ["To", employeePeriodTo || ""],
      [],
      [
        "Date",
        "Day",
        "Role",
        "Planned Start",
        "Planned End",
        "Planned Hours",
        "Actual In",
        "Actual Out",
        "Worked Hours",
        "Approved",
        "Notes",
      ],
      ...employeePeriodRows.map((shift) => [
        shift.date,
        shift.day,
        shift.role,
        shift.start,
        shift.end,
        getPlannedHours(shift).toFixed(1),
        shift.actualStart || "",
        shift.actualEnd || "",
        getWorkedHours(shift).toFixed(1),
        shift.approved ? "Yes" : "No",
        (shift.notes || "").split(",").join(";"),
      ]),
      [],
      [
        "Totals",
        "",
        "",
        "",
        "",
        employeePeriodStats.planned.toFixed(1),
        "",
        "",
        employeePeriodStats.worked.toFixed(1),
        employeePeriodStats.approved.toFixed(1),
        "",
      ],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const safeEmployee = employeeName.split(" ").join("-").toLowerCase();
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      safeEmployee + "-" + (employeePeriodFrom || "from") + "-" + (employeePeriodTo || "to") + "-timesheet.csv"
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadMyPeriodTimesheetPdf() {
    if (!employeeName) {
      alert("No employee account found.");
      return;
    }

    const employeeRate = employeeRateMap[employeeName] || 0;
    const approvedPayrollEstimate = employeePeriodStats.approved * employeeRate;

    const rowsHtml = employeePeriodRows.length === 0
      ? '<tr><td colspan="10">No shifts found for this period.</td></tr>'
      : employeePeriodRows
          .map(
            (shift) =>
              '<tr>' +
              '<td>' + shift.date + '</td>' +
              '<td>' + shift.day + '</td>' +
              '<td>' + shift.role + '</td>' +
              '<td>' + shift.start + ' - ' + shift.end + '</td>' +
              '<td>' + getPlannedHours(shift).toFixed(1) + '</td>' +
              '<td>' + (shift.actualStart || '—') + '</td>' +
              '<td>' + (shift.actualEnd || '—') + '</td>' +
              '<td>' + getWorkedHours(shift).toFixed(1) + '</td>' +
              '<td>' + (shift.approved ? 'Yes' : 'No') + '</td>' +
              '<td>' + (shift.notes || '') + '</td>' +
              '</tr>'
          )
          .join('');

    const reportHtml =
      '<html><head><title>Employee Period Timesheet</title><style>' +
      'body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }' +
      'h1, h2, p { margin: 0 0 10px 0; }' +
      '.header { margin-bottom: 24px; }' +
      '.summary { margin: 20px 0; padding: 16px; border: 1px solid #d1d5db; border-radius: 12px; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 16px; }' +
      'th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }' +
      'th { background: #f3f4f6; }' +
      '.footer { margin-top: 24px; }' +
      '</style></head><body>' +
      '<div class="header">' +
      '<h1>' + workspaceName + '</h1>' +
      '<p>CVR: ' + workspaceCvr + '</p>' +
      '<p>Employee Period Timesheet</p>' +
      '<p><strong>Employee:</strong> ' + employeeName + '</p>' +
      '<p><strong>Period:</strong> ' + (employeePeriodFrom || '—') + ' to ' + (employeePeriodTo || '—') + '</p>' +
      '</div>' +
      '<div class="summary">' +
      '<p><strong>Total Planned Hours:</strong> ' + employeePeriodStats.planned.toFixed(1) + ' hrs</p>' +
      '<p><strong>Total Worked Hours:</strong> ' + employeePeriodStats.worked.toFixed(1) + ' hrs</p>' +
      '<p><strong>Total Approved Hours:</strong> ' + employeePeriodStats.approved.toFixed(1) + ' hrs</p>' +
      '<p><strong>Approved Payroll Estimate:</strong> ' + formatDKK(approvedPayrollEstimate) + '</p>' +
      '</div>' +
      '<table><thead><tr><th>Date</th><th>Day</th><th>Role</th><th>Planned</th><th>Planned Hours</th><th>Actual In</th><th>Actual Out</th><th>Worked Hours</th><th>Approved</th><th>Notes</th></tr></thead><tbody>' +
      rowsHtml +
      '</tbody></table>' +
      '<div class="footer"><p><strong>Prepared by:</strong> ' + workspaceName + '</p><p><strong>Signature:</strong> ________________________________</p></div>' +
      '</body></html>';

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups to export PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  function downloadEmployeeTimesheetCsv() {
    if (!timesheetEmployee) {
      alert("Please select an employee.");
      return;
    }

    const rows = [
      ["Company", workspaceName],
      ["CVR", workspaceCvr],
      ["Employee", timesheetEmployee],
      ["Month", monthNames[monthFilter]],
      ["Year", String(yearFilter)],
      [],
      [
        "Date",
        "Day",
        "Role",
        "Planned Start",
        "Planned End",
        "Planned Hours",
        "Actual In",
        "Actual Out",
        "Worked Hours",
        "Notes",
      ],
      ...selectedTimesheetRows.map((shift) => [
        shift.date,
        shift.day,
        shift.role,
        shift.start,
        shift.end,
        getPlannedHours(shift).toFixed(1),
        shift.actualStart || "",
        shift.actualEnd || "",
        getWorkedHours(shift).toFixed(1),
        shift.notes.replace(/,/g, ";"),
      ]),
      [],
      [
        "Totals",
        "",
        "",
        "",
        "",
        selectedTimesheetSummary.planned.toFixed(1),
        "",
        "",
        selectedTimesheetSummary.worked.toFixed(1),
        "",
      ],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const safeEmployee = timesheetEmployee.replace(/\s+/g, "-").toLowerCase();
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${safeEmployee}-${monthNames[monthFilter].toLowerCase()}-${yearFilter}-timesheet.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadEmployeeTimesheetPdf() {
    if (!timesheetEmployee) {
      alert("Please select an employee.");
      return;
    }

    const employeeRate = employeeRateMap[timesheetEmployee] || 0;
    const workedCost = selectedTimesheetSummary.worked * employeeRate;

    const reportHtml = `
      <html>
        <head>
          <title>Employee Timesheet</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1, h2, p { margin: 0 0 10px 0; }
            .header { margin-bottom: 24px; }
            .summary { margin: 20px 0; padding: 16px; border: 1px solid #d1d5db; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f3f4f6; }
            .footer { margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${workspaceName}</h1>
            <p>CVR: ${workspaceCvr}</p>
            <p>Employee Timesheet</p>
            <p><strong>Employee:</strong> ${timesheetEmployee}</p>
            <p><strong>Period:</strong> ${monthNames[monthFilter]} ${yearFilter}</p>
          </div>

          <div class="summary">
            <p><strong>Total Planned Hours:</strong> ${selectedTimesheetSummary.planned.toFixed(
              1
            )} hrs</p>
            <p><strong>Total Worked Hours:</strong> ${selectedTimesheetSummary.worked.toFixed(
              1
            )} hrs</p>
            <p><strong>Hourly Rate:</strong> ${employeeRate.toFixed(2)} DKK</p>
            <p><strong>Worked Payroll Estimate:</strong> ${formatDKK(
              workedCost
            )}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Role</th>
                <th>Planned</th>
                <th>Planned Hours</th>
                <th>Actual In</th>
                <th>Actual Out</th>
                <th>Worked Hours</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${
                selectedTimesheetRows.length === 0
                  ? `<tr><td colspan="9">No shifts found for this period.</td></tr>`
                  : selectedTimesheetRows
                      .map(
                        (shift) => `
                  <tr>
                    <td>${shift.date}</td>
                    <td>${shift.day}</td>
                    <td>${shift.role}</td>
                    <td>${shift.start} - ${shift.end}</td>
                    <td>${getPlannedHours(shift).toFixed(1)}</td>
                    <td>${shift.actualStart || "—"}</td>
                    <td>${shift.actualEnd || "—"}</td>
                    <td>${getWorkedHours(shift).toFixed(1)}</td>
                    <td>${shift.notes || ""}</td>
                  </tr>
                `
                      )
                      .join("")
              }
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Prepared by:</strong> ${workspaceName}</p>
            <p><strong>Signature:</strong> ________________________________</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups to export PDF.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <datalist id="role-suggestions">
        {roleSuggestions.map((role) => (
          <option key={role} value={role} />
        ))}
      </datalist>
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Planyo • Workspace Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {workspaceName}
              </h1>
              <p className="mt-2 text-slate-400">
                Staff Scheduler{workspaceCvr ? ` • CVR: ${workspaceCvr}` : ""}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 ring-1 ring-white/10">
                  {normalizedRole}
                </span>
                {employeeName ? (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300 ring-1 ring-white/10">
                    Signed in as {employeeName}
                  </span>
                ) : null}
              </div>

              <div className="mt-3">
                {normalizedRole === "owner" ? (
                  <Link
                    href="/invites"
                    className="mr-2 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Invite employees
                  </Link>
                ) : null}
                <button
    onClick={handleLogout}
    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
             >
                Logout
              </button>
            </div>



            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 md:w-[660px]">
              {isAdmin ? (
                <>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Total Shifts</p>
                    <p className="mt-1 text-2xl font-bold">{shifts.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">{selectedDayName} Planned</p>
                    <p className="mt-1 text-2xl font-bold">{dayHours.toFixed(1)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">{selectedDayName} Actual</p>
                    <p className="mt-1 text-2xl font-bold">{dayWorkedHours.toFixed(1)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Active Employees</p>
                    <p className="mt-1 text-2xl font-bold">{activeEmployees.length}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">My Shifts</p>
                    <p className="mt-1 text-2xl font-bold">{myStats.shifts}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Planned Hours</p>
                    <p className="mt-1 text-2xl font-bold">{myStats.planned.toFixed(1)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Approved Hours</p>
                    <p className="mt-1 text-2xl font-bold">{myStats.approved.toFixed(1)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <p className="text-sm text-slate-300">Worked Hours</p>
                    <p className="mt-1 text-2xl font-bold">{myStats.worked.toFixed(1)}</p>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>

        {!isAdmin && employeeName ? (
          <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">My period summary</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review your own shifts, approved hours, and download your timesheet.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="text-sm text-slate-600">
                  <span className="mb-1 block font-medium">From</span>
                  <input
                    type="date"
                    value={employeePeriodFrom}
                    onChange={(e) => setEmployeePeriodFrom(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-600">
                  <span className="mb-1 block font-medium">To</span>
                  <input
                    type="date"
                    value={employeePeriodTo}
                    onChange={(e) => setEmployeePeriodTo(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Period Shifts</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{employeePeriodStats.shifts}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Period Planned</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{employeePeriodStats.planned.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Period Approved</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{employeePeriodStats.approved.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Period Worked</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">{employeePeriodStats.worked.toFixed(1)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={downloadMyPeriodTimesheetCsv}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Download My Timesheet CSV
              </button>
              <button
                onClick={downloadMyPeriodTimesheetPdf}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Download My Timesheet PDF
              </button>
            </div>
          </div>
        ) : null}

        {/* TOP NAVIGATION TABS */}
        <div className="mb-4 flex flex-wrap gap-2">
          {[
  { key: "schedule", label: "Schedule" },
  { key: "week", label: "Week View" },
  { key: "month", label: "Month View" },
  ...(isAdmin
    ? [
        { key: "payroll", label: "Payroll" },
        { key: "employees", label: "Employees" },
      ]
    : []),
].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AppTab)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? " bg-slate-900 text-white"
                  : " bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "schedule" && (
        <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm">
          <WeekNavigator
            weekStart={weekStart}
            goPrev={goToPreviousWeek}
            goNext={goToNextWeek}
            goToday={goToThisWeek}
            setWeekStart={setWeekStart}
            setSelectedDate={setSelectedDate}
            setCopyFromDate={setCopyFromDate}
            setForm={setForm}
          />
        </div>
        )}

        {activeTab === "schedule" && (
  <ScheduleSection
    weekDates={weekDates}
    shifts={shifts}
    employees={employees}
    selectedDate={selectedDate}
    setSelectedDate={setSelectedDate}
    setForm={setForm}
    setOpenMenuId={setOpenMenuId}
    selectedDayName={selectedDayName}
    filteredShifts={filteredShifts}
    employeeFilter={employeeFilter}
    setEmployeeFilter={setEmployeeFilter}
    employeeNames={employeeNames}
    setEditingId={setEditingId}
    employeeRoleMap={employeeRoleMap}
    currentEmployeeUnavailableDates={currentEmployeeUnavailableDates}
    setShiftRoleMode={setShiftRoleMode}
    setShowShiftForm={setShowShiftForm}
    showShiftForm={showShiftForm}
    applyPlannedToAllSelectedDay={applyPlannedToAllSelectedDay}
    clearSelectedDay={clearSelectedDay}
    dayHours={dayHours}
    dayWorkedHours={dayWorkedHours}
    activeEmployees={activeEmployees}
    editingId={editingId}
    resetForm={resetForm}
    activeEmployeeNames={activeEmployeeNames}
    form={form}
    handleEmployeeChange={handleEmployeeChange}
    roleSuggestions={roleSuggestions}
    CUSTOM_ROLE_OPTION={CUSTOM_ROLE_OPTION}
    isFormEmployeeUnavailable={isFormEmployeeUnavailable}
    saveShift={saveShift}
    monthNames={monthNames}
    copyFromDate={copyFromDate}
    setCopyFromDate={setCopyFromDate}
    copyDayShifts={copyDayShifts}
    employeesUnavailableOnSelectedDate={employees
      .filter((employee) => employee.unavailableDates.includes(selectedDate))
      .map((employee) => employee.name)}
    openMenuId={openMenuId}
    punchIn={punchIn}
    punchOut={punchOut}
    normalizeManualTimeInput={normalizeManualTimeInput}
    isValidFullTime={isValidFullTime}
    roundTime={roundTime}
    setShifts={setShifts}
    updateShiftActualTimes={updateShiftActualTimes}
    setShiftApproval={setShiftApproval}
    applyPlannedAsActual={applyPlannedAsActual}
    startEdit={startEdit}
    deleteShift={deleteShift}
    resetPunch={resetPunch}
    roleStyles={roleStyles}
    getPlannedHours={getPlannedHours}
    getWorkedHours={getWorkedHours}
    isAdmin={isAdmin}
    employeeName={employeeName}
  />
)}
            
          
{activeTab === "week" && (
  <WeekSection
    weekDates={weekDates}
    employeeNames={employeeNames}
    employees={employees}
    weeklyOverview={weeklyOverview}
    isEmployeeUnavailable={isEmployeeUnavailable}
    getPlannedHours={getPlannedHours}
    getWorkedHours={getWorkedHours}
    roleStyles={roleStyles}
    weeklyTotals={weeklyTotals}
    employeeName={employeeName}
  />
)}
            
          
        {activeTab === "month" && (
  <MonthSection
    monthFilter={monthFilter}
    setMonthFilter={setMonthFilter}
    yearFilter={yearFilter}
    setYearFilter={setYearFilter}
    yearsAvailable={yearsAvailable}
    monthlyTotalPlanned={monthlyTotalPlanned}
    monthlyTotalWorked={monthlyTotalWorked}
    shifts={shifts}
    monthGroupedWeeks={monthGroupedWeeks}
    getPlannedHours={getPlannedHours}
    getWorkedHours={getWorkedHours}
    roleStyles={roleStyles}
    goToDate={goToDate}
    employeeNames={employeeNames}
    employees={employees}
    monthlyHours={monthlyHours}
    formatHours={formatHours}
    employeeName={employeeName}
  />
)}
            
        {isAdmin && activeTab === "payroll" && (
  <PayrollSection
    monthFilter={monthFilter}
    setMonthFilter={setMonthFilter}
    yearFilter={yearFilter}
    setYearFilter={setYearFilter}
    yearsAvailable={yearsAvailable}
    downloadPayrollCsv={downloadPayrollCsv}
    downloadPayrollPdf={downloadPayrollPdf}
    COMPANY_NAME={workspaceName}
    COMPANY_CVR={workspaceCvr}
    monthlyTotalPlanned={monthlyTotalPlanned}
    monthlyTotalWorked={monthlyTotalWorked}
    monthlyTotalPlannedCost={monthlyTotalPlannedCost}
    monthlyTotalWorkedCost={monthlyTotalWorkedCost}
    formatDKK={formatDKK}
    employeeNames={employeeNames}
    employees={employees}
    monthlyHours={monthlyHours}
    employeeRateMap={employeeRateMap}
    payrollCosts={payrollCosts}
    timesheetEmployee={timesheetEmployee}
    setTimesheetEmployee={setTimesheetEmployee}
    downloadEmployeeTimesheetCsv={downloadEmployeeTimesheetCsv}
    downloadEmployeeTimesheetPdf={downloadEmployeeTimesheetPdf}
    selectedTimesheetRows={selectedTimesheetRows}
    selectedTimesheetSummary={selectedTimesheetSummary}
    getPlannedHours={getPlannedHours}
    getWorkedHours={getWorkedHours}
    monthNames={monthNames}
  />
)}
              
          
       {isAdmin && activeTab === "employees" && (
  <EmployeesSection
    sortedEmployeesData={sortedEmployeesData}
    newEmployeeForm={newEmployeeForm}
    setNewEmployeeForm={setNewEmployeeForm}
    newEmployeeRoleMode={newEmployeeRoleMode}
    setNewEmployeeRoleMode={setNewEmployeeRoleMode}
    roleSuggestions={roleSuggestions}
    CUSTOM_ROLE_OPTION={CUSTOM_ROLE_OPTION}
    addEmployee={addEmployee}
    setEmployeeActiveStatus={setEmployeeActiveStatus}
    deleteEmployee={deleteEmployee}
    updateEmployeeName={updateEmployeeName}
    updateEmployeeRate={updateEmployeeRate}
    updateEmployeeRole={updateEmployeeRole}
    availabilityDrafts={availabilityDrafts}
    updateAvailabilityDraft={updateAvailabilityDraft}
    addUnavailableDate={addUnavailableDate}
    removeUnavailableDate={removeUnavailableDate}
  />
)}
                    
      </div>
    </main>
  );
}



