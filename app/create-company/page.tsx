import Link from "next/link";
import { redirect } from "next/navigation";

import OwnerOnboardingWizard from "../../components/onboarding/OwnerOnboardingWizard";
import { getActiveMembership } from "../../lib/auth";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getLatestInviteByEmail } from "../../lib/workspace-invite-admin";
import { isInviteRowExpired } from "../../lib/workspace-invite-types";
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

  if (user && !membershipId && user.email) {
    const authEmail = user.email.trim().toLowerCase();
    const invite = await getLatestInviteByEmail(authEmail);
    if (invite?.status === "pending" && !isInviteRowExpired(invite)) {
      redirect(`/complete-account?email=${encodeURIComponent(authEmail)}&verified=1`);
    }
    if (invite?.status === "pending" && isInviteRowExpired(invite)) {
      redirect(`/invite-link-expired?email=${encodeURIComponent(authEmail)}&reason=window`);
    }
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
