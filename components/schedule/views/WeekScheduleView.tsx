"use client";

import type { ComponentProps } from "react";
import ScheduleGrid from "../ScheduleGrid";

export default function WeekScheduleView(props: ComponentProps<typeof ScheduleGrid>) {
  return <ScheduleGrid {...props} plannerVariant="week" />;
}
