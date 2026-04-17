import Link from "next/link";

export default function PayrollReportPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Payroll report</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the in-app Payroll tab for the current report experience. This route is ready for
          future dedicated payroll reporting.
        </p>
        <Link
          href="/"
          className="mt-6 block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center font-semibold text-white hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
