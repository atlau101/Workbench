"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import {
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

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      instructor_id: user.id,
      title: input.title.trim(),
      prompt: input.prompt.trim(),
      gate_level: input.gate_level,
      ai_msg_limit: input.ai_msg_limit,
      scaffolding_prompts: input.scaffolding_prompts,
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
  return (data ?? []) as Assignment[];
}

export async function getAssignment(id: string): Promise<Assignment | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Assignment;
}

export async function listTemplates(): Promise<AssignmentTemplate[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("assignment_templates")
    .select("*")
    .order("discipline");
  return (data ?? []) as AssignmentTemplate[];
}
