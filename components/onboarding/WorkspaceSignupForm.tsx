"use client";

import { useActionState, useEffect, useState } from "react";

type ActionState = {
  error: string | null;
};

type WorkspaceSignupFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialMessage?: string;
  isLoggedInWithoutMembership: boolean;
  existingUserEmail: string;
};

const INITIAL: ActionState = { error: null };

export default function WorkspaceSignupForm({
  action,
  initialMessage,
  isLoggedInWithoutMembership,
  existingUserEmail,
}: WorkspaceSignupFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(existingUserEmail);
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [localError, setLocalError] = useState<string | null>(initialMessage || null);

  const [state, formAction, pending] = useActionState(action, INITIAL);

  useEffect(() => {
    if (isLoggedInWithoutMembership && existingUserEmail) {
      setEmail(existingUserEmail);
    }
  }, [isLoggedInWithoutMembership, existingUserEmail]);

  function validate(): boolean {
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("Please enter your first and last name.");
      return false;
    }
    if (!isLoggedInWithoutMembership) {
      if (!email.trim()) {
        setLocalError("Please enter your work email.");
        return false;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return false;
      }
    }
    if (!workspaceName.trim()) {
      setLocalError("Please enter a workspace name.");
      return false;
    }
    setLocalError(null);
    return true;
  }

  const activeError = localError || state.error;

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5"
      onSubmit={(e) => {
        if (!validate()) e.preventDefault();
      }}
    >
      <input
        type="text"
        name="fake_username"
        autoComplete="username"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />
      <input
        type="password"
        name="fake_password"
        autoComplete="current-password"
        tabIndex={-1}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
          <input
            name="display_first_name"
            value={firstName}
            autoComplete="given-name"
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            placeholder="Alex"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
          <input
            name="display_last_name"
            value={lastName}
            autoComplete="family-name"
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            placeholder="Jensen"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Work email</label>
        <input
          type="email"
          name="display_email"
          value={email}
          autoComplete="email"
          disabled={isLoggedInWithoutMembership}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-50 disabled:text-slate-500"
          placeholder="you@company.com"
        />
      </div>

      {!isLoggedInWithoutMembership ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            name="display_password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            placeholder="At least 6 characters"
          />
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
          You&apos;re signed in — we&apos;ll create this workspace under{" "}
          <span className="font-medium text-slate-900">{existingUserEmail || email}</span>.
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Workspace name</label>
        <input
          name="display_workspace"
          value={workspaceName}
          autoComplete="organization"
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          placeholder="e.g. North Café"
        />
      </div>

      <input type="hidden" name="first_name" value={firstName} />
      <input type="hidden" name="last_name" value={lastName} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="password" value={password} />
      <input type="hidden" name="company_name" value={workspaceName} />
      <input type="hidden" name="skip_team" value="true" />
      <input type="hidden" name="employees_json" value="[]" />
      <input type="hidden" name="send_invites" value="false" />

      {activeError ? (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          {activeError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Creating workspace…" : "Create workspace"}
      </button>
    </form>
  );
}
