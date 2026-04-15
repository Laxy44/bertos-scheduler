"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getActiveMembership } from "../../lib/auth";

type InviteRow = {
  id: string;
  company_id: string;
  role: string | null;
  status: string;
};

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "We could not log you in with that password.";
  }
  return message;
}

async function getPendingInvite(
  email: string
) {
  const supabase = await createServerSupabaseClient();
  const inviteQuery = await supabase
    .from("invites")
    .select("id, company_id, role, status")
    .eq("email", email)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<InviteRow>();

  if (inviteQuery.error || !inviteQuery.data) {
    redirect("/join-invite?message=No active invite found for this email");
  }

  if (inviteQuery.data.status !== "pending") {
    redirect("/join-invite?message=Invite is no longer active");
  }

  return inviteQuery.data;
}

async function acceptInviteForUser(
  userId: string,
  invite: InviteRow
) {
  const supabase = await createServerSupabaseClient();

  const accountMembership = await getActiveMembership(supabase, userId);
  if (accountMembership && accountMembership !== invite.company_id) {
    redirect(
      "/join-invite?message=This account already belongs to another active company"
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
    redirect("/");
  }

  const insertMembership = await supabase.from("company_members").insert({
    company_id: invite.company_id,
    user_id: userId,
    role: invite.role || "employee",
    status: "active",
  });

  if (insertMembership.error) {
    redirect(
      `/join-invite?message=${encodeURIComponent(insertMembership.error.message)}`
    );
  }

  const updateInvite = await supabase
    .from("invites")
    .update({ status: "accepted" })
    .eq("id", invite.id)
    .eq("status", "pending");

  if (updateInvite.error) {
    redirect(`/join-invite?message=${encodeURIComponent(updateInvite.error.message)}`);
  }

  redirect("/");
}

export async function continueJoinInvite(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!email) {
    redirect("/join-invite?message=Email is required");
  }

  await getPendingInvite(email);
  redirect(`/join-invite?email=${encodeURIComponent(email)}`);
}

export async function loginOrSignupAndJoinInvite(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email) {
    redirect("/join-invite?message=Email is required");
  }

  if (!password) {
    redirect("/join-invite?message=Password is required");
  }

  const invite = await getPendingInvite(email);

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (currentUser) {
    const currentUserEmail = (currentUser.email || "").trim().toLowerCase();
    if (currentUserEmail !== email) {
      redirect(
        "/join-invite?message=You are signed in as another account. Sign out and try again."
      );
    }
    await acceptInviteForUser(currentUser.id, invite);
  }

  let loginResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginResult.error) {
    const signupResult = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupResult.error) {
      redirect(
        `/join-invite?message=${encodeURIComponent(
          authErrorMessage(signupResult.error.message)
        )}`
      );
    }

    loginResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginResult.error) {
      redirect(
        `/join-invite?message=${encodeURIComponent(
          authErrorMessage(loginResult.error.message)
        )}`
      );
    }
  }

  const {
    data: { user },
    error: refreshedUserError,
  } = await supabase.auth.getUser();

  if (refreshedUserError || !user) {
    redirect("/join-invite?message=Please try again");
  }

  const userEmail = (user.email || "").trim().toLowerCase();
  if (userEmail !== email) {
    redirect("/join-invite?message=Invite email must match your account email");
  }

  await acceptInviteForUser(user.id, invite);
}

export async function signOutFromJoinInvite() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(`/join-invite?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/join-invite?message=Signed out. You can now continue with another account.");
}
