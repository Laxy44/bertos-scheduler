"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import AdminScheduleBoard from "./AdminScheduleBoard";
import EmployeeScheduleBoard from "./EmployeeScheduleBoard";

/**
 * Routes to the admin planner or the employee personal schedule based on workspace role.
 */
export default function ScheduleSection(props: any) {
  if (props.isAdmin) {
    return <AdminScheduleBoard {...props} />;
  }
  return <EmployeeScheduleBoard {...props} />;
}
