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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const isRedirectingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (isConfirmed) return;

    const timer = window.setInterval(() => {
      setDots((current) => (current.length >= 3 ? "." : `${current}.`));
    }, 500);

    return () => window.clearInterval(timer);
  }, [enabled, isConfirmed]);

  useEffect(() => {
    if (!enabled) return;
    if (isConfirmed) return;

    let cancelled = false;
    const supabase = createClient();
    let intervalId: number | null = null;

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
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      setIsConfirmed(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      timeoutRef.current = window.setTimeout(() => {
        if (cancelled) return;
        router.replace(session ? "/app" : "/login?confirmed=1");
      }, 650);
    };

    void checkConfirmation();
    intervalId = window.setInterval(() => {
      void checkConfirmation();
    }, 2500);

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [enabled, isConfirmed, ownerEmail, router]);

  if (!enabled) return null;

  return (
    <p className="mt-3 text-sm text-slate-500" aria-live="polite">
      {isConfirmed ? "Email confirmed. Redirecting..." : `Waiting for email confirmation${dots}`}
    </p>
  );
}
