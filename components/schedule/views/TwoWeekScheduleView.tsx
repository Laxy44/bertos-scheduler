"use client";

import type { ComponentProps } from "react";
import ScheduleGrid from "../ScheduleGrid";

export default function TwoWeekScheduleView(props: ComponentProps<typeof ScheduleGrid>) {
  return <ScheduleGrid {...props} plannerVariant="two_week" />;
}
