import Link from "next/link";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getActiveMembership } from "../../lib/auth";
import { redirect } from "next/navigation";
import OwnerOnboardingWizard from "../../components/onboarding/OwnerOnboardingWizard";
import { finishOwnerOnboarding } from "./onboarding-actions";

type CreateCompanyPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  value: string | string[] | undefined
) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreateCompanyPage({
  searchParams,
}: CreateCompanyPageProps) {
  const params = await searchParams;
  const message = readParam(params.message);
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email || "";

  const membershipId = user ? await getActiveMembership(supabase, user.id) : null;
  const isLoggedInWithoutMembership = Boolean(user && !membershipId);

  if (user && membershipId) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Set up Planyo</h1>
        <p className="mt-2 text-sm text-slate-500">
          Complete the onboarding steps to launch your workspace.
        </p>
        <OwnerOnboardingWizard
          action={finishOwnerOnboarding}
          initialMessage={message}
          isLoggedInWithoutMembership={isLoggedInWithoutMembership}
          existingUserEmail={userEmail}
        />

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm font-medium text-slate-700">Invited employees</p>
          <p className="mt-1 text-sm text-slate-600">
            Already invited by a company owner? Use join with invite.
          </p>
          <Link
            href="/complete-account"
            className="mt-3 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-100"
          >
            Join with invite
          </Link>
        </div>

        <Link
          href="/login"
          className="mt-4 block text-center text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
