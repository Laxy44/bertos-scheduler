/** Set NEXT_PUBLIC_AUTH_DEBUG=1 to log [auth-debug] lines (callback, proxy, pages, actions). */

export function authDebug(label: string, payload?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG !== "1") return;
  console.log(`[auth-debug] ${label}`, payload ?? {});
}
