import Link from "next/link";

export default function PunchClockPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Punch Clock</h1>
        <p className="mt-2 text-sm text-slate-600">
          This section is coming soon. We&apos;ve added this as a safe placeholder route.
        </p>
        <Link
          href="/app"
          className="mt-6 block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
