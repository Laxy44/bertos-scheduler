import type { EmployeeConfig } from "../types/schedule";

// Transitional workspace fallbacks only.
// These values keep the app usable before real multi-company data
// comes from the database through company/company_members tables.
export const COMPANY_NAME = "Planyo Workspace";
export const COMPANY_CVR = "";

// Seed data fallback only.
// In the SaaS version, employees should come from the database per company.
export const defaultEmployees: EmployeeConfig[] = [
  {
    name: "Employee 1",
    hourlyRate: 140,
    defaultRole: "Kitchen",
    unavailableDates: [],
    active: true,
  },
  {
    name: "Employee 2",
    hourlyRate: 135,
    defaultRole: "Service",
    unavailableDates: [],
    active: true,
  },
];

export const roles = ["Kitchen", "Service", "Delivery", "Prep"];
export const CUSTOM_ROLE_OPTION = "__custom__";

export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
