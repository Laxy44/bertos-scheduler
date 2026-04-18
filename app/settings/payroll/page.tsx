import PayrollSettingsForm from "@/components/settings/PayrollSettingsForm";
import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";

export default async function PayrollSettingsPage() {
  const { company } = await requireSettingsAdmin();

  return (
    <PayrollSettingsForm
      initialCurrency={company.currency ?? "DKK"}
      initialDefaultHourlyWage={
        company.default_hourly_wage != null ? Number(company.default_hourly_wage) : null
      }
    />
  );
}
