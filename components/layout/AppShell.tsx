"use client";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../lib/supabase";
import ScheduleSection from "../schedule/ScheduleSection";
import ShiftFormModal from "../schedule/ShiftFormModal";
import GuidedWorkspaceSetup from "../onboarding/GuidedWorkspaceSetup";
import WorkspaceAppNav from "./WorkspaceAppNav";
import WeekSection from "../schedule/WeekSection";
import MonthSection from "../month/MonthSection";
import TimesheetsReport from "../reports/TimesheetsReport";
import PayrollOverview, { type PayrollOverviewRow } from "../payroll/PayrollOverview";
import EmployeePayrollDetail from "../payroll/EmployeePayrollDetail";
import { calendarMonthRange } from "../../lib/reports/date-range";
import {
  reportEndDisplay,
  reportHoursForShift,
  reportStartDisplay,
} from "../../lib/reports/shift-hours-cost";
import {
  earningsForShift,
  hoursForPayrollShift,
} from "../../lib/payroll/compute";
import EmployeesSection from "../employees/EmployeesSection";
import EmployeeGroupsSection from "../people/EmployeeGroupsSection";
import HomeDashboardSection, { type SetupCard } from "../dashboard/HomeDashboardSection";
import { useRouter } from "next/navigation";
import Link from "next/link";



import type {
  AppTab,
  EmployeeConfig,
  EmployeeGroupRow,
  FormState,
  NewEmployeeForm,
  Shift,
} from "../../types/schedule";

import {
  CUSTOM_ROLE_OPTION,
  monthNames,
  roles,
} from "../../lib/constants";

