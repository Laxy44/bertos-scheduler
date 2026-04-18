import { redirect } from "next/navigation";

/** Route kept for backwards compatibility; product no longer exposes News in navigation. */
export default function NewsPage() {
  redirect("/");
}
