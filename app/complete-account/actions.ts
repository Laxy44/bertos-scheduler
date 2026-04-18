"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { sendAccountReadyEmail } from "../../lib/account-ready-email";
import { buildInviteEmailRedirectUrl } from "../../lib/auth-callback-urls";
import { authDebug } from "../../lib/auth-debug";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getActiveMembership } from "../../lib/auth";
import { getSiteUrl } from "../../lib/site-url";
import { getLatestInviteByEmail, linkEmployeeUserToAuthUser } from "../../lib/workspace-invite-admin";
import {
  isInviteRowExpired,
  type WorkspaceInviteRow,
} from "../../lib/workspace-invite-types";

const ACCOUNT_PATH = "/complete-account";

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "We could not log you in with that password.";
  }
  return message;
}

function isUserAlreadyRegisteredError(error: { message?: string | null; code?: string | null }) {
  const normalizedMessage = (error.message || "").toLowerCase();
  const normalizedCode = (error.code || "").toLowerCase();
  return (
    normalizedMessage.includes("user already registered") ||
    normalizedMessage.includes("already registered") ||
    normalizedCode.includes("user_already_registered")
  );
}

async function assertWorkspaceInviteReadyForEmail(email: string): Promise<WorkspaceInviteRow> {
  const normalized = email.trim().toLowerCase();
  const invite = await getLatestInviteByEmail(normalized);

  if (!invite) {
    redirect(
      `${ACCOUNT_PATH}?message=${encodeURIComponent(
        "No workspace invitation was found for this email. Ask your admin to send a new invite from Planyo."
      )}`
    );
  }

  if (invite.status === "accepted") {
    redirect(
      `/login?message=${encodeURIComponent(
        "You have already joined this workspace. Sign in with your email and password."
      )}`
    );
  }

  if (invite.status === "revoked" || invite.status === "expired") {
    redirect(
      `/invite-link-expired?email=${encodeURIComponent(normalized)}&reason=${encodeURIComponent(invite.status)}`
    );
  }

  if (invite.status === "pending" && isInviteRowExpired(invite)) {
    redirect(`/invite-link-expired?email=${encodeURIComponent(normalized)}&reason=window`);
  }

  if (invite.status !== "pending") {
    redirect(
      `${ACCOUNT_PATH}?message=${encodeURIComponent("This invitation can no longer be used.")}`
    );
  }

  return invite;
}

