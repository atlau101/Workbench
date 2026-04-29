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

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user) {
    if (pathname.startsWith("/instructor") || pathname.startsWith("/student")) {
      return redirectWithCookies("/login", request, response);
    }

    return response;
  }

  const role = user.user_metadata.role as string | undefined;

  if (pathname === "/login" || pathname === "/signup") {
    return redirectWithCookies(getRoleDashboard(role), request, response);
  }

  if (pathname.startsWith("/instructor") && role !== "instructor") {
    return redirectWithCookies("/student/dashboard", request, response);
  }

  if (pathname.startsWith("/student") && role !== "student") {
    return redirectWithCookies("/instructor/dashboard", request, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
