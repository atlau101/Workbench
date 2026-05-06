import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

function getRoleDashboard(role: string | undefined) {
  return role === "student" ? "/student/dashboard" : "/instructor/dashboard";
}

function redirectWithCookies(path: string, request: NextRequest, source: NextResponse) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));

  source.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return redirectWithCookies("/login?error=Missing%20auth%20code.", request, response);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithCookies(`/login?error=${encodeURIComponent(error.message)}`, request, response);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = user?.user_metadata?.role;
  if (!role) return redirectWithCookies("/onboarding/role", request, response);
  return redirectWithCookies(getRoleDashboard(role), request, response);
}
