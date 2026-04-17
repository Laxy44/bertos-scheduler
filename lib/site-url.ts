/**
 * Env-only URL (no request context). Prefer `getSiteUrlFromRequest` for emails and
 * redirects in production so the host matches the browser (custom domain vs *.vercel.app).
 */
export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/** Shared by `getSiteUrlFromRequest` and `getSiteUrlFromHeaders` (server-only wrapper). */
export function resolveSiteUrlFromHeaders(
  get: (name: string) => string | null | undefined
): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const forwardedHost = get("x-forwarded-host")?.trim();
  const host = (forwardedHost || get("host") || "").trim();
  if (!host) {
    return getSiteUrl();
  }

  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]");

  if (isLocal) {
    return `http://${host}`;
  }

  const protoHeader = get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const proto = protoHeader === "http" || protoHeader === "https" ? protoHeader : "https";
  return `${proto}://${host}`;
}

/** Use in Route Handlers so invite `redirect_to` matches the site the user is on. */
export function getSiteUrlFromRequest(request: Request): string {
  return resolveSiteUrlFromHeaders((name) => request.headers.get(name));
}
