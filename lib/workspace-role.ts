/**
 * Workspace authorization helpers (mirror server rules in API routes).
 * "Admin" here means company owner or admin — full scheduling and HR tooling.
 */
export function isCompanyAdminRole(role: string | null | undefined): boolean {
  const r = (role || "").trim().toLowerCase();
  return r === "owner" || r === "admin";
}

export function isCompanyMemberRole(role: string | null | undefined): boolean {
  const r = (role || "").trim().toLowerCase();
  return ["owner", "admin", "manager", "employee"].includes(r);
}
