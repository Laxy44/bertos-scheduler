"use client";

import { useActionState } from "react";

import { requestFreshInviteFromExpiredPage } from "./actions";

type Props = {
  initialEmail: string;
};

export function InviteExpiredClient({ initialEmail }: Props) {
  const [state, formAction, isPending] = useActionState(requestFreshInviteFromExpiredPage, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-slate-700">
          Work email on the invitation
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          defaultValue={initialEmail}
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
          placeholder="you@company.com"
        />
        <p className="mt-1 text-xs text-slate-500">
          If your invite is still valid, we will email you a fresh link. Only pending invitations can
          be resent this way.
        </p>
      </div>

      {state && !state.ok ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Email me a fresh link"}
      </button>
    </form>
  );
}
