import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { authDebug } from "./lib/auth-debug";
import { WORKSPACE_PROXY_COMPANY_HEADER } from "./lib/workspace-request-hint";

export async function proxy(request: NextRequest) {
  let proxyWorkspaceCompanyId: string | null = null;
  const { pathname, searchParams } = request.nextUrl;
  const loginMode = searchParams.get("mode");
  const isRecoveryMode = pathname === "/login" && loginMode === "recovery";
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/error") ||
    pathname.startsWith("/create-company") ||
    pathname.startsWith("/join-invite") ||
    pathname.startsWith("/complete-account") ||
    pathname.startsWith("/invite-link-expired") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/workspace-conflict");

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // PKCE: exchange code in middleware so session cookies exist before the callback page runs.
  // Avoids races where the client had not finished exchange and a navigation hit protected routes.
  const authCode = searchParams.get("code");
  if (pathname === "/auth/callback" && authCode) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
    if (exchangeError) {
      const flow = searchParams.get("flow");
      const errUrl = request.nextUrl.clone();
      errUrl.pathname = flow === "signup" ? "/auth/error" : "/invite-link-expired";
      errUrl.search = "";
      errUrl.searchParams.set(
        "message",
        exchangeError.message || "This sign-in link is invalid or has expired."
      );
      return NextResponse.redirect(errUrl);
    }
  }

  // Refresh session from cookies so getUser() and downstream routes see an up-to-date session.
  await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthCompletionPath =
    pathname.startsWith("/complete-account") || pathname.startsWith("/reset-password");

  authDebug("proxy", {
    pathname,
    hasUser: Boolean(user),
    isAuthCompletionPath,
    hasAuthCode: Boolean(authCode),
  });

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "message",
      "Please log in to continue"
    );
    authDebug("proxy redirect", { reason: "unauthenticated", from: pathname, to: "/login" });
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const memberships = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("company_id", { ascending: true })
      .limit(2);

    const activeMemberships = memberships.error ? [] : memberships.data || [];
    // Do not block password reset or invite completion when the user has multiple workspaces.
    if (activeMemberships.length > 1 && !isAuthCompletionPath) {
      const conflictUrl = request.nextUrl.clone();
      conflictUrl.pathname = "/workspace-conflict";
      conflictUrl.search = "";
      authDebug("proxy redirect", { reason: "multi-workspace", from: pathname, to: "/workspace-conflict" });
      return NextResponse.redirect(conflictUrl);
    }

    const hasActiveCompany = Boolean(activeMemberships[0]?.company_id);
    const isCreateCompanyPath = pathname.startsWith("/create-company");
    const isJoinInvitePath = pathname.startsWith("/join-invite");
    const isCompleteAccountPath = pathname.startsWith("/complete-account");
    const isInviteRecoveryPath = pathname.startsWith("/invite-link-expired");
    const isResetPasswordPath = pathname.startsWith("/reset-password");
    const isAuthCallbackPath = pathname.startsWith("/auth/callback");

    if (pathname === "/login" && !isRecoveryMode) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = hasActiveCompany ? "/" : "/create-company";
      redirectUrl.search = "";
      authDebug("proxy redirect", {
        reason: "logged-in on /login",
        to: redirectUrl.pathname,
        hasActiveCompany,
      });
      return NextResponse.redirect(redirectUrl);
    }

    if (
      !hasActiveCompany &&
      !isCreateCompanyPath &&
      !isJoinInvitePath &&
      !isCompleteAccountPath &&
      !isInviteRecoveryPath &&
      !isResetPasswordPath &&
      !isAuthCallbackPath
    ) {
      const createCompanyUrl = request.nextUrl.clone();
      createCompanyUrl.pathname = "/create-company";
      createCompanyUrl.search = "";
      authDebug("proxy redirect", {
        reason: "no active company",
        from: pathname,
        to: "/create-company",
      });
      return NextResponse.redirect(createCompanyUrl);
    }

    if (
      hasActiveCompany &&
      (isCreateCompanyPath || isJoinInvitePath || isCompleteAccountPath || isInviteRecoveryPath)
    ) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      authDebug("proxy redirect", {
        reason: "has company on onboarding/auth path",
        from: pathname,
        to: "/",
      });
      return NextResponse.redirect(homeUrl);
    }

    if (activeMemberships.length === 1 && activeMemberships[0]?.company_id) {
      proxyWorkspaceCompanyId = activeMemberships[0].company_id as string;
    }
  }

  if (proxyWorkspaceCompanyId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(WORKSPACE_PROXY_COMPANY_HEADER, proxyWorkspaceCompanyId);
    const withHint = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.getAll().forEach((cookie) => {
      withHint.cookies.set(cookie.name, cookie.value);
    });
    return withHint;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};