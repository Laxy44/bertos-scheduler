export type Shift = {
  id: string;
  employee: string;
  day: string;
  role: string;
  start: string;
  end: string;
  notes: string;
  date: string;
  actualStart?: string;
  actualEnd?: string;
  approved?: boolean;
};

export type EmployeeConfig = {
  id?: string;
  /** When set, matches auth.users(id) for this employee row */
  userId?: string | null;
  name: string;
  hourlyRate: number;
  defaultRole: string;
  unavailableDates: string[];
  active: boolean;
  /** Optional link to `employee_groups` for filtering and wage defaults */
  groupId?: string | null;
};

/** Workspace-scoped group (MVP: name + optional hourly wage). */
export type EmployeeGroupRow = {
  id: string;
  name: string;
  hourlyWage: number | null;
};

export type FormState = {
  employee: string;
  role: string;
  start: string;
  end: string;
  notes: string;
  date: string;
};

export type NewEmployeeForm = {
  name: string;
  hourlyRate: string;
  defaultRole: string;
};

export type AppTab =
  | "home"
  | "schedule"
  | "reports-timesheets"
  | "payroll-overview"
  | "payroll-employee"
  | "employees"
  | "employee-groups";