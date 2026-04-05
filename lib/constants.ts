import type { EmployeeConfig } from "../types/schedule";

export const COMPANY_NAME = "Bertos Gastronomia ApS";
export const COMPANY_CVR = "45080021";

export const defaultEmployees: EmployeeConfig[] = [
  {
    name: "Ali",
    hourlyRate: 140,
    defaultRole: "Kitchen",
    unavailableDates: [],
    active: true,
  },
  {
    name: "Ram",
    hourlyRate: 135,
    defaultRole: "Service",
    unavailableDates: [],
    active: true,
  },
  {
    name: "Sita",
    hourlyRate: 130,
    defaultRole: "Prep",
    unavailableDates: [],
    active: true,
  },
  {
    name: "Maya",
    hourlyRate: 130,
    defaultRole: "Service",
    unavailableDates: [],
    active: true,
  },
  {
    name: "Jonas",
    hourlyRate: 145,
    defaultRole: "Delivery",
    unavailableDates: [],
    active: true,
  },
  {
    name: "Sara",
    hourlyRate: 138,
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
];

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
];