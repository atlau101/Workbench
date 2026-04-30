"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Course } from "@/lib/courses";

export async function createCourse(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "Course name is required." };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data, error } = await supabase
    .from("courses")
    .insert({ instructor_id: user.id, name })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create course." };
  redirect(`/instructor/courses/${data.id}`);
}

export async function listMyCourses(): Promise<Course[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Course[];
}

export async function getCourse(id: string): Promise<Course | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Course;
}
