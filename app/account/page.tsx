import { redirect } from "next/navigation";

export default function AccountDeprecatedPage() {
  redirect("/settings/general");
}
