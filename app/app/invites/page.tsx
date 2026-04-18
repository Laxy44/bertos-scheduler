import Link from "next/link";
import { redirect } from "next/navigation";
import { getCachedWorkspaceForUser } from "@/lib/cached-workspace-load";
import { createServerSupabaseClient } from "../../../lib/supabase-server";
import { cancelInvite, createInvite, resendInvite } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function InvitesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  const message = readParam(params.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=Please log in to manage invites");
  }

  const workspace = await getCachedWorkspaceForUser(user.id);
  if (workspace.kind === "conflict") {
    redirect("/workspace-conflict");
  }
  if (workspace.kind === "none") {
    redirect("/create-company?message=Create a company first");
  }

  const activeMembership = workspace.membership;
  const companyName = workspace.company?.name ?? null;

  const role = (activeMembership.role || "").toLowerCase();
  if (!["owner", "admin"].includes(role)) {
    redirect("/app?message=Only company owners or admins can manage invites");
  }

  const pendingInvites = await supabase
    .from("invites")
    .select("id, email, role, status, created_at")
    .eq("company_id", activeMembership.company_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Employee Invites</h1>
        <p className="mt-2 text-sm text-slate-500">
          Company: {companyName || "Workspace"}
        </p>

        {message ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            {message}
          </div>
        ) : null}

        <form action={createInvite} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Employee Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="employee@company.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              name="role"
              defaultValue="employee"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            >
              <option value="employee">employee</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Create Invite
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-700">Pending invites</p>
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            {(pendingInvites.data || []).length === 0 ? (
              <p>No pending invites yet.</p>
            ) : (
              pendingInvites.data?.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between gap-3">
                  <p className="truncate flex-1">
                    {invite.email} - {invite.role} ({invite.status})
                  </p>
                  <div className="flex items-center gap-2">
                    <form action={resendInvite}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <input type="hidden" name="inviteEmail" value={invite.email} />
                      <button
                        type="submit"
                        className="rounded-xl bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                      >
                        Resend
                      </button>
                    </form>
                    <form action={cancelInvite}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                      >
                        Revoke
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Link
          href="/app"
          className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
