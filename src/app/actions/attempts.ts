"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  isLowEffortAttempt,
  toAssignment,
  toAttempt,
  toReflectionResponse,
  totalWordCount,
  type Assignment,
  type Attempt,
  type ChatMessage,
  type FinalOutput,
  type ReflectionResponse,
} from "@/lib/assignments";
import { anthropicConfigured, evaluateReflectionQuality } from "@/lib/llm";

export interface AttemptBundle {
  attempt: Attempt;
  assignment: Assignment;
  responses: ReflectionResponse[];
  chatMessages: ChatMessage[];
  finalOutput: FinalOutput | null;
}

export interface AttemptRosterItem {
  attemptId: string;
  studentId: string;
  studentEmail: string | null;
  studentName: string | null;
  studentLabel: string;
  status: Attempt["status"];
  submittedAt: string | null;
  reflectionWordCount: number;
  updatedAt: string;
  flagged: boolean;
  reasons: string[];
}

export interface FlaggedAttemptItem {
  attemptId: string;
  studentLabel: string;
  assignmentTitle: string;
  reason: string;
}

export interface InstructorAttemptBundle extends AttemptBundle {
  studentId: string;
  studentEmail: string | null;
  studentName: string | null;
  studentLabel: string;
}

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function formatStudentLabel(profile: {
  email?: string | null;
  full_name?: string | null;
} | null, studentId: string): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  if (profile?.email?.trim()) return profile.email.trim();
  return `Student ${studentId.slice(0, 8)}`;
}

function latestAttemptActivity(input: {
  attempt: Attempt;
  responses: ReflectionResponse[];
  finalOutput: FinalOutput | null;
}): string {
  const timestamps = [
    input.attempt.started_at,
    input.attempt.gate_passed_at,
    input.attempt.final_draft_saved_at,
    input.attempt.submittedAt,
    input.finalOutput?.updated_at ?? null,
    ...input.responses.map((response) => response.updated_at),
  ].filter((value): value is string => Boolean(value));

  return timestamps.sort((left, right) => {
    return new Date(right).getTime() - new Date(left).getTime();
  })[0] ?? input.attempt.started_at;
}

export async function startAttempt(
  assignmentId: string
): Promise<{ error: string } | never> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: assignmentRow, error: assignmentError } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();

  if (assignmentError || !assignmentRow) return { error: "Assignment not found." };

  const assignment = toAssignment(assignmentRow);

  const { data: attemptRow, error: attemptError } = await supabase
    .from("assignment_attempts")
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: user.id,
      },
      {
        onConflict: "assignment_id,student_id",
      }
    )
    .select("*")
    .single();

  if (attemptError || !attemptRow) {
    return { error: attemptError?.message ?? "Unable to start attempt." };
  }

  const enabledPrompts = assignment.scaffolding_prompts.filter((prompt) => prompt.enabled);
  if (enabledPrompts.length > 0) {
    const { error: responseError } = await supabase
      .from("reflection_responses")
      .upsert(
        enabledPrompts.map((prompt) => ({
          attempt_id: attemptRow.id,
          prompt_id: prompt.id,
        })),
        {
          onConflict: "attempt_id,prompt_id",
        }
      );

    if (responseError) return { error: responseError.message };
  }

  const { error: finalOutputError } = await supabase
    .from("final_outputs")
    .upsert(
      {
        attempt_id: attemptRow.id,
      },
      {
        onConflict: "attempt_id",
      }
    );

  if (finalOutputError) return { error: finalOutputError.message };

  redirect(`/student/assignments/${attemptRow.id}`);
}

