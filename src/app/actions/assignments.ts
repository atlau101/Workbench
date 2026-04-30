"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
  toAssignment,
  validateAssignmentInput,
  type Assignment,
  type AssignmentTemplate,
  type CreateAssignmentInput,
} from "@/lib/assignments";

export async function createAssignment(
  input: CreateAssignmentInput
): Promise<{ error: string } | never> {
  const err = validateAssignmentInput(input);
  if (err) return { error: err };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
    .eq("instructor_id", user.id)
    .single();

  if (courseError || !course) return { error: "Course not found." };

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      instructor_id: user.id,
      course_id: input.courseId,
      title: input.title.trim(),
      prompt: input.prompt.trim(),
      gate_level: input.gate_level,
      min_word_count: input.minWordCount,
      ai_msg_limit: input.ai_msg_limit,
      scaffolding_prompts: input.scaffolding_prompts,
      status: "draft",
      stage_instructions:
        input.gate_level === "progressive" ? input.stage_instructions : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  redirect(`/instructor/assignments/${data.id}`);
}

export async function listMyAssignments(): Promise<Assignment[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => toAssignment(row));
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return toAssignment(data);
}

export async function listTemplates(): Promise<AssignmentTemplate[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("assignment_templates")
    .select("*")
    .order("discipline");
  return (data ?? []) as AssignmentTemplate[];
}

export async function setAssignmentStatus(
  id: string,
  status: "draft" | "published" | "hidden"
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("assignments")
    .update({ status })
    .eq("id", id)
    .eq("instructor_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/instructor/assignments/${id}`);
  revalidatePath("/instructor/assignments");
  return { ok: true };
}
