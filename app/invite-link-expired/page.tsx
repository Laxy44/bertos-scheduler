import Link from "next/link";

import { InviteExpiredClient } from "./invite-expired-client";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function InviteLinkExpiredPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = readParam(params.email);
  const reason = readParam(params.reason);
  const authMessage = readParam(params.message);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">This sign-in link expired</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Workspace invitations use time-limited links for security. If the email sat in your inbox
          for a while, the original link may no longer work — that does not always mean your invite
          is gone.
        </p>
        {authMessage ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {authMessage}
          </div>
        ) : null}

        {reason ? (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Reason: {reason}
          </p>
        ) : null}

        <InviteExpiredClient initialEmail={email || ""} />

        <div className="mt-8 space-y-2 border-t border-slate-100 pt-6 text-sm text-slate-600">
          <p>Already set a password?</p>
          <Link
            href="/login"
            className="font-semibold text-indigo-700 underline-offset-2 hover:text-indigo-900 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
