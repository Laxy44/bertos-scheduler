"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authDebug } from "../../../lib/auth-debug";
import { resolveAuthCallbackDestination } from "../../../lib/auth-callback-redirect";
import { createClient } from "../../../lib/supabase";

function authErrorPath(message: string) {
  return `/auth/error?message=${encodeURIComponent(message)}`;
}

function CallbackClientInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = createClient();
      const code = search.get("code");
      const tokenHash = search.get("token_hash");
      const typeParam = search.get("type");

      authDebug("callback client fallback entry", {
        hasCode: Boolean(code),
        hasHash: Boolean(typeof window !== "undefined" && window.location.hash),
      });

      if (code) {
        const {
          data: { session: existing },
        } = await supabase.auth.getSession();
        if (!existing) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            router.replace(authErrorPath(error.message));
            return;
          }
        }
      } else {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            router.replace(
              authErrorPath(
                "This auth link has expired or was already used. Request a new one."
              )
            );
            return;
          }
        } else if (tokenHash && typeParam) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: typeParam as
              | "signup"
              | "invite"
              | "magiclink"
              | "recovery"
              | "email_change"
              | "email",
          });
          if (otpError) {
            router.replace(authErrorPath(otpError.message));
            return;
          }
        } else {
          setErrorMessage("Missing auth parameters. Open the full link from your email.");
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      authDebug("callback client fallback session", {
        hasSession: Boolean(session),
        userId: session?.user?.id ?? null,
      });
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG === "1") {
        console.log("SESSION:", session);
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace(
          authErrorPath("Unable to verify this session. Try opening the link again.")
        );
        return;
      }

      const sp = new URLSearchParams();
      search.forEach((value, key) => sp.set(key, value));
      // Hash fragment params are client-only; carry them into callback destination logic.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      hashParams.forEach((value, key) => {
        if (!sp.has(key)) sp.set(key, value);
      });

      const destination = await resolveAuthCallbackDestination(supabase, sp, user);
      router.replace(destination);
    }

    void run();
  }, [router, search]);

  if (errorMessage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Link incomplete</h1>
          <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Completing secure sign-in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please wait while we verify your link and continue.
        </p>
      </div>
    </main>
  );
}

export function CallbackClientFallback() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Completing secure sign-in</h1>
            <p className="mt-2 text-sm text-slate-600">Loading…</p>
          </div>
        </main>
      }
    >
      <CallbackClientInner />
    </Suspense>
  );
}
