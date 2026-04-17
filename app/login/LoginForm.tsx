"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type LoginFormProps = {
  loginAction: (formData: FormData) => void | Promise<void>;
  sendPasswordResetAction: (formData: FormData) => void | Promise<void>;
};

export function LoginForm({
  loginAction,
  sendPasswordResetAction,
}: LoginFormProps) {
  const search = useSearchParams();
  const message = search.get("message") || undefined;
  const mode = search.get("mode") ?? undefined;
  const confirmed = search.get("confirmed") === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "forgot" ? "Reset password" : "Login"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "forgot"
            ? "Enter your email and we’ll send you a password reset link"
            : "Sign in to access Planyo"}
        </p>

        {confirmed ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
            Email confirmed successfully. You can now log in.
          </div>
        ) : null}

        {message ? (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ring-1 ${
              message.toLowerCase().includes("success") || message.toLowerCase().includes("sent")
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"
            }`}
          >
            {message}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" autoComplete="off">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete={mode === "forgot" ? "email" : "off"}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="you@example.com"
            />
          </div>

          {mode !== "forgot" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="Your password"
              />
            </div>
          ) : null}

          {mode === "forgot" ? (
            <div className="space-y-3">
              <button
                formAction={sendPasswordResetAction}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Send reset link
              </button>

              <Link
                href="/login"
                className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <button
                formAction={loginAction}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Login
              </button>

              <Link
                href="/login?mode=forgot"
                className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Forgot password?
              </Link>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-600">
                  New business owner? Start your workspace setup.
                </p>
                <Link
                  href="/create-company"
                  className="mt-3 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
                >
                  Create new company
                </Link>

                <Link
                  href="/complete-account"
                  className="mt-2 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Join with invite
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

export default LoginForm;