export async function saveReflectionDraft(
  attemptId: string,
  input: { promptId: string; response: string }
): Promise<{ error: string | null }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: row, error } = await supabase
    .from("reflection_responses")
    .select("id, frozen")
    .eq("attempt_id", attemptId)
    .eq("prompt_id", input.promptId)
    .single();

  if (error || !row) return { error: "Reflection prompt not found." };
  if (row.frozen) return { error: "Reflection is already locked." };

  const { error: updateError } = await supabase
    .from("reflection_responses")
    .update({
      response: input.response,
      word_count: countWords(input.response),
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  return { error: updateError?.message ?? null };
}

export async function passReflectionGate(
  attemptId: string
): Promise<{ error: string | null; qualityFeedback?: string }> {
  const bundle = await getAttemptForStudent(attemptId);
  if ("error" in bundle) return bundle;

  if (bundle.attempt.status !== "reflect") {
    return { error: "Reflection gate already passed." };
  }

  const totalWords = totalWordCount(bundle.responses);
  const wordCountMet =
    bundle.assignment.gate_level === "progressive"
      ? true
      : totalWords >= bundle.assignment.minWordCount;

  if (!wordCountMet) {
    return { error: "Minimum word count not met yet." };
  }

  // LLM quality check (skip if Gemini not configured — fail open)
  if (anthropicConfigured()) {
    const enabledPrompts = bundle.assignment.scaffolding_prompts.filter((p) => p.enabled);
    const responseTexts = enabledPrompts.map(
      (p) => bundle.responses.find((r) => r.prompt_id === p.id)?.response ?? ""
    );

    // Compute a simple hash of combined responses to cache results
    const combinedText = responseTexts.join("|||");
    const contentHash = Buffer.from(combinedText).toString("base64").slice(0, 64);

    // Check if all responses already passed with the same hash
    const allCached = enabledPrompts.length > 0 && enabledPrompts.every((p) => {
      const response = bundle.responses.find((r) => r.prompt_id === p.id);
      return response?.qualityPass === true && response.qualityHash === contentHash;
    });

    if (!allCached) {
      const qualityResult = await evaluateReflectionQuality({
        assignmentPrompt: bundle.assignment.prompt,
        scaffoldingPrompts: enabledPrompts.map((p) => p.text),
        responses: responseTexts,
      });

      const { supabase: supabaseForCache } = await requireUser();
      // Persist quality result to all responses (shared result for the attempt)
      await supabaseForCache
        .from("reflection_responses")
        .update({
          quality_pass: qualityResult.pass,
          quality_feedback: qualityResult.feedback,
          quality_hash: contentHash,
        })
        .eq("attempt_id", attemptId);

      if (!qualityResult.pass) {
        return { error: null, qualityFeedback: qualityResult.feedback };
      }
    }
  }

  const { supabase } = await requireUser();
  const now = new Date().toISOString();

  const { error: freezeError } = await supabase
    .from("reflection_responses")
    .update({
      frozen: true,
      updated_at: now,
    })
    .eq("attempt_id", attemptId);

  if (freezeError) return { error: freezeError.message };

  const { error: attemptError } = await supabase
    .from("assignment_attempts")
    .update({
      status: "ai_assist",
      gate_passed_at: now,
    })
    .eq("id", attemptId);

  return { error: attemptError?.message ?? null };
}

export async function goToSynthesize(
  attemptId: string
): Promise<{ error: string | null }> {
  const bundle = await getAttemptForStudent(attemptId);
  if ("error" in bundle) return bundle;

  if (bundle.attempt.status !== "ai_assist") {
    return { error: "Attempt is not in AI Assist." };
  }

  const userMsgCount = bundle.chatMessages.filter((m) => m.role === "user").length;
  const aiSkipped = userMsgCount === 0;

  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("assignment_attempts")
    .update({
      status: "synthesize",
      ai_skipped: aiSkipped,
      ai_user_msg_count: userMsgCount,
    })
    .eq("id", attemptId);

  return { error: error?.message ?? null };
}

export async function saveFinalDraft(
  attemptId: string,
  content: string
): Promise<{ error: string | null; savedAt?: string }> {
  const bundle = await getAttemptForStudent(attemptId);
  if ("error" in bundle) return bundle;
  if (bundle.attempt.status === "submitted") {
    return { error: "Final draft already submitted." };
  }

  const now = new Date().toISOString();
  const { supabase } = await requireUser();

  const { error: finalOutputError } = await supabase
    .from("final_outputs")
    .upsert(
      {
        attempt_id: attemptId,
        content,
        updated_at: now,
      },
      {
        onConflict: "attempt_id",
      }
    );

  if (finalOutputError) return { error: finalOutputError.message };

  const { error: attemptError } = await supabase
    .from("assignment_attempts")
    .update({
      final_draft_saved_at: now,
    })
    .eq("id", attemptId);

  return {
    error: attemptError?.message ?? null,
    savedAt: attemptError ? undefined : now,
  };
}

export async function submitAttempt(
  attemptId: string
): Promise<{ error: string | null; submittedAt?: string }> {
  const bundle = await getAttemptForStudent(attemptId);
  if ("error" in bundle) return bundle;

  if (bundle.attempt.status === "submitted") {
    return {
      error: null,
      submittedAt: bundle.attempt.submittedAt ?? new Date().toISOString(),
    };
  }

  if (bundle.attempt.status !== "synthesize") {
    return { error: "Attempt is not ready to submit." };
  }

  const finalWords = countWords(bundle.finalOutput?.content ?? "");
  if (finalWords < bundle.assignment.minSynthesisWords) {
    return {
      error: `Your draft needs at least ${bundle.assignment.minSynthesisWords} words before you can submit. You have ${finalWords}.`,
    };
  }

  const now = new Date().toISOString();
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("assignment_attempts")
    .update({
      status: "submitted",
      submitted_at: now,
    })
    .eq("id", attemptId)
    .eq("status", "synthesize");

  return {
    error: error?.message ?? null,
    submittedAt: error ? undefined : now,
  };
}

export async function getAttemptForStudent(
  attemptId: string
): Promise<AttemptBundle | { error: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: attemptRow, error: attemptError } = await supabase
    .from("assignment_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("student_id", user.id)
    .single();

  if (attemptError || !attemptRow) return { error: "Attempt not found." };

  const attempt = toAttempt(attemptRow);

  const [
    assignmentResult,
    responsesResult,
    chatResult,
    finalOutputResult,
  ] = await Promise.all([
    supabase
      .from("assignments")
      .select("*")
      .eq("id", attempt.assignment_id)
      .single(),
    supabase
      .from("reflection_responses")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("updated_at", { ascending: true }),
    supabase
      .from("chat_messages")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("created_at", { ascending: true }),
    supabase
      .from("final_outputs")
      .select("*")
      .eq("attempt_id", attemptId)
      .maybeSingle(),
  ]);

  if (assignmentResult.error || !assignmentResult.data) {
    return { error: "Assignment not found." };
  }

  return {
    attempt,
    assignment: toAssignment(assignmentResult.data),
    responses: (responsesResult.data ?? []).map((row) => toReflectionResponse(row)),
    chatMessages: (chatResult.data ?? []) as ChatMessage[],
    finalOutput: (finalOutputResult.data as FinalOutput | null) ?? null,
  };
}

export async function getAttemptForInstructor(
  attemptId: string
): Promise<InstructorAttemptBundle | null | { error: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: attemptRow, error: attemptError } = await supabase
    .from("assignment_attempts")
    .select("*")
    .eq("id", attemptId)
    .single();

  if (attemptError || !attemptRow) return null;

  const attempt = toAttempt(attemptRow);
  const [
    assignmentResult,
    responsesResult,
    chatResult,
    finalOutputResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("assignments")
      .select("*")
      .eq("id", attempt.assignment_id)
      .single(),
    supabase
      .from("reflection_responses")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("updated_at", { ascending: true }),
    supabase
      .from("chat_messages")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("created_at", { ascending: true }),
    supabase
      .from("final_outputs")
      .select("*")
      .eq("attempt_id", attemptId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", attempt.student_id)
      .maybeSingle(),
  ]);

  if (assignmentResult.error || !assignmentResult.data) return null;

  const assignment = toAssignment(assignmentResult.data);
  if (assignment.instructor_id !== user.id) return null;

  const profile = profileResult.data;

  return {
    attempt,
    assignment,
    responses: (responsesResult.data ?? []).map((row) => toReflectionResponse(row)),
    chatMessages: (chatResult.data ?? []) as ChatMessage[],
    finalOutput: (finalOutputResult.data as FinalOutput | null) ?? null,
    studentId: attempt.student_id,
    studentEmail: profile?.email ?? null,
    studentName: profile?.full_name ?? null,
    studentLabel: formatStudentLabel(profile, attempt.student_id),
  };
}

