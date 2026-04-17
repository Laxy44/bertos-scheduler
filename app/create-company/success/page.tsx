import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreateCompanySuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const mode = readParam(params.mode);
  const isExisting = mode === "existing";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Workspace is ready</h1>
        {isExisting ? (
          <p className="mt-2 text-sm text-slate-600">
            Your company setup is complete. Continue to your workspace.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Your account and workspace were created. Check your email to confirm your account,
            then log in to enter Planyo.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {isExisting ? (
            <Link
              href="/"
              className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go to workspace
            </Link>
          ) : (
            <Link
              href="/login"
              className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go to login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
