import { getWorkspaceMembers } from "@/app/settings/actions";
import EmployeeSettingsForm from "@/components/settings/EmployeeSettingsForm";
import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";

export default async function EmployeeSettingsPage() {
  const { workspaceSettings } = await requireSettingsAdmin();
  const employee = workspaceSettings.employee || {};
  const members = await getWorkspaceMembers();

  return (
    <EmployeeSettingsForm
      initialShowEmail={Boolean(employee.showEmailField)}
      initialShowPhone={Boolean(employee.showPhoneField)}
      members={members}
    />
  );
}
