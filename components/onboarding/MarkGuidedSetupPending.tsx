"use client";

import { useEffect } from "react";

const KEY = "planyo_guided_pending";

/** Call after company creation so the main app can open the guided setup once. */
export default function MarkGuidedSetupPending() {
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      // ignore private mode
    }
  }, []);
  return null;
}
