export default function WorkspaceLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-100 to-slate-200/80 px-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" aria-hidden />
      <p className="text-sm font-medium text-slate-600">Loading workspace…</p>
    </div>
  );
}
