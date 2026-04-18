import GeneralSettingsForm from "@/components/settings/GeneralSettingsForm";
import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";

export default async function GeneralSettingsPage() {
  const { company } = await requireSettingsAdmin();
  const week =
    (company.week_starts_on || "monday").toLowerCase() === "sunday" ? "sunday" : ("monday" as const);

  return (
    <GeneralSettingsForm
      initialName={company.name ?? ""}
      initialTimezone={company.timezone ?? "Europe/Copenhagen"}
      initialWeekStartsOn={week}
    />
  );
}
