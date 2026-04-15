import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { createInvite } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ActiveMembership = {
  company_id: string | null;
  role: string | null;
  companies: {
    name: string | null;
  } | null;
};

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

  const membership = await supabase
    .from("company_members")
    .select(
      `
        company_id,
        role,
        companies (
          name
        )
      `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<ActiveMembership>();

  if (membership.error || !membership.data?.company_id) {
    redirect("/create-company?message=Create a company first");
  }

  const role = (membership.data.role || "").toLowerCase();
  if (!["owner", "admin"].includes(role)) {
    redirect("/?message=Only company owners or admins can manage invites");
  }

  const pendingInvites = await supabase
    .from("invites")
    .select("id, email, role, status, created_at")
    .eq("company_id", membership.data.company_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Employee Invites</h1>
        <p className="mt-2 text-sm text-slate-500">
          Company: {membership.data.companies?.name || "Workspace"}
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
              <option value="manager">manager</option>
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
                <p key={invite.id}>
                  {invite.email} - {invite.role}
                </p>
              ))
            )}
          </div>
        </div>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
