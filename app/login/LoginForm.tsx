"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase";

type LoginFormProps = {
  loginAction: (formData: FormData) => void | Promise<void>;
  signupAction: (formData: FormData) => void | Promise<void>;
  sendPasswordResetAction: (formData: FormData) => void | Promise<void>;
  updatePasswordAction: (formData: FormData) => void | Promise<void>;
};

export function LoginForm({
  loginAction,
  signupAction,
  sendPasswordResetAction,
  updatePasswordAction,
}: LoginFormProps) {
  const supabase = createClient();
  const search = useSearchParams();
  const message = search.get("message") || undefined;

  const getInitialMode = () => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        return "recovery";
      }
    }
    return search.get("mode") || undefined;
  };

  const [mode, setMode] = useState<string | undefined>(getInitialMode());

  useEffect(() => {
    const exchangeSession = async () => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    exchangeSession();
    const nextMode = search.get("mode");

    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        setMode("recovery");
        return;
      }
    }

    if (nextMode) {
      setMode(nextMode);
      return;
    }

    setMode(undefined);
  }, [search, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "forgot" || mode === "recovery" ? "Reset password" : "Login"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "forgot"
            ? "Enter your email and we’ll send you a password reset link"
            : mode === "recovery"
              ? "Enter your new password"
              : "Sign in to access Planyo"}
        </p>

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

        <form className="mt-6 space-y-4">
          {mode !== "recovery" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                placeholder="you@example.com"
              />
            </div>
          ) : null}

          {mode !== "forgot" && mode !== "recovery" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                name="password"
                type="password"
                required
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
          ) : mode === "recovery" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="Confirm password"
                />
              </div>

              <div className="space-y-3">
                <button
                  formAction={updatePasswordAction}
                  className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500"
                >
                  Update Password
                </button>

                <Link
                  href="/login"
                  className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-3">
                <button
                  formAction={loginAction}
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Login
                </button>

                <button
                  formAction={signupAction}
                  className="flex-1 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Sign up
                </button>
              </div>

              <Link
                href="/login?mode=forgot"
                className="block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Forgot password?
              </Link>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

export default LoginForm;
