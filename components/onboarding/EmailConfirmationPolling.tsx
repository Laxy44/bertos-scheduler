"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase";

type EmailConfirmationPollingProps = {
  ownerEmail: string;
  enabled: boolean;
};

export default function EmailConfirmationPolling({
  ownerEmail,
  enabled,
}: EmailConfirmationPollingProps) {
  const router = useRouter();
  const [dots, setDots] = useState(".");
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setInterval(() => {
      setDots((current) => (current.length >= 3 ? "." : `${current}.`));
    }, 500);

    return () => window.clearInterval(timer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const supabase = createClient();

    const checkConfirmation = async () => {
      if (cancelled || isRedirectingRef.current) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const normalizedOwner = ownerEmail.trim().toLowerCase();
      const normalizedUser = (user.email || "").trim().toLowerCase();
      if (normalizedOwner && normalizedUser && normalizedOwner !== normalizedUser) {
        return;
      }

      if (!user.email_confirmed_at) return;

      isRedirectingRef.current = true;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      router.replace(session ? "/" : "/login?confirmed=1");
    };

    void checkConfirmation();
    const intervalId = window.setInterval(() => {
      void checkConfirmation();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, ownerEmail, router]);

  if (!enabled) return null;

  return (
    <p className="mt-3 text-sm text-slate-500" aria-live="polite">
      Waiting for email confirmation{dots}
    </p>
  );
}
