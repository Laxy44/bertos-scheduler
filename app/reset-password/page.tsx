"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authDebug } from "../../lib/auth-debug";
import { createClient } from "../../lib/supabase";

function ResetPasswordInner() {
  const search = useSearchParams();
  const initialMessage = search.get("message") || undefined;

  const [phase, setPhase] = useState<"loading" | "ready" | "no-session">("loading");
  const [message, setMessage] = useState<string | undefined>(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      authDebug("reset-password client getSession", {
        hasSession: Boolean(session),
        userId: session?.user?.id ?? null,
      });
      if (cancelled) return;
      if (!session) {
        setPhase("no-session");
        return;
      }
      setPhase("ready");
    }
    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(formData: FormData) {
    if (isSubmitting) return;
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!password || password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    window.location.assign(
      `/login?message=${encodeURIComponent("Password updated. Sign in with your new password.")}`
    );
  }

  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
          <p className="mt-2 text-sm text-slate-600">Checking your session…</p>
        </div>
      </main>
    );
  }

  if (phase === "no-session") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Session required</h1>
          <p className="mt-2 text-sm text-slate-600">
            Open the password reset link from your email. It starts at{" "}
            <span className="font-mono text-slate-800">/auth/callback</span> so your session is set
            before this page.
          </p>
          <Link
            href="/login?mode=forgot"
            className="mt-6 inline-block rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Request a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Choose a new password for your account, then sign in.
        </p>

        {message ? (
          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ring-1 ${
              message.toLowerCase().includes("success") || message.toLowerCase().includes("updated")
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"
            }`}
          >
            {message}
          </div>
        ) : null}

        <form
          className="mt-6 space-y-4"
          autoComplete="off"
          action={handleSubmit}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-500"
          >
            {isSubmitting ? "Saving..." : "Save password"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
            <p className="mt-2 text-sm text-slate-600">Loading…</p>
          </div>
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
