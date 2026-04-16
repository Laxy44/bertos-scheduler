import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const message =
    readParam(params.message) ||
    "Something went wrong with this link. Request a new email or try again.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Link could not be used</h1>
        <p className="mt-4 text-sm text-slate-600">{message}</p>
        <div className="mt-8 flex flex-col gap-3 text-sm font-medium">
          <Link
            href="/login"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-white hover:bg-slate-800"
          >
            Back to login
          </Link>
          <Link href="/complete-account" className="text-center text-slate-600 hover:text-slate-900">
            Complete invite
          </Link>
        </div>
      </div>
    </main>
  );
}
