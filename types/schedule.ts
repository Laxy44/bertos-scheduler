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
  name: string;
  hourlyRate: number;
  defaultRole: string;
  unavailableDates: string[];
  active: boolean;
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

export type AppTab = "home" | "schedule" | "week" | "month" | "payroll" | "employees";