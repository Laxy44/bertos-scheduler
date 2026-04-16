import Link from "next/link";

export default function AccountReadyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Your account is ready</h1>
        <p className="mt-4 text-sm text-slate-600">
          Your Planyo account has been activated successfully.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          You can now sign in using your email address and password.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Your email is now your username for future logins.
        </p>
        <Link
          href="/login"
          className="mt-8 block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