import { isCompanyAdminRole } from "../../lib/workspace-role";
import {
  addDays,
  formatHours,
  formatMoney,
  fromDateInputValue,
  getCurrentTimeString,
  getDayNameFromDate,
  getPlannedHours,
  getWeekDates,
  getWorkedHours,
  isOverlap,
  isValidFullTime,
  normalizeManualTimeInput,
  roleStyles,
  roundTime,
  sortEmployeesForDisplay,
  startOfWeekWithPreference,
  toDateInputValue,
  type WeekStartPreference,
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

function createNewEmployeeForm(defaultHourlyWage: number | null | undefined): NewEmployeeForm {
  const n = defaultHourlyWage != null ? Number(defaultHourlyWage) : NaN;
  const hourlyRate = !Number.isNaN(n) && n >= 0 ? String(n) : "130";
  return {
    name: "",
    hourlyRate,
    defaultRole: "Service",
  };
}

type AppShellProps = {
  role: string;
  employeeName: string | null;
  companyName?: string | null;
  companyCvr?: string | null;
  activeCompanyId?: string | null;
  /** Monday-first (default) or Sunday-first week for schedule + payroll week picker. */
  companyWeekStartsOn?: "monday" | "sunday" | null;
  companyCurrency?: string | null;
  companyDefaultHourlyWage?: number | null;
  /** Open first-time guided setup when landing from company success (?guided=1). */
  launchGuidedSetup?: boolean;
};

const GUIDED_DISMISS_KEY = "planyo_guided_setup_dismissed_v1";
const GUIDED_PENDING_KEY = "planyo_guided_pending";

export default function AppShell({
  role,
  employeeName,
  companyName,
  companyCvr,
  activeCompanyId,
  companyWeekStartsOn,
  companyCurrency,
  companyDefaultHourlyWage,
  launchGuidedSetup = false,
}: AppShellProps) {
  const normalizedRole = (role || "employee").toLowerCase();
  const isAdmin = isCompanyAdminRole(role);

  /** Central guard for admin-only mutations and exports (logic-level, not UI-only). */
  function guardAdmin(action: string): boolean {
    if (isAdmin) return true;
    alert(`Only workspace admins can ${action}.`);
    return false;
  }

  const workspaceName = companyName || "Workspace";
  const workspaceCvr = companyCvr || "";
  const weekPref: WeekStartPreference =
    (companyWeekStartsOn || "").toLowerCase() === "sunday" ? "sunday" : "monday";
  const currencyCode = (companyCurrency || "DKK").trim().toUpperCase() || "DKK";
  const formatCurrency = useCallback((n: number) => formatMoney(n, currencyCode), [currencyCode]);
  const supabase = createClient();
  const router = useRouter();

  const loadEmployeeGroups = useCallback(async () => {
    if (!activeCompanyId || !isAdmin) {
      setEmployeeGroups([]);
      return;
    }
    const { data, error } = await supabase
      .from("employee_groups")
      .select("id, name, hourly_wage")
      .eq("company_id", activeCompanyId)
      .order("name", { ascending: true });

    if (error) {
      console.log("Error fetching employee groups:", error);
      return;
    }

    setEmployeeGroups(
      (data || []).map((row: { id: string; name: string; hourly_wage: number | null }) => ({
        id: row.id,
        name: row.name,
        hourlyWage: row.hourly_wage != null ? Number(row.hourly_wage) : null,
      }))
    );
  }, [activeCompanyId, isAdmin, supabase]);

  const ensureDefaultEmployeeGroup = useCallback(async () => {
    if (!activeCompanyId || !isAdmin) {
      throw new Error("Not allowed.");
    }
    const { count, error: countError } = await supabase
      .from("employee_groups")
      .select("id", { count: "exact", head: true })
      .eq("company_id", activeCompanyId);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) {
      await loadEmployeeGroups();
      return;
    }
    const { error } = await supabase.from("employee_groups").insert({
      company_id: activeCompanyId,
      name: "General",
      hourly_wage: null,
    });
    if (error) throw new Error(error.message);
    await loadEmployeeGroups();
  }, [activeCompanyId, isAdmin, loadEmployeeGroups, supabase]);

async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}

  const today = new Date();
  const todayDate = toDateInputValue(today);
  const todayWeekStart = startOfWeekWithPreference(today, weekPref);
  const initialWeekDates = getWeekDates(todayWeekStart, weekPref);

  const currentYear = new Date().getFullYear();

  
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [employees, setEmployees] =
    useState<EmployeeConfig[]>([]);
  const [employeeGroups, setEmployeeGroups] = useState<EmployeeGroupRow[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [guidedSetupOpen, setGuidedSetupOpen] = useState(false);
  const [shiftDayAvailabilityByEmployee, setShiftDayAvailabilityByEmployee] = useState<
    Record<string, string>
  >({});
  /** Re-open guided setup after closing the shift form without creating a shift yet. */
  const resumeGuidedAfterShiftModalClose = useRef(false);
  /** Re-open guided setup when the user returns to Home after visiting Employees or Groups. */
  const resumeGuidedWhenHome = useRef(false);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);
  const [isScheduleMenuOpen, setIsScheduleMenuOpen] = useState(false);
  const [isPeopleMenuOpen, setIsPeopleMenuOpen] = useState(false);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);
  const [isPayrollNavOpen, setIsPayrollNavOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) {
        setAuthUserId(data.user?.id ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

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

      const mappedEmployees: EmployeeConfig[] = (data || []).map((emp) => ({
        id: emp.id,
        userId: emp.user_id ?? null,
        name: emp.name,
        hourlyRate: Number(emp.hourly_rate),
        defaultRole: emp.default_role,
        unavailableDates: Array.isArray(emp.unavailable_dates) ? emp.unavailable_dates : [],
        active: emp.active,
        groupId: (emp as { employee_group_id?: string | null }).employee_group_id ?? null,
      }));

      if (!isAdmin) {
        const selfName = (employeeName || "").trim().toLowerCase();
        const filtered = mappedEmployees.filter(
          (emp) =>
            (Boolean(authUserId) && emp.userId === authUserId) ||
            emp.name.trim().toLowerCase() === selfName
        );
        setEmployees(filtered);
      } else {
        setEmployees(mappedEmployees);
      }
    }

    async function fetchShifts() {
      if (!activeCompanyId) {
        setShifts([]);
        return;
      }

      let query = supabase
        .from("shifts")
        .select("*")
        .eq("company_id", activeCompanyId);

      if (!isAdmin && employeeName?.trim()) {
        query = query.eq("employee", employeeName.trim());
      }

      const { data, error } = await query
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

    void fetchEmployees();
    void fetchShifts();
    void loadEmployeeGroups();
  }, [activeCompanyId, supabase, isAdmin, employeeName, authUserId, loadEmployeeGroups]);

  useEffect(() => {
    if (
      !isAdmin &&
      (activeTab === "reports-timesheets" ||
        activeTab === "payroll-overview" ||
        activeTab === "payroll-employee" ||
        activeTab === "employees" ||
        activeTab === "employee-groups")
    ) {
      setActiveTab("schedule");
    }
  }, [isAdmin, activeTab]);

  const closeAllNavMenus = useCallback(() => {
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, []);

  const toggleHomeMenu = useCallback(() => {
    if (isHomeMenuOpen) {
      setIsHomeMenuOpen(false);
      return;
    }
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsHomeMenuOpen(true);
  }, [isHomeMenuOpen]);

  const toggleScheduleMenu = useCallback(() => {
    if (isScheduleMenuOpen) {
      setIsScheduleMenuOpen(false);
      return;
    }
    setIsHomeMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsScheduleMenuOpen(true);
  }, [isScheduleMenuOpen]);

  const togglePeopleMenu = useCallback(() => {
    if (isPeopleMenuOpen) {
      setIsPeopleMenuOpen(false);
      return;
    }
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsPeopleMenuOpen(true);
  }, [isPeopleMenuOpen]);

  const toggleReportsMenu = useCallback(() => {
    if (isReportsMenuOpen) {
      setIsReportsMenuOpen(false);
      return;
    }
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsReportsMenuOpen(true);
  }, [isReportsMenuOpen]);

  const togglePayrollNavMenu = useCallback(() => {
    if (isPayrollNavOpen) {
      setIsPayrollNavOpen(false);
      return;
    }
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsPayrollNavOpen(true);
  }, [isPayrollNavOpen]);

  const toggleSettingsMenu = useCallback(() => {
    if (isSettingsMenuOpen) {
      setIsSettingsMenuOpen(false);
      return;
    }
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsUserMenuOpen(false);
    setIsSettingsMenuOpen(true);
  }, [isSettingsMenuOpen]);

  const toggleUserMenu = useCallback(() => {
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
      return;
    }
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(true);
  }, [isUserMenuOpen]);
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
  const [newEmployeeForm, setNewEmployeeForm] = useState<NewEmployeeForm>(() =>
    createNewEmployeeForm(companyDefaultHourlyWage)
  );
  const [reportTimesheetFrom, setReportTimesheetFrom] = useState(() => {
    const { from } = calendarMonthRange(new Date().getMonth() + 1, new Date().getFullYear());
    return from;
  });
  const [reportTimesheetTo, setReportTimesheetTo] = useState(() => {
    const { to } = calendarMonthRange(new Date().getMonth() + 1, new Date().getFullYear());
    return to;
  });
  const [reportTimesheetEmployee, setReportTimesheetEmployee] = useState("all");
  const [reportTimesheetGroup, setReportTimesheetGroup] = useState("all");
  const [payrollRangeMode, setPayrollRangeMode] = useState<"week" | "month" | "custom">("month");
  const [payrollOverviewMonth, setPayrollOverviewMonth] = useState(() => new Date().getMonth() + 1);
  const [payrollOverviewYear, setPayrollOverviewYear] = useState(currentYear);
  const [payrollWeekStart, setPayrollWeekStart] = useState(() =>
    startOfWeekWithPreference(new Date(), weekPref)
  );
  const [payrollCustomFrom, setPayrollCustomFrom] = useState(() => {
    const { from } = calendarMonthRange(new Date().getMonth() + 1, new Date().getFullYear());
    return from;
  });
  const [payrollCustomTo, setPayrollCustomTo] = useState(() => {
    const { to } = calendarMonthRange(new Date().getMonth() + 1, new Date().getFullYear());
    return to;
  });
  const [payrollTableEmployeeFilter, setPayrollTableEmployeeFilter] = useState("all");
  const [payrollSelectedEmployee, setPayrollSelectedEmployee] = useState<string | null>(null);
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

  const weekDates = useMemo(() => getWeekDates(weekStart, weekPref), [weekStart, weekPref]);
  const hasShiftsForGuided = shifts.length > 0;

  useEffect(() => {
    if (hasShiftsForGuided) {
      resumeGuidedAfterShiftModalClose.current = false;
      resumeGuidedWhenHome.current = false;
      setGuidedSetupOpen(false);
    }
  }, [hasShiftsForGuided]);

  useEffect(() => {
    if (!isAdmin || hasShiftsForGuided) return;
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(GUIDED_DISMISS_KEY)) {
        return;
      }
    } catch {
      return;
    }
    let shouldOpen = Boolean(launchGuidedSetup);
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(GUIDED_PENDING_KEY) === "1") {
        window.sessionStorage.removeItem(GUIDED_PENDING_KEY);
        shouldOpen = true;
      }
    } catch {
      // ignore
    }
    if (shouldOpen) {
      setGuidedSetupOpen(true);
    }
  }, [isAdmin, hasShiftsForGuided, launchGuidedSetup]);

  const readGuidedDismissedSession = useCallback(() => {
    try {
      return (
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(GUIDED_DISMISS_KEY) === "1"
      );
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || hasShiftsForGuided) {
      resumeGuidedAfterShiftModalClose.current = false;
      return;
    }
    if (resumeGuidedAfterShiftModalClose.current && !showShiftForm) {
      resumeGuidedAfterShiftModalClose.current = false;
      if (!readGuidedDismissedSession()) {
        setGuidedSetupOpen(true);
      }
    }
  }, [isAdmin, hasShiftsForGuided, showShiftForm, readGuidedDismissedSession]);

  useEffect(() => {
    if (!isAdmin || hasShiftsForGuided) {
      resumeGuidedWhenHome.current = false;
      return;
    }
    if (resumeGuidedWhenHome.current && activeTab === "home") {
      resumeGuidedWhenHome.current = false;
      if (!readGuidedDismissedSession()) {
        setGuidedSetupOpen(true);
      }
    }
  }, [isAdmin, hasShiftsForGuided, activeTab, readGuidedDismissedSession]);

  const activeEmployeesAvailabilityKey = useMemo(
    () =>
      `${form.date}|${activeEmployees.map((e) => `${e.name}:${e.userId ?? ""}`).sort().join(";")}`,
    [form.date, activeEmployees]
  );

  useEffect(() => {
    if (!isAdmin || !activeCompanyId || !showShiftForm) {
      setShiftDayAvailabilityByEmployee({});
      return;
    }
    const date = form.date;
    const pairs = activeEmployees
      .map((e) => ({ name: e.name, userId: e.userId }))
      .filter((p): p is { name: string; userId: string } => Boolean(p.userId));
    if (pairs.length === 0) {
      const noneMap: Record<string, string> = {};
      activeEmployees.forEach((e) => {
        noneMap[e.name] = "none";
      });
      setShiftDayAvailabilityByEmployee(noneMap);
      return;
    }
    let cancelled = false;
    const userIds = pairs.map((p) => p.userId);
    void supabase
      .from("employee_availability")
      .select("user_id, status")
      .eq("company_id", activeCompanyId)
      .eq("date", date)
      .in("user_id", userIds)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("[availability] shift form", error.message);
          setShiftDayAvailabilityByEmployee({});
          return;
        }
        const byUser = Object.fromEntries(
          (data || []).map((row: { user_id: string; status: string }) => [row.user_id, row.status])
        );
        const byName: Record<string, string> = {};
        activeEmployees.forEach((e) => {
          if (!e.userId) {
            byName[e.name] = "none";
          } else {
            byName[e.name] = (byUser[e.userId] as string) || "undecided";
          }
        });
        setShiftDayAvailabilityByEmployee(byName);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, activeCompanyId, showShiftForm, activeEmployeesAvailabilityKey, supabase, activeEmployees]);

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
      const anchor = startOfWeekWithPreference(fromDateInputValue(selectedDate), weekPref);
      setWeekStart(anchor);
      setCopyFromDate(selectedDate);
      setForm((current) => ({
        ...current,
        date: selectedDate,
      }));
    }
  }, [weekDates, selectedDate, weekPref]);

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

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const dateMatch = shift.date === selectedDate;
      const employeeMatch =
        employeeFilter === "All" || shift.employee === employeeFilter;
      return dateMatch && employeeMatch;
    });
  }, [shifts, selectedDate, employeeFilter]);

  const scheduleGridEmployees = useMemo(
    () =>
      employeeFilter === "All"
        ? employeeNames.filter((name) =>
            employees.some((employee) => employee.name === name && employee.active)
          )
        : employeeNames.filter((name) => name === employeeFilter),
    [employeeFilter, employeeNames, employees]
  );

  const onMonthPlannerSelectDay = useCallback(
    (date: string) => {
      const d = fromDateInputValue(date);
      setMonthFilter(d.getMonth() + 1);
      setYearFilter(d.getFullYear());
      setSelectedDate(date);
      setForm((current) => ({ ...current, date }));
      setOpenMenuId(null);
      setWeekStart(startOfWeekWithPreference(d, weekPref));
    },
    [setForm, setOpenMenuId, weekPref]
  );

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

  const timesheetReportFilteredShifts = useMemo(() => {
    return shifts
      .filter((shift) => {
        if (reportTimesheetFrom && shift.date < reportTimesheetFrom) return false;
        if (reportTimesheetTo && shift.date > reportTimesheetTo) return false;
        if (reportTimesheetEmployee !== "all" && shift.employee !== reportTimesheetEmployee) {
          return false;
        }
        if (reportTimesheetGroup === "ungrouped") {
          const emp = employees.find((e) => e.name === shift.employee);
          if (emp?.groupId) return false;
        } else if (reportTimesheetGroup !== "all") {
          const emp = employees.find((e) => e.name === shift.employee);
          if (emp?.groupId !== reportTimesheetGroup) return false;
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [
    shifts,
    reportTimesheetFrom,
    reportTimesheetTo,
    reportTimesheetEmployee,
    reportTimesheetGroup,
    employees,
  ]);

  const payrollRangeBounds = useMemo(() => {
    if (payrollRangeMode === "month") {
      return calendarMonthRange(payrollOverviewMonth, payrollOverviewYear);
    }
    if (payrollRangeMode === "custom") {
      return { from: payrollCustomFrom, to: payrollCustomTo };
    }
    const from = toDateInputValue(payrollWeekStart);
    const to = toDateInputValue(addDays(payrollWeekStart, 6));
    return { from, to };
  }, [
    payrollRangeMode,
    payrollOverviewMonth,
    payrollOverviewYear,
    payrollCustomFrom,
    payrollCustomTo,
    payrollWeekStart,
  ]);

  const payrollPeriodLabel = useMemo(() => {
    const { from, to } = payrollRangeBounds;
    if (payrollRangeMode === "week") {
      return `Week ${from} – ${to}`;
    }
    if (payrollRangeMode === "month") {
      return `${monthNames[payrollOverviewMonth]} ${payrollOverviewYear}`;
    }
    return `${from} – ${to}`;
  }, [
    payrollRangeBounds,
    payrollRangeMode,
    payrollOverviewMonth,
    payrollOverviewYear,
    monthNames,
  ]);

  const payrollBaseShiftsInRange = useMemo(() => {
    const { from, to } = payrollRangeBounds;
    return shifts.filter((s) => s.date >= from && s.date <= to);
  }, [shifts, payrollRangeBounds]);

  const payrollShiftsForTable = useMemo(() => {
    if (payrollTableEmployeeFilter === "all") return payrollBaseShiftsInRange;
    return payrollBaseShiftsInRange.filter((s) => s.employee === payrollTableEmployeeFilter);
  }, [payrollBaseShiftsInRange, payrollTableEmployeeFilter]);

  const payrollOverviewRows = useMemo<PayrollOverviewRow[]>(() => {
    const names =
      payrollTableEmployeeFilter === "all" ? employeeNames : [payrollTableEmployeeFilter];
    return names.map((name) => {
      const list = payrollShiftsForTable.filter((s) => s.employee === name);
      const rate = employeeRateMap[name] || 0;
      let totalHours = 0;
      let totalEarnings = 0;
      for (const sh of list) {
        const h = hoursForPayrollShift(sh);
        totalHours += h;
        totalEarnings += earningsForShift(sh, rate);
      }
      return {
        employee: name,
        totalHours,
        hourlyRate: rate,
        totalEarnings,
        active: employees.find((e) => e.name === name)?.active ?? true,
      };
    });
  }, [payrollShiftsForTable, payrollTableEmployeeFilter, employeeNames, employeeRateMap, employees]);

  const payrollOverviewTotals = useMemo(() => {
    const totalHours = payrollOverviewRows.reduce((s, r) => s + r.totalHours, 0);
    const totalPayrollCost = payrollOverviewRows.reduce((s, r) => s + r.totalEarnings, 0);
    const averageHourlyCost = totalHours > 0 ? totalPayrollCost / totalHours : 0;
    return { totalHours, totalPayrollCost, averageHourlyCost };
  }, [payrollOverviewRows]);

  const payrollEmployeeDetailShifts = useMemo(() => {
    if (!payrollSelectedEmployee) return [];
    return payrollBaseShiftsInRange
      .filter((s) => s.employee === payrollSelectedEmployee)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [payrollBaseShiftsInRange, payrollSelectedEmployee]);

  const payrollEmployeeDetailTotals = useMemo(() => {
    if (!payrollSelectedEmployee) {
      return { totalHours: 0, totalEarnings: 0, rate: 0 };
    }
    const rate = employeeRateMap[payrollSelectedEmployee] || 0;
    let totalHours = 0;
    let totalEarnings = 0;
    for (const sh of payrollEmployeeDetailShifts) {
      totalHours += hoursForPayrollShift(sh);
      totalEarnings += earningsForShift(sh, rate);
    }
    return { totalHours, totalEarnings, rate };
  }, [payrollSelectedEmployee, payrollEmployeeDetailShifts, employeeRateMap]);

  useEffect(() => {
    if (isAdmin && activeTab === "payroll-employee" && !payrollSelectedEmployee) {
      setActiveTab("payroll-overview");
    }
  }, [isAdmin, activeTab, payrollSelectedEmployee]);

  const payrollWeekPrev = useCallback(() => {
    setPayrollWeekStart((d) => addDays(d, -7));
  }, []);

  const payrollWeekNext = useCallback(() => {
    setPayrollWeekStart((d) => addDays(d, 7));
  }, []);

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

    if (!guardAdmin("create or edit planned shifts")) {
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

    const dayAvail = shiftDayAvailabilityByEmployee[form.employee];
    if (isAdmin && dayAvail === "cannot_work") {
      const ok = window.confirm(
        `${form.employee} marked themselves as cannot work on ${form.date}. Save this shift anyway?`
      );
      if (!ok) return;
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
    if (!guardAdmin("edit planned shifts")) {
      return;
    }

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
    setWeekStart(startOfWeekWithPreference(fromDateInputValue(shift.date), weekPref));
  }

  async function deleteShift(id: string) {
    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
      return;
    }
    const target = shifts.find((s) => s.id === id);
    if (!target) {
      alert("Shift not found.");
      return;
    }
    if (!guardAdmin("delete shifts")) {
      return;
    }

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

  async function copyDayShifts() {
    if (!guardAdmin("copy a full day of shifts")) {
      return;
    }

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

    if (!activeCompanyId) return;

    const rowsToInsert = sourceShifts.map((shift) => ({
      company_id: activeCompanyId,
      employee: shift.employee,
      date: selectedDate,
      start: shift.start,
      end: shift.end,
      role: shift.role,
      notes: shift.notes || null,
    }));

    const { data, error } = await supabase.from("shifts").insert(rowsToInsert).select();

    if (error) {
      alert(`Could not copy shifts: ${error.message}`);
      return;
    }

    const inserted: Shift[] = (data || []).map((row) => ({
      id: row.id,
      employee: row.employee,
      date: row.date,
      start: row.start,
      end: row.end,
      role: row.role,
      notes: row.notes || "",
      day: getDayNameFromDate(row.date),
      actualStart: row.actual_start || undefined,
      actualEnd: row.actual_end || undefined,
      approved: row.approved ?? false,
    }));

    setShifts((current) => [...current, ...inserted]);
  }

  async function clearSelectedDay() {
    if (!guardAdmin("clear all shifts for a day")) {
      return;
    }

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
    if (!guardAdmin("change shift approval")) {
      return;
    }

    const target = shifts.find((s) => s.id === id);
    if (!target) {
      alert("Shift not found.");
      return;
    }

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
    if (!guardAdmin("approve shifts as planned")) {
      return;
    }

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
    if (!guardAdmin("bulk-approve shifts for a day")) {
      return;
    }

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
    const newWeekDates = getWeekDates(newWeekStart, weekPref);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekDates[0].date);
    setCopyFromDate(newWeekDates[0].date);
    setForm((current) => ({ ...current, date: newWeekDates[0].date }));
  }

  function goToNextWeek() {
    const newWeekStart = addDays(weekStart, 7);
    const newWeekDates = getWeekDates(newWeekStart, weekPref);
    setWeekStart(newWeekStart);
    setSelectedDate(newWeekDates[0].date);
    setCopyFromDate(newWeekDates[0].date);
    setForm((current) => ({ ...current, date: newWeekDates[0].date }));
  }

  function goToThisWeek() {
    const newWeekStart = startOfWeekWithPreference(new Date(), weekPref);
    const newWeekDates = getWeekDates(newWeekStart, weekPref);
    setWeekStart(newWeekStart);
    setSelectedDate(todayDate);
    setCopyFromDate(newWeekDates[0].date);
    setForm((current) => ({ ...current, date: todayDate }));
  }

  async function updateEmployeeRate(name: string, newRate: number) {
    if (!isAdmin) {
      alert("Only workspace admins can change employee rates.");
      return;
    }

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
    if (!isAdmin) {
      alert("Only workspace admins can change employee roles.");
      return;
    }

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

  async function updateEmployeeGroup(name: string, groupId: string | null) {
    if (!isAdmin) {
      alert("Only workspace admins can change employee groups.");
      return;
    }

    const emp = employees.find((e) => e.name === name);
    if (!emp?.id || !activeCompanyId) return;

    const { error } = await supabase
      .from("employees")
      .update({ employee_group_id: groupId })
      .eq("id", emp.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current) =>
      current.map((employee) =>
        employee.name === name ? { ...employee, groupId } : employee
      )
    );
  }

  async function updateEmployeeName(oldName: string, newName: string) {
    if (!isAdmin) {
      alert("Only workspace admins can rename employees.");
      return;
    }

    const trimmed = newName.trim();

    if (!trimmed) {
      alert("Employee name cannot be empty.");
      return;
    }

    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
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

    const employee = employees.find((item) => item.name === oldName);
    if (!employee) return;

    const { error: empError } = await supabase
      .from("employees")
      .update({ name: trimmed })
      .eq("id", employee.id)
      .eq("company_id", activeCompanyId);

    if (empError) {
      alert(empError.message);
      return;
    }

    if (oldName !== trimmed) {
      const { error: shiftError } = await supabase
        .from("shifts")
        .update({ employee: trimmed })
        .eq("company_id", activeCompanyId)
        .eq("employee", oldName);

      if (shiftError) {
        alert(shiftError.message);
        return;
      }
    }

    setEmployees((current) =>
      current.map((emp) =>
        emp.name === oldName ? { ...emp, name: trimmed } : emp
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

    if (reportTimesheetEmployee === oldName) {
      setReportTimesheetEmployee(trimmed);
    }

    if (payrollSelectedEmployee === oldName) {
      setPayrollSelectedEmployee(trimmed);
    }

    if (payrollTableEmployeeFilter === oldName) {
      setPayrollTableEmployeeFilter(trimmed);
    }
  }

  async function setEmployeeActiveStatus(name: string, active: boolean) {
    if (!isAdmin) {
      alert("Only workspace admins can change employee active status.");
      return;
    }

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

    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
      return;
    }

    const { error } = await supabase
      .from("employees")
      .update({ active })
      .eq("id", employee.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current) =>
      current.map((item) => (item.name === name ? { ...item, active } : item))
    );
  }

  async function deleteEmployee(name: string) {
    if (!isAdmin) {
      alert("Only workspace admins can delete employees.");
      return;
    }

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

    if (reportTimesheetEmployee === name) {
      setReportTimesheetEmployee("all");
    }

    if (payrollSelectedEmployee === name) {
      setPayrollSelectedEmployee(null);
      setActiveTab("payroll-overview");
    }

    if (payrollTableEmployeeFilter === name) {
      setPayrollTableEmployeeFilter("all");
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

  async function addUnavailableDate(name: string) {
    if (!isAdmin) {
      alert("Only workspace admins can manage employee availability here.");
      return;
    }

    const dateToAdd = availabilityDrafts[name];

    if (!dateToAdd) {
      alert("Please choose a date first.");
      return;
    }

    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
      return;
    }

    const employee = employees.find((item) => item.name === name);
    if (!employee) return;

    if (employee.unavailableDates.includes(dateToAdd)) {
      setAvailabilityDrafts((current) => ({
        ...current,
        [name]: "",
      }));
      return;
    }

    const nextDates = [...employee.unavailableDates, dateToAdd].sort();

    const { error } = await supabase
      .from("employees")
      .update({ unavailable_dates: nextDates })
      .eq("id", employee.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current) =>
      current.map((emp) =>
        emp.name === name ? { ...emp, unavailableDates: nextDates } : emp
      )
    );

    setAvailabilityDrafts((current) => ({
      ...current,
      [name]: "",
    }));
  }

  async function removeUnavailableDate(name: string, dateToRemove: string) {
    if (!isAdmin) {
      alert("Only workspace admins can manage employee availability here.");
      return;
    }

    if (!activeCompanyId) {
      alert("No active company workspace found for this user.");
      return;
    }

    const employee = employees.find((item) => item.name === name);
    if (!employee) return;

    const nextDates = employee.unavailableDates.filter((date) => date !== dateToRemove);

    const { error } = await supabase
      .from("employees")
      .update({ unavailable_dates: nextDates })
      .eq("id", employee.id)
      .eq("company_id", activeCompanyId);

    if (error) {
      alert(error.message);
      return;
    }

    setEmployees((current) =>
      current.map((emp) =>
        emp.name === name ? { ...emp, unavailableDates: nextDates } : emp
      )
    );
  }

  async function addEmployee(overrides?: {
    name?: string;
    hourlyRate?: number;
    defaultRole?: string;
  }) {
    if (!isAdmin) {
      throw new Error("Only workspace admins can add employees.");
    }

    const trimmedName = (overrides?.name ?? newEmployeeForm.name).trim();
    const hourlyRate = Number(overrides?.hourlyRate ?? newEmployeeForm.hourlyRate);
    const trimmedRole =
      (overrides?.defaultRole ?? newEmployeeForm.defaultRole).trim() || "Service";

    if (!activeCompanyId) {
      throw new Error("No active company workspace found for this user.");
    }

    if (!trimmedName) {
      throw new Error("Please enter employee name.");
    }

    const exists = employees.some(
      (employee) => employee.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      throw new Error("Employee name already exists.");
    }

    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      throw new Error("Please enter a valid hourly rate.");
    }

    const response = await fetch("/api/employees", {
      method: "POST",
      credentials: "include",
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

    let result: { error?: string; employee?: Record<string, unknown> };
    try {
      result = (await response.json()) as typeof result;
    } catch {
      throw new Error(
        `Could not read server response (${response.status}). If this persists, check deployment logs.`
      );
    }
    if (!response.ok || !result?.employee) {
      throw new Error(result?.error || "Could not add employee.");
    }
    const data = result.employee;

    const newEmployee: any = {
      id: data.id,
      name: data.name,
      hourlyRate: data.hourly_rate,
      defaultRole: data.default_role,
      unavailableDates: data.unavailable_dates || [],
      active: data.active,
      groupId:
        (data as { employee_group_id?: string | null }).employee_group_id ?? null,
    };

    setEmployees((current: any[]) => [...current, newEmployee]);

    if (activeEmployees.length === 0) {
      setForm((current) => ({
        ...current,
        employee: trimmedName,
        role: newEmployee.defaultRole,
      }));
    }

    setNewEmployeeForm(createNewEmployeeForm(companyDefaultHourlyWage));
    setNewEmployeeRoleMode("preset");
  }

  async function punchIn(id: string) {
    const target = shifts.find((s) => s.id === id);
    if (!target) {
      alert("Shift not found.");
      return;
    }
    if (!isAdmin && target.employee !== (employeeName || "").trim()) {
      alert("You can only punch in on your own shifts.");
      return;
    }

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

    if (!targetShift) {
      alert("Shift not found.");
      return;
    }
    if (!isAdmin && targetShift.employee !== (employeeName || "").trim()) {
      alert("You can only punch out on your own shifts.");
      return;
    }

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
    const target = shifts.find((s) => s.id === id);
    if (!target) {
      throw new Error("Shift not found.");
    }
    if (!isAdmin && target.employee !== (employeeName || "").trim()) {
      throw new Error("You can only edit actual times on your own shifts.");
    }

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
    const target = shifts.find((s) => s.id === id);
    if (!target) {
      alert("Shift not found.");
      return;
    }
    if (!isAdmin && target.employee !== (employeeName || "").trim()) {
      alert("You can only reset punch data on your own shifts.");
      return;
    }

    try {
      await updateShiftActualTimes(id, null, null);
    } catch (error: any) {
      alert(`Could not reset actual times: ${error.message}`);
    }
  }

  function downloadPayrollCsv() {
    if (!guardAdmin("export payroll data")) {
      return;
    }
    const { from, to } = payrollRangeBounds;
    const rows = [
      ["Company", workspaceName],
      ["CVR", workspaceCvr],
      ["Period", payrollPeriodLabel],
      ["From", from],
      ["To", to],
      [],
      ["Employee", "Total hours", `Hourly rate (${currencyCode})`, `Total earnings (${currencyCode})`],
      ...payrollOverviewRows.map((r) => [
        r.employee,
        r.totalHours.toFixed(2),
        r.hourlyRate.toFixed(2),
        r.totalEarnings.toFixed(2),
      ]),
      [],
      [
        "Totals",
        payrollOverviewTotals.totalHours.toFixed(2),
        "",
        payrollOverviewTotals.totalPayrollCost.toFixed(2),
      ],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${workspaceName.replace(/\s+/g, "-").toLowerCase()}-payroll-${from}-to-${to}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadPayrollPdf() {
    if (!guardAdmin("export payroll data")) {
      return;
    }
    const reportHtml = `
      <html>
        <head>
          <title>Payroll overview</title>
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
            <p>Payroll overview — ${payrollPeriodLabel}</p>
          </div>

          <div class="summary">
            <p><strong>Total hours worked:</strong> ${payrollOverviewTotals.totalHours.toFixed(1)} hrs</p>
            <p><strong>Total payroll cost:</strong> ${formatCurrency(payrollOverviewTotals.totalPayrollCost)}</p>
            <p><strong>Average hourly cost:</strong> ${
              payrollOverviewTotals.totalHours > 0
                ? formatCurrency(payrollOverviewTotals.averageHourlyCost)
                : "—"
            }</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Total hours</th>
                <th>Hourly rate (${currencyCode})</th>
                <th>Total earnings</th>
              </tr>
            </thead>
            <tbody>
              ${payrollOverviewRows
                .map(
                  (r) => `
                <tr>
                  <td>${r.employee}</td>
                  <td>${r.totalHours.toFixed(1)}</td>
                  <td>${r.hourlyRate.toFixed(2)}</td>
                  <td>${r.totalEarnings.toFixed(2)}</td>
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

  function downloadTimesheetsReportCsv() {
    if (!guardAdmin("export timesheet reports")) {
      return;
    }
    const headers = [
      "Employee",
      "Date",
      "Start",
      "End",
      "Total hours",
      `Hourly rate (${currencyCode})`,
      `Total cost (${currencyCode})`,
    ];
    const body = timesheetReportFilteredShifts.map((shift) => {
      const rate = employeeRateMap[shift.employee] || 0;
      const hours = reportHoursForShift(shift);
      const cost = hours * rate;
      return [
        shift.employee,
        shift.date,
        reportStartDisplay(shift),
        reportEndDisplay(shift),
        hours.toFixed(2),
        rate.toFixed(2),
        cost.toFixed(2),
      ];
    });
    const rows = [
      ["Company", workspaceName],
      ["CVR", workspaceCvr],
      ["From", reportTimesheetFrom],
      ["To", reportTimesheetTo],
      ["Employee filter", reportTimesheetEmployee],
      ["Group filter", reportTimesheetGroup],
      [],
      headers,
      ...body,
    ];
    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${workspaceName.replace(/\s+/g, "-").toLowerCase()}-timesheets-${reportTimesheetFrom}-to-${reportTimesheetTo}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadTimesheetsReportPdf() {
    if (!guardAdmin("export timesheet reports")) {
      return;
    }
    const rowsHtml =
      timesheetReportFilteredShifts.length === 0
        ? '<tr><td colspan="7">No shifts match these filters.</td></tr>'
        : timesheetReportFilteredShifts
            .map((shift) => {
              const rate = employeeRateMap[shift.employee] || 0;
              const hours = reportHoursForShift(shift);
              const cost = hours * rate;
              return `<tr>
                <td>${shift.employee}</td>
                <td>${shift.date}</td>
                <td>${reportStartDisplay(shift)}</td>
                <td>${reportEndDisplay(shift)}</td>
                <td>${hours.toFixed(2)}</td>
                <td>${rate.toFixed(2)}</td>
                <td>${cost.toFixed(2)}</td>
              </tr>`;
            })
            .join("");

    const reportHtml = `
      <html>
        <head>
          <title>Timesheets</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1, p { margin: 0 0 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${workspaceName}</h1>
          <p>CVR: ${workspaceCvr}</p>
          <p><strong>Period:</strong> ${reportTimesheetFrom} to ${reportTimesheetTo}</p>
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Date</th><th>Start</th><th>End</th>
                <th>Total hours</th><th>Hourly rate</th><th>Total cost (${currencyCode})</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
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

    const csvContent = rows.map((row) => row.join(",")).join("\n");
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
      '<p><strong>Approved Payroll Estimate:</strong> ' + formatCurrency(approvedPayrollEstimate) + '</p>' +
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

  function openCreateShiftFromHeader() {
    if (!guardAdmin("create shifts")) {
      return;
    }
    setActiveTab("schedule");
    resetForm();
    setShowShiftForm(true);
  }

  function dismissGuidedSetup() {
    resumeGuidedAfterShiftModalClose.current = false;
    resumeGuidedWhenHome.current = false;
    setGuidedSetupOpen(false);
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(GUIDED_DISMISS_KEY, "1");
      }
    } catch {
      // ignore
    }
  }

  function openEmployeeGroupsFromGuided() {
    if (!guardAdmin("manage employee groups")) {
      return;
    }
    closeAllNavMenus();
    setActiveTab("employee-groups");
    setGuidedSetupOpen(false);
    resumeGuidedWhenHome.current = true;
  }

  function openEmployeesFromGuided() {
    if (!guardAdmin("manage employees")) {
      return;
    }
    closeAllNavMenus();
    setActiveTab("employees");
    setGuidedSetupOpen(false);
    resumeGuidedWhenHome.current = true;
  }

  function guidedCreateShift() {
    closeAllNavMenus();
    resumeGuidedAfterShiftModalClose.current = true;
    setGuidedSetupOpen(false);
    openCreateShiftFromHeader();
  }

  function openRunSetupGuideFromHome() {
    if (!guardAdmin("run the setup guide")) {
      return;
    }
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(GUIDED_DISMISS_KEY);
      }
    } catch {
      // ignore
    }
    resumeGuidedAfterShiftModalClose.current = false;
    resumeGuidedWhenHome.current = false;
    setGuidedSetupOpen(true);
  }

  function openAddEmployeeFromHeader() {
    if (!guardAdmin("manage employees")) {
      return;
    }
    setActiveTab("employees");
  }

  function openInviteTeamFromHome() {
    if (!guardAdmin("send team invites")) {
      return;
    }
    router.push("/invites");
  }

  function openPayrollOverviewFromHome() {
    if (!guardAdmin("open payroll")) {
      return;
    }
    setActiveTab("payroll-overview");
  }

  function openHomeMenuTab(tab: AppTab) {
    setActiveTab(tab);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openHomeMenuRoute(path: string) {
    router.push(path);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openScheduleMenuTab(tab: AppTab) {
    setActiveTab(tab);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openScheduleMenuRoute(path: string) {
    router.push(path);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openPeopleMenuTab(tab: AppTab) {
    if (!guardAdmin("manage people")) {
      return;
    }
    setActiveTab(tab);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openReportsMenuTab(tab: AppTab) {
    if (!guardAdmin("open reports")) {
      return;
    }
    setActiveTab(tab);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openPayrollSectionTab(tab: AppTab) {
    if (!guardAdmin("open payroll")) {
      return;
    }
    setActiveTab(tab);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
    if (tab === "payroll-overview") {
      setPayrollSelectedEmployee(null);
    }
  }

  function openSettingsMenuRoute(path: string) {
    if (!guardAdmin("open workspace settings")) {
      return;
    }
    router.push(path);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  function openUserMenuRoute(path: string) {
    router.push(path);
    setIsHomeMenuOpen(false);
    setIsScheduleMenuOpen(false);
    setIsPeopleMenuOpen(false);
    setIsReportsMenuOpen(false);
    setIsPayrollNavOpen(false);
    setIsSettingsMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  const dashboardDisplayName = useMemo(() => {
    const source = (employeeName || "").trim();
    if (!source) return "there";
    return source.split(/\s+/)[0] || source;
  }, [employeeName]);

  const navUserLabel = useMemo(() => {
    const source = (employeeName || "").trim();
    if (!source || source.toLowerCase() === "unknown user") return "User";
    if (source.includes("@")) {
      return source.split("@")[0] || "User";
    }
    return source;
  }, [employeeName]);

  const hasEmployees = employees.length > 0;
  const hasShifts = shifts.length > 0;
  const hasApprovedShifts = shifts.some((shift) => shift.approved);
  const hasRateConfigured = employees.some((employee) => employee.hourlyRate > 0);

  const setupCards = useMemo<SetupCard[]>(
    () => [
      {
        id: "team",
        title: "Set up your team",
        description: "Add your first employees and define default roles.",
        status: hasEmployees ? "completed" : "not_started",
        actionLabel: hasEmployees ? "Manage employees" : "Add employees",
        onAction: openAddEmployeeFromHeader,
      },
      {
        id: "schedule",
        title: "Start scheduling",
        description: "Create your first shift and plan this week.",
        status: hasShifts ? "completed" : hasEmployees ? "in_progress" : "not_started",
        actionLabel: hasShifts ? "Open schedule" : "Create first shift",
        onAction: openCreateShiftFromHeader,
      },
      {
        id: "payroll",
        title: "Review payroll setup",
        description: "Check rates, worked hours, and payroll visibility.",
        status: hasApprovedShifts || (hasShifts && hasRateConfigured)
          ? "completed"
          : hasEmployees
          ? "in_progress"
          : "not_started",
        actionLabel: "Open payroll",
        onAction: openPayrollOverviewFromHome,
      },
      {
        id: "invite",
        title: "Invite your team",
        description: "Send access invites so staff can view shifts and clock in/out.",
        status: hasEmployees ? "in_progress" : "not_started",
        actionLabel: "Invite team",
        onAction: openInviteTeamFromHome,
      },
      {
        id: "checks",
        title: "Final checks",
        description: "Confirm your team and schedule are ready for operations.",
        status: hasEmployees && hasShifts ? "completed" : "not_started",
        actionLabel: "Open schedule",
        onAction: openCreateShiftFromHeader,
      },
    ],
    [
      hasApprovedShifts,
      hasEmployees,
      hasRateConfigured,
      hasShifts,
      openAddEmployeeFromHeader,
      openCreateShiftFromHeader,
      openInviteTeamFromHome,
      openPayrollOverviewFromHome,
    ]
  );

  return (
    <main className="flex min-h-screen w-full flex-col bg-slate-200/40 text-slate-900">
      <datalist id="role-suggestions">
        {roleSuggestions.map((role) => (
          <option key={role} value={role} />
        ))}
      </datalist>
      <WorkspaceAppNav
        isAdmin={isAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navUserLabel={navUserLabel}
        isHomeMenuOpen={isHomeMenuOpen}
        isScheduleMenuOpen={isScheduleMenuOpen}
        isPeopleMenuOpen={isPeopleMenuOpen}
        isReportsMenuOpen={isReportsMenuOpen}
        isPayrollNavOpen={isPayrollNavOpen}
        isSettingsMenuOpen={isSettingsMenuOpen}
        isUserMenuOpen={isUserMenuOpen}
        onToggleHomeMenu={toggleHomeMenu}
        onToggleScheduleMenu={toggleScheduleMenu}
        onTogglePeopleMenu={togglePeopleMenu}
        onToggleReportsMenu={toggleReportsMenu}
        onTogglePayrollNavMenu={togglePayrollNavMenu}
        onToggleSettingsMenu={toggleSettingsMenu}
        onToggleUserMenu={toggleUserMenu}
        closeAllNavMenus={closeAllNavMenus}
        openHomeMenuTab={openHomeMenuTab}
        openHomeMenuRoute={openHomeMenuRoute}
        openScheduleMenuTab={openScheduleMenuTab}
        openScheduleMenuRoute={openScheduleMenuRoute}
        openPeopleMenuTab={openPeopleMenuTab}
        openReportsMenuTab={openReportsMenuTab}
        openPayrollSectionTab={openPayrollSectionTab}
        openSettingsMenuRoute={openSettingsMenuRoute}
        openUserMenuRoute={openUserMenuRoute}
        onLogout={handleLogout}
      />

        {isAdmin && showShiftForm ? (
          <ShiftFormModal
            workspaceName={workspaceName}
            form={form}
            setForm={setForm}
            editingId={editingId}
            activeEmployees={activeEmployees}
            roleSuggestions={roleSuggestions}
            isFormEmployeeUnavailable={isFormEmployeeUnavailable}
            dayAvailabilityByEmployee={shiftDayAvailabilityByEmployee}
            handleEmployeeChange={handleEmployeeChange}
            saveShift={saveShift}
            onDismiss={resetForm}
          />
        ) : null}

        {isAdmin ? (
          <GuidedWorkspaceSetup
            open={guidedSetupOpen}
            hasEmployeeGroups={employeeGroups.length > 0}
            hasEmployees={hasEmployees}
            hasShifts={hasShifts}
            onDismiss={dismissGuidedSetup}
            onCreateDefaultGroup={ensureDefaultEmployeeGroup}
            onOpenEmployeeGroups={openEmployeeGroupsFromGuided}
            onOpenEmployees={openEmployeesFromGuided}
            onCreateShift={guidedCreateShift}
          />
        ) : null}

        <div className="flex w-full flex-1 flex-col px-4 pb-10 pt-4 xl:px-6 2xl:px-8">
        {/* B + C — dashboard hero + actions/stats (home only) */}
        {activeTab === "home" ? (
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white p-5 shadow-sm md:p-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {isAdmin ? "Let’s plan your week 👋" : "Welcome back 👋"}
              </h1>
              <p className="text-sm text-slate-500">
                {workspaceName}
                {workspaceCvr ? (
                  <span className="text-slate-400"> · CVR {workspaceCvr}</span>
                ) : null}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={openCreateShiftFromHeader}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Create Shift
                  </button>
                ) : null}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={openAddEmployeeFromHeader}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Add Employee
                  </button>
                ) : null}
                {normalizedRole === "owner" ? (
                  <Link
                    href="/invites"
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Invite
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  Log out
                </button>
              </div>

              <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:max-w-2xl lg:flex-1">
                {isAdmin ? (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Total Shifts
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {shifts.length}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Planned Hours
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {dayHours.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Actual Hours
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {dayWorkedHours.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Employees
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {activeEmployees.length}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        My Shifts
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {myStats.shifts}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Planned Hours
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {myStats.planned.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Approved Hours
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {myStats.approved.toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Worked Hours
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
                        {myStats.worked.toFixed(1)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}

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

        {activeTab === "home" && isAdmin ? (
          <HomeDashboardSection
            displayName={dashboardDisplayName}
            workspaceName={workspaceName}
            setupCards={setupCards}
            onAddEmployee={openAddEmployeeFromHeader}
            onCreateShift={openCreateShiftFromHeader}
            onInviteTeam={openInviteTeamFromHome}
            onReviewPayroll={openPayrollOverviewFromHome}
            showPayrollCta
            showRunSetupGuide={!hasShifts}
            onRunSetupGuide={openRunSetupGuideFromHome}
          />
        ) : null}

        {activeTab === "schedule" && (
  <ScheduleSection
    weekStartsOn={weekPref}
    weekStart={weekStart}
    setWeekStart={setWeekStart}
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
    onCreateShiftCta={openCreateShiftFromHeader}
    onAddEmployeeCta={openAddEmployeeFromHeader}
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
            getPlannedHours={getPlannedHours}
            getWorkedHours={getWorkedHours}
            employeeNames={employeeNames}
            employees={employees}
            monthlyHours={monthlyHours}
            formatHours={formatHours}
            employeeName={employeeName}
            monthNames={monthNames}
            selectedDate={selectedDate}
            onMonthPlannerSelectDay={onMonthPlannerSelectDay}
            isAdmin={isAdmin}
            scheduleGridEmployees={scheduleGridEmployees}
            employeeRoleMap={employeeRoleMap}
            setSelectedDate={setSelectedDate}
            setForm={setForm}
            setOpenMenuId={setOpenMenuId}
            setEditingId={setEditingId}
            setShiftRoleMode={setShiftRoleMode}
            setShowShiftForm={setShowShiftForm}
            startEdit={startEdit}
            onCreateShiftCta={openCreateShiftFromHeader}
          />
        )}
            
        {isAdmin && activeTab === "reports-timesheets" && (
          <TimesheetsReport
            workspaceName={workspaceName}
            filteredShifts={timesheetReportFilteredShifts}
            employees={employees}
            employeeGroups={employeeGroups}
            employeeRateMap={employeeRateMap}
            dateFrom={reportTimesheetFrom}
            dateTo={reportTimesheetTo}
            onDateFromChange={setReportTimesheetFrom}
            onDateToChange={setReportTimesheetTo}
            employeeFilter={reportTimesheetEmployee}
            onEmployeeFilterChange={setReportTimesheetEmployee}
            groupFilter={reportTimesheetGroup}
            onGroupFilterChange={setReportTimesheetGroup}
            formatDKK={formatCurrency}
            onExportCsv={downloadTimesheetsReportCsv}
            onExportPdf={downloadTimesheetsReportPdf}
          />
        )}
        {isAdmin && activeTab === "payroll-overview" && (
          <PayrollOverview
            workspaceName={workspaceName}
            periodLabel={payrollPeriodLabel}
            rangeMode={payrollRangeMode}
            onRangeModeChange={setPayrollRangeMode}
            monthValue={payrollOverviewMonth}
            onMonthChange={setPayrollOverviewMonth}
            yearValue={payrollOverviewYear}
            onYearChange={setPayrollOverviewYear}
            yearsAvailable={yearsAvailable}
            monthNames={monthNames}
            onWeekPrev={payrollWeekPrev}
            onWeekNext={payrollWeekNext}
            customFrom={payrollCustomFrom}
            customTo={payrollCustomTo}
            onCustomFromChange={setPayrollCustomFrom}
            onCustomToChange={setPayrollCustomTo}
            employeeFilter={payrollTableEmployeeFilter}
            onEmployeeFilterChange={setPayrollTableEmployeeFilter}
            employeeNames={employeeNames}
            rows={payrollOverviewRows}
            totalHours={payrollOverviewTotals.totalHours}
            totalPayrollCost={payrollOverviewTotals.totalPayrollCost}
            averageHourlyCost={payrollOverviewTotals.averageHourlyCost}
            formatDKK={formatCurrency}
            currencyCode={currencyCode}
            onRowClick={(name) => {
              setPayrollSelectedEmployee(name);
              setActiveTab("payroll-employee");
            }}
            onExportCsv={downloadPayrollCsv}
            onExportPdf={downloadPayrollPdf}
          />
        )}
        {isAdmin && activeTab === "payroll-employee" && payrollSelectedEmployee ? (
          <EmployeePayrollDetail
            workspaceName={workspaceName}
            employeeName={payrollSelectedEmployee}
            periodLabel={payrollPeriodLabel}
            hourlyRate={payrollEmployeeDetailTotals.rate}
            totalHours={payrollEmployeeDetailTotals.totalHours}
            totalEarnings={payrollEmployeeDetailTotals.totalEarnings}
            shifts={payrollEmployeeDetailShifts}
            formatDKK={formatCurrency}
            currencyCode={currencyCode}
            onBack={() => {
              setPayrollSelectedEmployee(null);
              setActiveTab("payroll-overview");
            }}
          />
        ) : null}
              
          
       {isAdmin && activeTab === "employees" && (
          <EmployeesSection
            sortedEmployeesData={sortedEmployeesData}
            roleSuggestions={roleSuggestions}
            addEmployee={addEmployee}
            setEmployeeActiveStatus={setEmployeeActiveStatus}
            deleteEmployee={deleteEmployee}
            updateEmployeeName={updateEmployeeName}
            updateEmployeeRate={updateEmployeeRate}
            updateEmployeeRole={updateEmployeeRole}
            updateEmployeeGroup={updateEmployeeGroup}
            employeeGroups={employeeGroups}
            availabilityDrafts={availabilityDrafts}
            updateAvailabilityDraft={updateAvailabilityDraft}
            addUnavailableDate={addUnavailableDate}
            removeUnavailableDate={removeUnavailableDate}
          />
        )}
        {isAdmin && activeTab === "employee-groups" && (
          <EmployeeGroupsSection
            companyId={activeCompanyId}
            supabase={supabase}
            onGroupsChanged={loadEmployeeGroups}
          />
        )}
                    
      </div>
    </main>
  );
}



