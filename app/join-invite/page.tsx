import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getActiveMembership } from "../../lib/auth";
import {
  continueJoinInvite,
  loginOrSignupAndJoinInvite,
  signOutFromJoinInvite,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function JoinInvitePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  const message = readParam(params.message);
  const email = readParam(params.email);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activeMembership = user ? await getActiveMembership(supabase, user.id) : null;
  if (activeMembership) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Join with invite</h1>
        <p className="mt-2 text-sm text-slate-500">
          Join your company workspace with your invited email.
        </p>

        {message ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            {message}
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {!email ? (
            <form action={continueJoinInvite} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Invite Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={user?.email || ""}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="you@company.com"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Continue
              </button>
            </form>
          ) : (
            <form action={loginOrSignupAndJoinInvite} className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Enter password to continue
              </h2>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                Invite email: <span className="font-semibold">{email}</span>
              </div>
              <input type="hidden" name="email" value={email} />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="Your password"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Continue
              </button>
            </form>
          )}

          {user ? (
            <form action={signOutFromJoinInvite}>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
              >
                Sign Out
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
          If you are a business owner instead, use Create company onboarding.
        </div>

        <div className="mt-4 flex items-center justify-between text-sm font-medium">
          <Link href="/create-company" className="text-slate-600 hover:text-slate-900">
            Create company
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
