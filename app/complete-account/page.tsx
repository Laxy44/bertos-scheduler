import Link from "next/link";
import { redirect } from "next/navigation";
import { authDebug } from "../../lib/auth-debug";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getActiveMembership } from "../../lib/auth";
import {
  continueCompleteAccount,
  loginOrSignupAndCompleteInvite,
  signOutFromCompleteAccount,
} from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CompleteAccountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const params = await searchParams;
  const message = readParam(params.message);
  const email = readParam(params.email);
  const emailVerifiedFromLink = readParam(params.verified) === "1";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  authDebug("complete-account SSR", {
    hasUser: Boolean(user),
    userId: user?.id ?? null,
    hasEmailParam: Boolean(email),
  });

  const activeMembership = user ? await getActiveMembership(supabase, user.id) : null;
  if (activeMembership) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Complete your account</h1>
        <p className="mt-2 text-sm text-slate-500">
          Set a password and join your company workspace using your invited email.
        </p>

        {emailVerifiedFromLink && email ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
            Email confirmed. Create a password below to finish joining your workspace.
          </div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
            <div className="flex items-start justify-between gap-4">
              <p>{message}</p>
              <Link
                href={
                  email
                    ? `/complete-account?email=${encodeURIComponent(email)}${emailVerifiedFromLink ? "&verified=1" : ""}`
                    : "/complete-account"
                }
                className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900"
              >
                Dismiss
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {!email ? (
            <form action={continueCompleteAccount} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Invite email
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
            <form action={loginOrSignupAndCompleteInvite} className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Create password
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
                  minLength={6}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                  placeholder="At least 6 characters"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Join workspace
              </button>
            </form>
          )}

          {user ? (
            <form action={signOutFromCompleteAccount}>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
          Business owner? Use create company instead.
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
