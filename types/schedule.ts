export type Shift = {
  id: number;
  employee: string;
  day: string;
  role: string;
  start: string;
  end: string;
  notes: string;
  date: string;
  actualStart?: string;
  actualEnd?: string;
};

export type EmployeeConfig = {
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

export type AppTab = "schedule" | "week" | "month" | "payroll" | "employees";