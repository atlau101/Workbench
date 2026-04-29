export type GateLevel = "high" | "low" | "progressive";

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
  title: string;
  prompt: string;
  gate_level: GateLevel;
  ai_msg_limit: number;
  scaffolding_prompts: ScaffoldingPrompt[];
  stage_instructions: StageInstructions | null;
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
  title: string;
  prompt: string;
  gate_level: GateLevel;
  ai_msg_limit: number;
  scaffolding_prompts: ScaffoldingPrompt[];
  stage_instructions: StageInstructions | null;
}

export function validateAssignmentInput(
  data: Partial<CreateAssignmentInput>
): string | null {
  if (!data.title?.trim()) return "Title is required.";
  if (!data.prompt?.trim()) return "Prompt is required.";
  if (!data.gate_level) return "Gate level is required.";
  if (
    typeof data.ai_msg_limit !== "number" ||
    data.ai_msg_limit < 5 ||
    data.ai_msg_limit > 50
  )
    return "AI message limit must be between 5 and 50.";
  return null;
}
