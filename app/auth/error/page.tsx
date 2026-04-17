import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function looksLikeExpiredLink(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("expired") ||
    m.includes("invalid") ||
    m.includes("already been used") ||
    m.includes("otp") ||
    m.includes("access_denied")
  );
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawMessage =
    readParam(params.message) ||
    "Something went wrong with this link. You can request a fresh workspace invite or sign in if you already have a password.";
  const emailHint = readParam(params.email);

  const expired = looksLikeExpiredLink(rawMessage);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {expired ? "This link has expired or was already used" : "We could not finish sign-in"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{rawMessage}</p>

        {expired ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            If you were invited to a workspace, your invitation may still be valid. Use the recovery
            page to receive a new email with a fresh link.
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 text-sm font-medium">
          {expired ? (
            <Link
              href={
                emailHint
                  ? `/invite-link-expired?email=${encodeURIComponent(emailHint)}`
                  : "/invite-link-expired"
              }
              className="rounded-2xl bg-indigo-600 px-4 py-3 text-center text-white hover:bg-indigo-700"
            >
              Recover workspace invite
            </Link>
          ) : null}
          <Link
            href="/login"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-white hover:bg-slate-800"
          >
            Back to login
          </Link>
          <Link href="/complete-account" className="text-center text-slate-600 hover:text-slate-900">
            Complete invite (password)
          </Link>
        </div>
      </div>
    </main>
  );
}
