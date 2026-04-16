import Link from "next/link";
import { createCompany } from "./actions";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getActiveMembership } from "../../lib/auth";
import { redirect } from "next/navigation";

type CreateCompanyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  value: string | string[] | undefined
) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreateCompanyPage({
  searchParams,
}: CreateCompanyPageProps) {
  const params = await searchParams;
  const message = readParam(params.message);
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const membershipId = user ? await getActiveMembership(supabase, user.id) : null;
  const isLoggedInWithoutMembership = Boolean(user && !membershipId);

  if (user && membershipId) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create company</h1>
        <p className="mt-2 text-sm text-slate-500">
          Set up your business workspace as the owner.
        </p>

        {message ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            {message}
          </div>
        ) : null}

        <form action={createCompany} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Company Name
            </label>
            <input
              name="companyName"
              type="text"
              required
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Your Company ApS"
            />
          </div>

          {!isLoggedInWithoutMembership ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Owner Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="owner@company.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Owner Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="Create a secure password"
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
              You are logged in. This company will be created under your current account.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Create company
          </button>
        </form>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-700">Invited employees</p>
          <p className="mt-1 text-sm text-slate-600">
            Already invited by a company owner? Use join with invite.
          </p>
          <Link
            href="/complete-account"
            className="mt-3 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            Join with invite
          </Link>
        </div>

        <Link
          href="/login"
          className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
