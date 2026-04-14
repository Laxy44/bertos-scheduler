"use client";

import { login, signup, sendPasswordReset, updatePassword } from "./actions";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
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
    const m = search.get("mode");

    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
        setMode("recovery");
        return;
      }
    }

    if (m) setMode(m);
  }, [search]);
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "forgot" || mode === "recovery" ? "Reset password" : "Login"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "forgot"
            ? "Enter your email and we’ll send you a password reset link"
            : mode === "recovery"
            ? "Enter your new password"
            : "Sign in to access the scheduler"}
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
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
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
          ) : null}

          {mode === "forgot" ? (
            <div className="space-y-3">
              <button
                formAction={sendPasswordReset}
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
                formAction={updatePassword}
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
                  formAction={login}
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Login
                </button>

                <button
                  formAction={signup}
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