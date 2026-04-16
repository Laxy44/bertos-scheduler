import Link from "next/link";

export default function WorkspaceConflictPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Workspace conflict detected</h1>
        <p className="mt-2 text-sm text-slate-600">
          This account is linked to multiple active workspaces. For security, Planyo blocks
          actions until one workspace assignment remains active.
        </p>

        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
          Ask your company admin to keep only one active workspace membership for this email.
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/login"
            className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
          >
            Back to login
          </Link>
          <Link
            href="/complete-account"
            className="block w-full rounded-2xl bg-white px-4 py-3 text-center font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            Join with invite
          </Link>
        </div>
      </div>
    </main>
  );
}
