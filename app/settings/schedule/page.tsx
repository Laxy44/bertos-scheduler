import ScheduleSettingsForm from "@/components/settings/ScheduleSettingsForm";
import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";

export default async function ScheduleSettingsPage() {
  const { workspaceSettings } = await requireSettingsAdmin();
  const schedule = workspaceSettings.schedule || {};

  return (
    <ScheduleSettingsForm
      initialShiftTypes={schedule.shiftTypes ?? []}
      initialDefaultBreakMinutes={schedule.breakRules?.defaultBreakMinutes}
      initialMinGapMinutes={schedule.breakRules?.minGapBetweenShiftsMinutes}
    />
  );
}
