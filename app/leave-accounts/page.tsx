import { redirect } from "next/navigation";

/** Leave accounts removed from MVP; route retained for old links only. */
export default function LeaveAccountsPage() {
  redirect("/");
}
