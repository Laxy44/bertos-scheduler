import { headers } from "next/headers";
import { resolveSiteUrlFromHeaders } from "./site-url";

/** Server Actions / RSC: same host logic as `getSiteUrlFromRequest` without a `Request`. */
export async function getSiteUrlFromHeaders(): Promise<string> {
  const h = await headers();
  return resolveSiteUrlFromHeaders((name) => h.get(name));
}
