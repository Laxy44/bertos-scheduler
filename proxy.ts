import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/create-company") ||
    pathname.startsWith("/join-invite");

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set(
      "message",
      "Please log in to continue"
    );
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const membership = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle<{ company_id: string | null }>();

    const hasActiveCompany = !membership.error && Boolean(membership.data?.company_id);
    const isCreateCompanyPath = pathname.startsWith("/create-company");
    const isJoinInvitePath = pathname.startsWith("/join-invite");

    if (pathname === "/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = hasActiveCompany ? "/" : "/create-company";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    if (!hasActiveCompany && !isCreateCompanyPath && !isJoinInvitePath) {
      const createCompanyUrl = request.nextUrl.clone();
      createCompanyUrl.pathname = "/create-company";
      createCompanyUrl.search = "";
      return NextResponse.redirect(createCompanyUrl);
    }

    if (hasActiveCompany && (isCreateCompanyPath || isJoinInvitePath)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};