export async function listAttemptsForAssignment(
  assignmentId: string
): Promise<AttemptRosterItem[]> {
  const { supabase, user } = await requireUser();
  if (!user) return [];

  const { data: assignmentRow, error: assignmentError } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", assignmentId)
    .single();

  if (assignmentError || !assignmentRow) return [];

  const assignment = toAssignment(assignmentRow);
  if (assignment.instructor_id !== user.id) return [];

  const { data: attemptRows, error: attemptsError } = await supabase
    .from("assignment_attempts")
    .select("*")
    .eq("assignment_id", assignmentId)
    .order("started_at", { ascending: false });

  if (attemptsError || !attemptRows?.length) return [];

  const attempts = attemptRows.map((row) => toAttempt(row));
  const attemptIds = attempts.map((attempt) => attempt.id);
  const studentIds = [...new Set(attempts.map((attempt) => attempt.student_id))];

  const [responsesResult, finalOutputsResult, profilesResult] = await Promise.all([
    supabase
      .from("reflection_responses")
      .select("*")
      .in("attempt_id", attemptIds)
      .order("updated_at", { ascending: true }),
    supabase
      .from("final_outputs")
      .select("*")
      .in("attempt_id", attemptIds),
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", studentIds),
  ]);

  const responsesByAttempt = new Map<string, ReflectionResponse[]>();
  for (const row of responsesResult.data ?? []) {
    const response = toReflectionResponse(row);
    const bucket = responsesByAttempt.get(response.attempt_id) ?? [];
    bucket.push(response);
    responsesByAttempt.set(response.attempt_id, bucket);
  }

  const finalOutputByAttempt = new Map<string, FinalOutput>();
  for (const row of finalOutputsResult.data ?? []) {
    const finalOutput = row as FinalOutput;
    finalOutputByAttempt.set(finalOutput.attempt_id, finalOutput);
  }

  const profilesById = new Map<
    string,
    { email: string | null; full_name: string | null }
  >();
  for (const row of profilesResult.data ?? []) {
    profilesById.set(row.id as string, {
      email: (row.email as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
    });
  }

  return attempts
    .map((attempt) => {
      const responses = responsesByAttempt.get(attempt.id) ?? [];
      const finalOutput = finalOutputByAttempt.get(attempt.id) ?? null;
      const profile = profilesById.get(attempt.student_id) ?? null;
      const flag = isLowEffortAttempt({
        assignment,
        attempt,
        responses,
        finalOutput,
      });

      return {
        attemptId: attempt.id,
        studentId: attempt.student_id,
        studentEmail: profile?.email ?? null,
        studentName: profile?.full_name ?? null,
        studentLabel: formatStudentLabel(profile, attempt.student_id),
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        reflectionWordCount: totalWordCount(responses),
        updatedAt: latestAttemptActivity({ attempt, responses, finalOutput }),
        flagged: flag.flagged,
        reasons: flag.reasons,
      };
    })
    .sort((left, right) => {
      if (left.submittedAt && right.submittedAt) {
        return (
          new Date(right.submittedAt).getTime() -
          new Date(left.submittedAt).getTime()
        );
      }

      if (left.submittedAt) return -1;
      if (right.submittedAt) return 1;

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
}

export async function listFlaggedAttemptsForInstructor(): Promise<FlaggedAttemptItem[]> {
  const { supabase, user } = await requireUser();
  if (!user) return [];

  const { data: assignmentRows, error: assignmentsError } = await supabase
    .from("assignments")
    .select("*")
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false });

  if (assignmentsError || !assignmentRows?.length) return [];

  const assignments = assignmentRows.map((row) => toAssignment(row));
  const assignmentsById = new Map(assignments.map((assignment) => [assignment.id, assignment]));
  const assignmentIds = assignments.map((assignment) => assignment.id);

  const { data: attemptRows, error: attemptsError } = await supabase
    .from("assignment_attempts")
    .select("*")
    .in("assignment_id", assignmentIds)
    .order("started_at", { ascending: false });

  if (attemptsError || !attemptRows?.length) return [];

  const attempts = attemptRows.map((row) => toAttempt(row));
  const attemptIds = attempts.map((attempt) => attempt.id);
  const studentIds = [...new Set(attempts.map((attempt) => attempt.student_id))];

  const [responsesResult, finalOutputsResult, profilesResult] = await Promise.all([
    supabase
      .from("reflection_responses")
      .select("*")
      .in("attempt_id", attemptIds)
      .order("updated_at", { ascending: true }),
    supabase
      .from("final_outputs")
      .select("*")
      .in("attempt_id", attemptIds),
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", studentIds),
  ]);

  const responsesByAttempt = new Map<string, ReflectionResponse[]>();
  for (const row of responsesResult.data ?? []) {
    const response = toReflectionResponse(row);
    const bucket = responsesByAttempt.get(response.attempt_id) ?? [];
    bucket.push(response);
    responsesByAttempt.set(response.attempt_id, bucket);
  }

  const finalOutputByAttempt = new Map<string, FinalOutput>();
  for (const row of finalOutputsResult.data ?? []) {
    const finalOutput = row as FinalOutput;
    finalOutputByAttempt.set(finalOutput.attempt_id, finalOutput);
  }

  const profilesById = new Map<
    string,
    { email: string | null; full_name: string | null }
  >();
  for (const row of profilesResult.data ?? []) {
    profilesById.set(row.id as string, {
      email: (row.email as string | null) ?? null,
      full_name: (row.full_name as string | null) ?? null,
    });
  }

  return attempts
    .flatMap((attempt) => {
      const assignment = assignmentsById.get(attempt.assignment_id);
      if (!assignment) return [];

      const responses = responsesByAttempt.get(attempt.id) ?? [];
      const finalOutput = finalOutputByAttempt.get(attempt.id) ?? null;
      const profile = profilesById.get(attempt.student_id) ?? null;
      const flag = isLowEffortAttempt({
        assignment,
        attempt,
        responses,
        finalOutput,
      });

      if (!flag.flagged || flag.reasons.length === 0) return [];

      return [
        {
          attemptId: attempt.id,
          studentLabel: formatStudentLabel(profile, attempt.student_id),
          assignmentTitle: assignment.title,
          reason: flag.reasons[0],
          updatedAt: latestAttemptActivity({ attempt, responses, finalOutput }),
        },
      ];
    })
    .sort((left, right) => {
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    })
    .map((item) => ({
      attemptId: item.attemptId,
      studentLabel: item.studentLabel,
      assignmentTitle: item.assignmentTitle,
      reason: item.reason,
    }));
}

export async function toggleInstructorFlag(
  attemptId: string,
  flagged: boolean
): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("assignment_attempts")
    .update({ instructor_flagged: flagged })
    .eq("id", attemptId);

  if (error) return { error: error.message };
  return {};
}
