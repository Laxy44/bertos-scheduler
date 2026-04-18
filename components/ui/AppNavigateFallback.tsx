/**
 * Shown immediately while a server route segment streams (Suspense in root layout).
 * Keeps layout stable so navigations feel responsive instead of a blank screen.
 */
export default function AppNavigateFallback() {
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 bg-slate-50 px-4 py-16">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600"
        aria-hidden
      />
      <p className="text-sm font-medium text-slate-600">Loading…</p>
    </div>
  );
}
