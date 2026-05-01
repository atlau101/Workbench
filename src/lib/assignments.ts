export type GateLevel = "standard" | "progressive";
export type AssignmentStatus = "draft" | "published" | "hidden";

export interface ScaffoldingPrompt {
  id: string;
  text: string;
  enabled: boolean;
}

export interface StageInstructions {
  reflect: string;
  ai_assist: string;
  synthesize: string;
}

export interface Assignment {
  id: string;
  instructor_id: string;
  course_id: string;
  title: string;
  prompt: string;
  gate_level: GateLevel;
  minWordCount: number;
  ai_msg_limit: number;
  scaffolding_prompts: ScaffoldingPrompt[];
  stage_instructions: StageInstructions | null;
  status: AssignmentStatus;
  created_at: string;
}

export interface AssignmentTemplate {
  id: string;
  discipline: string;
  task_type: string;
  title: string;
  prompt: string;
  default_scaffolding: ScaffoldingPrompt[];
  default_gate_level: GateLevel;
}

export interface CreateAssignmentInput {
  courseId: string;
  title: string;
  prompt: string;
  gate_level: GateLevel;
  minWordCount: number;
  ai_msg_limit: number;
  scaffolding_prompts: ScaffoldingPrompt[];
  stage_instructions: StageInstructions | null;
}

export type AttemptStatus =
  | "reflect"
  | "ai_assist"
  | "synthesize"
  | "submitted"
  | "complete";

export interface Attempt {
  id: string;
  assignment_id: string;
  student_id: string;
  status: AttemptStatus;
  started_at: string;
  gate_passed_at: string | null;
  final_draft_saved_at: string | null;
  submittedAt: string | null;
  instructorFlagged: boolean;
}

export interface ReflectionResponse {
  id: string;
  attempt_id: string;
  prompt_id: string;
  response: string;
  wordCount: number;
  frozen: boolean;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  attempt_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface FinalOutput {
  attempt_id: string;
  content: string;
  updated_at: string;
}

export interface LowEffortAttemptResult {
  flagged: boolean;
  reasons: string[];
}

export function validateAssignmentInput(
  data: Partial<CreateAssignmentInput>
): string | null {
  if (!data.title?.trim()) return "Title is required.";
  if (!data.prompt?.trim()) return "Prompt is required.";
  if (!data.gate_level) return "Gate level is required.";
  if (
    typeof data.minWordCount !== "number" ||
    data.minWordCount < 50 ||
    data.minWordCount > 500
  ) {
    return "Minimum word count must be between 50 and 500.";
  }
  if (
    typeof data.ai_msg_limit !== "number" ||
    data.ai_msg_limit < 5 ||
    data.ai_msg_limit > 50
  )
    return "AI message limit must be between 5 and 50.";
  return null;
}

export function toAssignment(
  row: Record<string, unknown> & { min_word_count?: number }
): Assignment {
  const { min_word_count, ...rest } = row;
  return {
    ...(rest as Omit<Assignment, "minWordCount">),
    minWordCount: min_word_count ?? 150,
  };
}

export function toAttempt(
  row: Record<string, unknown> & { submitted_at?: string | null; instructor_flagged?: boolean | null }
): Attempt {
  const { submitted_at, instructor_flagged, ...rest } = row;
  return {
    ...(rest as Omit<Attempt, "submittedAt" | "instructorFlagged">),
    submittedAt: submitted_at ?? null,
    instructorFlagged: instructor_flagged ?? false,
  };
}

export function toReflectionResponse(
  row: Record<string, unknown> & { word_count?: number }
): ReflectionResponse {
  const { word_count, ...rest } = row;
  return {
    ...(rest as Omit<ReflectionResponse, "wordCount">),
    wordCount: word_count ?? 0,
  };
}

export function totalWordCount(
  responses: { wordCount: number }[]
): number {
  return responses.reduce((sum, response) => sum + response.wordCount, 0);
}

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isLowEffortAttempt(input: {
  assignment: Pick<Assignment, "minWordCount">;
  attempt: Pick<Attempt, "status">;
  responses: Array<Pick<ReflectionResponse, "response" | "wordCount">>;
  finalOutput: Pick<FinalOutput, "content"> | null;
}): LowEffortAttemptResult {
  const reasons: string[] = [];
  const nonEmptyResponses = input.responses.filter((response) => response.response.trim().length > 0);
  const reflectionWords = totalWordCount(input.responses);

  if (
    nonEmptyResponses.length > 0 &&
    reflectionWords <= input.assignment.minWordCount * 1.1
  ) {
    reasons.push("Reflection stayed at or near the minimum word threshold.");
  }

  if (
    (
      input.attempt.status === "synthesize" ||
      input.attempt.status === "submitted" ||
      input.attempt.status === "complete"
    ) &&
    countWords(input.finalOutput?.content ?? "") < 50
  ) {
    reasons.push("Final draft is under 50 words.");
  }

  if (nonEmptyResponses.some((response) => countWords(response.response) < 5)) {
    reasons.push("At least one reflection response is under 5 words.");
  }

  return {
    flagged: reasons.length > 0,
    reasons,
  };
}

export function gateUnlocked(
  assignment: Pick<Assignment, "gate_level" | "minWordCount">,
  totalWords: number,
  status: AttemptStatus
): boolean {
  if (assignment.gate_level === "progressive") {
    return status !== "reflect";
  }

  return totalWords >= assignment.minWordCount;
}
