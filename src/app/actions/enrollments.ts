"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Enrollment, PendingInvite, EnrolledCourse } from "@/lib/courses";

// PostgREST returns many→one FK joins as objects, not arrays
type PendingInviteRow = {
  id: string;
  course_id: string;
  courses: {
    name: string | null;
    profiles: { email: string | null } | null;
  } | null;
};


export async function inviteStudent(
  courseId: string,
  email: string
): Promise<{ error: string } | { ok: true }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return { error: "Invalid email." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("instructor_id", user.id)
    .single();
  if (courseErr || !course) return { error: "Course not found." };

  const { error } = await supabase.from("enrollments").upsert(
    {
      course_id: courseId,
      student_email: normalized,
      invited_by: user.id,
      status: "pending",
    },
    { onConflict: "course_id,student_email", ignoreDuplicates: true }
  );
  if (error) return { error: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  return { ok: true };
}

export async function respondToInvite(
  enrollmentId: string,
  decision: "accepted" | "declined"
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("enrollments")
    .update({ status: decision, responded_at: new Date().toISOString(), student_id: user.id })
    .eq("id", enrollmentId);
  if (error) return { error: error.message };

  revalidatePath("/student/dashboard");
  return { ok: true };
}

export async function listPendingInvitesForMe(): Promise<PendingInvite[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      course_id,
      courses ( name, profiles ( email ) )
    `
    )
    .eq("status", "pending");

  if (error || !data) return [];

  return (data as PendingInviteRow[]).map((row) => ({
    enrollment_id: row.id,
    course_id: row.course_id,
    course_name: row.courses?.name ?? "",
    instructor_email: row.courses?.profiles?.email ?? "",
  }));
}

export async function listEnrolledCoursesForMe(): Promise<EnrolledCourse[]> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Step 1: get accepted enrollment IDs + course IDs (RLS filters to this user)
  const { data: enrollments, error: enrollErr } = await supabase
    .from("enrollments")
    .select("id, course_id")
    .eq("status", "accepted");

  if (enrollErr || !enrollments?.length) return [];

  const courseIds = enrollments.map((e) => e.course_id);

  // Step 2: fetch those courses + their published assignments directly
  const { data: courses, error: courseErr } = await supabase
    .from("courses")
    .select("id, name, instructor_id, created_at, assignments(id, title, status)")
    .in("id", courseIds);

  if (courseErr || !courses) return [];

  return courses.map((course) => {
    const enrollment = enrollments.find((e) => e.course_id === course.id)!;
    const assignments = (course.assignments as Array<{ id: string; title: string; status: string }> ?? [])
      .filter((a) => a.status === "published")
      .map((a) => ({ id: a.id, title: a.title }));

    return {
      enrollment_id: enrollment.id,
      course: {
        id: course.id,
        instructor_id: course.instructor_id,
        name: course.name,
        created_at: course.created_at,
        instructor_email: "",
      },
      assignments,
    };
  });
}

export async function removeStudent(
  enrollmentId: string,
  courseId: string
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", enrollmentId);
  if (error) return { error: error.message };

  revalidatePath(`/instructor/courses/${courseId}`);
  return { ok: true };
}

export async function listCourseRoster(courseId: string): Promise<Enrollment[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId)
    .order("invited_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as Enrollment[];
}
