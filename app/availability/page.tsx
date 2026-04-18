import { redirect } from "next/navigation";

/** Availability lives on Your availability; route retained for old links only. */
export default function AvailabilityPage() {
  redirect("/your-availability");
}
