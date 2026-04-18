import { redirect } from "next/navigation";

/** Route kept for backwards compatibility; product no longer exposes Events in navigation. */
export default function EventsPage() {
  redirect("/");
}
