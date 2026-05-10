"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

type Role = "instructor" | "student";

function getRoleDashboard(role: string | undefined) {
  return role === "student" ? "/student/dashboard" : "/instructor/dashboard";
}

function getErrorRedirect(path: "/login" | "/signup", message: string) {
  return `${path}?error=${encodeURIComponent(message)}`;
}

async function getAuthCallbackUrl() {
  const headerStore = await headers();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (appUrl) {
    return `${appUrl.replace(/\/+$/, "")}/auth/callback`;
  }

  const host =
    headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headerStore.get("host")?.split(",")[0]?.trim();

  if (host) {
    const protocol =
      headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      (process.env.NODE_ENV === "production" ? "https" : "http");
    return `${protocol}://${host}/auth/callback`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000/auth/callback";
  }

  throw new Error("NEXT_PUBLIC_APP_URL must be set for production auth redirects.");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(getErrorRedirect("/login", "Email and password are required."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(getErrorRedirect("/login", error.message));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(getRoleDashboard(user?.user_metadata.role));
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!email || !password || (role !== "instructor" && role !== "student")) {
    redirect(getErrorRedirect("/signup", "Email, password, and role are required."));
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await getAuthCallbackUrl(),
      data: { role },
    },
  });

  if (error) {
    redirect(getErrorRedirect("/signup", error.message));
  }

  if (!data.session) {
    redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account.");
  }

  redirect(getRoleDashboard(role));
}

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient();
  const callbackUrl = await getAuthCallbackUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl },
  });
  if (error || !data.url) {
    redirect(getErrorRedirect("/login", error?.message ?? "OAuth failed"));
  }
  redirect(data.url);
}

export async function setUserRole(formData: FormData) {
  const role = String(formData.get("role") ?? "") as Role;
  if (role !== "instructor" && role !== "student") {
    redirect("/onboarding/role?error=" + encodeURIComponent("Invalid role."));
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ data: { role } });
  if (error) {
    redirect("/onboarding/role?error=" + encodeURIComponent(error.message));
  }
  redirect(getRoleDashboard(role));
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(getErrorRedirect("/login", "Email is required."));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: await getAuthCallbackUrl(),
    },
  });

  if (error) {
    redirect(getErrorRedirect("/login", error.message));
  }

  redirect("/login?message=Magic%20link%20sent.%20Check%20your%20email.");
}
