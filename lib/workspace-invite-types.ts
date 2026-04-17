export type WorkspaceInviteRow = {
  id: string;
  email: string;
  company_id: string;
  role: string | null;
  status: string;
  created_at?: string;
  expires_at?: string | null;
};

export function isInviteRowExpired(row: Pick<WorkspaceInviteRow, "status" | "expires_at">) {
  if (row.status !== "pending") return false;
  if (!row.expires_at) return false;
  return new Date(row.expires_at).getTime() < Date.now();
}
