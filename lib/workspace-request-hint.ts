/**
 * Internal request header set by `proxy.ts` when the user has exactly one active workspace.
 * RSC loaders may use it to skip the broad `company_members` list query (still verified with DB).
 */
export const WORKSPACE_PROXY_COMPANY_HEADER = "x-planyo-proxy-company-id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseProxyCompanyIdHint(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  return UUID_RE.test(trimmed) ? trimmed : null;
}