async function acceptInviteForUser(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  invite: WorkspaceInviteRow
) {
  const accountMembership = await getActiveMembership(supabase, userId);
  if (accountMembership && accountMembership !== invite.company_id) {
    redirect(
      `${ACCOUNT_PATH}?email=${encodeURIComponent(email)}&message=${encodeURIComponent(
        "Email already exists in another company workspace. Use another email or ask your admin to invite a different address."
      )}`
    );
  }

  const duplicateMembership = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("company_id", invite.company_id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<{ company_id: string }>();

  if (!duplicateMembership.error && duplicateMembership.data?.company_id) {
    await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("id", invite.id)
      .eq("status", "pending");
    await linkEmployeeUserToAuthUser({
      companyId: invite.company_id,
      userId,
      email,
    });
    redirect("/app");
  }

  const insertMembership = await supabase.from("company_members").insert({
    company_id: invite.company_id,
    user_id: userId,
    role: invite.role || "employee",
    status: "active",
  });

  if (insertMembership.error) {
    redirect(
      `${ACCOUNT_PATH}?message=${encodeURIComponent(insertMembership.error.message)}`
    );
  }

  const updateInvite = await supabase
    .from("invites")
    .update({ status: "accepted" })
    .eq("id", invite.id)
    .eq("status", "pending");

  if (updateInvite.error) {
    redirect(`${ACCOUNT_PATH}?message=${encodeURIComponent(updateInvite.error.message)}`);
  }

  void sendAccountReadyEmail({ to: email }).catch((error) => {
    console.error("[account-ready-email] failed to send", {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  await linkEmployeeUserToAuthUser({
    companyId: invite.company_id,
    userId,
    email,
  });

  redirect("/app");
}

async function getAuthenticatedUserWithSingleRetry(supabase: SupabaseClient) {
  const firstAttempt = await supabase.auth.getUser();
  if (firstAttempt.data.user) {
    return firstAttempt.data.user;
  }

  await new Promise((resolve) => setTimeout(resolve, 250));

  const secondAttempt = await supabase.auth.getUser();
  if (secondAttempt.data.user) {
    return secondAttempt.data.user;
  }

  return null;
}

export async function continueCompleteAccount(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect(`${ACCOUNT_PATH}?message=Email is required`);
  }

  await assertWorkspaceInviteReadyForEmail(email);
  redirect(`${ACCOUNT_PATH}?email=${encodeURIComponent(email)}`);
}

export async function loginOrSignupAndCompleteInvite(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email) {
    redirect(`${ACCOUNT_PATH}?message=Email is required`);
  }

  if (!password) {
    redirect(`${ACCOUNT_PATH}?message=Password is required`);
  }

  if (password.length < 6) {
    redirect(`${ACCOUNT_PATH}?email=${encodeURIComponent(email)}&message=Password must be at least 6 characters`);
  }

  const invite = await assertWorkspaceInviteReadyForEmail(email);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  authDebug("loginOrSignupAndCompleteInvite getUser", {
    email,
    hasUser: Boolean(currentUser),
    userId: currentUser?.id ?? null,
  });

  if (currentUser) {
    const currentUserEmail = (currentUser.email || "").trim().toLowerCase();
    if (currentUserEmail !== email) {
      redirect(
        `${ACCOUNT_PATH}?message=${encodeURIComponent(
          "You are signed in as another account. Sign out and try again."
        )}`
      );
    }

    const {
      data: { session: sessionBeforePw },
    } = await supabase.auth.getSession();
    authDebug("loginOrSignupAndCompleteInvite before updateUser", {
      hasSession: Boolean(sessionBeforePw),
    });

    const { error: pwError } = await supabase.auth.updateUser({ password });
    if (pwError) {
      authDebug("loginOrSignupAndCompleteInvite updateUser error", {
        message: pwError.message,
      });
      redirect(
        `${ACCOUNT_PATH}?email=${encodeURIComponent(email)}&message=${encodeURIComponent(
          authErrorMessage(pwError.message)
        )}`
      );
    }

    await acceptInviteForUser(supabase, currentUser.id, email, invite);
  }

  let loginResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginResult.error) {
    const signupResult = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildInviteEmailRedirectUrl(getSiteUrl(), email),
      },
    });

    if (signupResult.error) {
      if (isUserAlreadyRegisteredError(signupResult.error)) {
        redirect(
          `${ACCOUNT_PATH}?email=${encodeURIComponent(email)}&message=${encodeURIComponent(
            "Email already exists. Continue with your existing password."
          )}`
        );
      }

      redirect(
        `${ACCOUNT_PATH}?message=${encodeURIComponent(
          authErrorMessage(signupResult.error.message)
        )}`
      );
    }

    const hasIdentity = (signupResult.data.user?.identities || []).length > 0;
    if (!hasIdentity) {
      redirect(
        `${ACCOUNT_PATH}?message=${encodeURIComponent(
          "We could not complete account creation right now. Please try again or reset your password."
        )}`
      );
    }

    loginResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginResult.error) {
      redirect(
        `${ACCOUNT_PATH}?message=${encodeURIComponent(
          "Check your email to verify your account, then continue joining."
        )}`
      );
    }
  }

  const user = await getAuthenticatedUserWithSingleRetry(supabase);
  if (!user) {
    redirect(`${ACCOUNT_PATH}?message=Please try again`);
  }

  const userEmail = (user.email || "").trim().toLowerCase();
  if (userEmail !== email) {
    redirect(`${ACCOUNT_PATH}?message=Invite email must match your account email`);
  }

  await acceptInviteForUser(supabase, user.id, email, invite);
}

export async function signOutFromCompleteAccount() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(`${ACCOUNT_PATH}?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `${ACCOUNT_PATH}?message=${encodeURIComponent(
      "Signed out. You can now continue with another account."
    )}`
  );
}
