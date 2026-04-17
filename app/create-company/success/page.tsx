import Link from "next/link";
import EmailConfirmationPolling from "../../../components/onboarding/EmailConfirmationPolling";
import { resendOwnerConfirmation } from "./actions";

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
  const ownerEmail = readParam(params.email)?.trim().toLowerCase() || "";
  const message = readParam(params.message);
  const isExisting = mode === "existing";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {isExisting
            ? "Workspace is ready"
            : "Check your email to activate your workspace"}
        </h1>
        {isExisting ? (
          <p className="mt-2 text-sm text-slate-600">
            Your company setup is complete. Continue to your workspace.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            We sent a confirmation email to your address. Open your inbox and click the
            confirmation link to activate your workspace.
          </p>
        )}
        <EmailConfirmationPolling enabled={!isExisting} ownerEmail={ownerEmail} />

        {!isExisting && ownerEmail ? (
          <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
            Confirmation email sent to:{" "}
            <a href={`mailto:${ownerEmail}`} className="font-semibold text-slate-900 underline">
              {ownerEmail}
            </a>
          </p>
        ) : null}

        {message ? (
          <div
            className={`mt-3 rounded-2xl px-4 py-3 text-sm ring-1 ${
              message.toLowerCase().includes("sent")
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {isExisting ? (
            <Link
              href="/"
              className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go to workspace
            </Link>
          ) : (
            <>
              <a
                href="https://mail.google.com/mail/u/0/#inbox"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                Open Gmail
              </a>

              <Link
                href="/login"
                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to login
              </Link>

              <form action={resendOwnerConfirmation}>
                <input type="hidden" name="email" value={ownerEmail} />
                <input type="hidden" name="mode" value={mode || "new"} />
                <button
                  type="submit"
                  disabled={!ownerEmail}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Resend email
                </button>
              </form>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                <p>Check your inbox or spam folder if you don&apos;t see the email.</p>
                <p className="mt-1">You can close this tab after confirming your email.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
