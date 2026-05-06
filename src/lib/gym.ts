export type GymMode =
  | "brainstorming"
  | "critical_analysis"
  | "structured_argumentation"
  | "problem_decomposition"
  | "reflective_writing";

export type ScenarioDifficulty = "beginner" | "intermediate" | "advanced";

export interface GymScaffoldingPrompt {
  id: string;
  text: string;
}

export interface GymModeConfig {
  id: GymMode;
  label: string;
  badge: string;
  icon: string;
  tone: string;
  blurb: string;
  quickActions: string[];
  scaffolding: GymScaffoldingPrompt[];
  system: string[];
}

export interface Scenario {
  id: string;
  title: string;
  prompt: string;
  discipline: string;
  difficulty: ScenarioDifficulty;
  mode_tags: GymMode[];
  created_at: string;
}

export interface GymSession {
  id: string;
  student_id: string;
  mode: GymMode;
  scenario_id: string | null;
  custom_topic: string | null;
  scaffolding: Record<string, string>;
  started_at: string;
  completed_at: string | null;
}

export interface GymMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface GymSessionBundle {
  session: GymSession;
  scenario: Scenario | null;
  messages: GymMessage[];
}

export const GYM_MESSAGE_LIMIT = 30;

export const BUDDY_PERSONA = [
  "You are a friendly AI learning buddy — warm, encouraging, and genuinely invested in the student's growth.",
  "Your goal is to help the student think better, not to think for them.",
];

export const GYM_MODES: Record<GymMode, GymModeConfig> = {
  brainstorming: {
    id: "brainstorming",
    label: "Brainstorming",
    badge: "DIVERGENT",
    icon: "lightbulb",
    tone: "Expansive",
    blurb: "Generate options, connections, and adjacent angles before you commit.",
    quickActions: [
      "Give me five distinct approaches",
      "What is a surprising angle here?",
      "Combine two ideas into a stronger direction",
    ],
    scaffolding: [
      { id: "topic", text: "What topic or scenario are you exploring?" },
      { id: "goal", text: "What kind of outcome or insight are you trying to produce?" },
      { id: "constraints", text: "What constraints, audiences, or boundaries should shape the ideation?" },
      { id: "novelty", text: "What would make an idea feel genuinely fresh instead of obvious?" },
    ],
    system: [
      "You are a creative brainstorming buddy — curious, energetic, and genuinely excited to explore ideas together.",
      "Your job is to help the student generate a wide range of possibilities before narrowing down.",
      "Offer unexpected angles, wild combinations, and 'what if' reframes freely — quantity before quality.",
      "Be encouraging and build on what the student says rather than redirecting.",
      "Never collapse to a single best answer; always leave more threads to pull.",
    ],
  },
  critical_analysis: {
    id: "critical_analysis",
    label: "Critical Analysis",
    badge: "EVALUATE",
    icon: "fact_check",
    tone: "Adversarial",
    blurb: "Interrogate claims, surface weak assumptions, and test the evidence.",
    quickActions: [
      "What assumption should I challenge first?",
      "What evidence is missing here?",
      "Give me the strongest objection to this claim",
    ],
    scaffolding: [
      { id: "claim", text: "What core claim, position, or argument are you examining?" },
      { id: "evidence", text: "What evidence or examples are currently supporting that claim?" },
      { id: "assumptions", text: "What assumptions does the claim rely on?" },
      { id: "weaknesses", text: "Where do you suspect the argument is most vulnerable?" },
    ],
    system: [
      "You are an adversarial reviewer.",
      "Challenge claims, pressure-test assumptions, and ask what evidence supports each step.",
      "Never agree without scrutiny.",
      "Stay focused on strengthening the student's reasoning, not writing the answer for them.",
    ],
  },
  structured_argumentation: {
    id: "structured_argumentation",
    label: "Structured Argumentation",
    badge: "SOCRATIC",
    icon: "balance",
    tone: "Socratic",
    blurb: "Build clear claims, warrants, and evidence into a coherent argument.",
    quickActions: [
      "Help me tighten the logic chain",
      "What counterargument should I address?",
      "Where does my evidence belong in the structure?",
    ],
    scaffolding: [
      { id: "position", text: "What position are you trying to defend?" },
      { id: "reasons", text: "What are your strongest reasons for that position?" },
      { id: "evidence", text: "What evidence best supports each reason?" },
      { id: "counterargument", text: "What serious counterargument should you anticipate and answer?" },
    ],
    system: [
      "You are a Socratic argument coach.",
      "Help the student clarify claims, warrants, evidence, and counterarguments.",
      "Ask precise questions that improve logical structure.",
      "Do not draft the finished argument for them.",
    ],
  },
  problem_decomposition: {
    id: "problem_decomposition",
    label: "Problem Decomposition",
    badge: "SYSTEMATIC",
    icon: "account_tree",
    tone: "Systematic",
    blurb: "Break a large problem into tractable parts, dependencies, and decisions.",
    quickActions: [
      "Break this into subproblems",
      "What depends on what here?",
      "What should I solve first?",
    ],
    scaffolding: [
      { id: "problem", text: "What is the larger problem you are trying to solve?" },
      { id: "subproblems", text: "What smaller pieces or workstreams make up the problem?" },
      { id: "dependencies", text: "Which pieces depend on others, and where are the bottlenecks?" },
      { id: "first_step", text: "What is the highest-leverage first step you can take?" },
    ],
    system: [
      "You are a systematic decomposition coach.",
      "Break complexity into ordered subproblems and explicit dependencies.",
      "Prioritize sequence, bottlenecks, and next actions.",
      "Keep the student in control of the decisions.",
    ],
  },
  reflective_writing: {
    id: "reflective_writing",
    label: "Reflective Writing",
    badge: "METACOGNITION",
    icon: "psychology_alt",
    tone: "Empathetic",
    blurb: "Clarify what happened, what it meant, and how you want to grow from it.",
    quickActions: [
      "Help me name the real tension here",
      "What did I learn from this moment?",
      "How can I make this reflection more honest?",
    ],
    scaffolding: [
      { id: "experience", text: "What experience, moment, or pattern are you reflecting on?" },
      { id: "feeling", text: "What felt difficult, surprising, or emotionally charged about it?" },
      { id: "meaning", text: "What do you think this experience reveals about your habits, values, or growth?" },
      { id: "next_time", text: "What would you do differently the next time a similar situation happens?" },
    ],
    system: [
      "You are an empathetic reflective-writing coach.",
      "Use calm, encouraging language that helps the student articulate meaning without judging them.",
      "Ask questions that deepen self-awareness rather than evaluation.",
      "Do not shift into adversarial critique unless the student explicitly asks for it.",
    ],
  },
};

export const GYM_MODE_ORDER = Object.keys(GYM_MODES) as GymMode[];

function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function isGymMode(value: string): value is GymMode {
  return value in GYM_MODES;
}

export function toScenario(row: Record<string, unknown>): Scenario {
  return row as unknown as Scenario;
}

export function toGymSession(
  row: Record<string, unknown> & { scaffolding?: unknown }
): GymSession {
  return {
    ...(row as unknown as Omit<GymSession, "scaffolding">),
    scaffolding:
      row.scaffolding && typeof row.scaffolding === "object"
        ? (row.scaffolding as Record<string, string>)
        : {},
  };
}

export function toGymMessage(row: Record<string, unknown>): GymMessage {
  return row as unknown as GymMessage;
}

export function getModePrompts(mode: GymMode): GymScaffoldingPrompt[] {
  return GYM_MODES[mode].scaffolding;
}

export function createInitialScaffolding(mode: GymMode): Record<string, string> {
  return Object.fromEntries(getModePrompts(mode).map((prompt) => [prompt.id, ""]));
}

export function meetsSentenceRequirement(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const sentences = trimmed
    .split(/[.!?]+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.some((sentence) => countWords(sentence) >= 5) || countWords(trimmed) >= 8;
}

export function gymChatUnlocked(
  mode: GymMode,
  scaffolding: Record<string, string>
): boolean {
  return getModePrompts(mode).every((prompt) =>
    meetsSentenceRequirement(scaffolding[prompt.id] ?? "")
  );
}

export function buildGymSystemPrompt(input: {
  mode: GymMode;
  scenarioPrompt?: string | null;
  customTopic?: string | null;
  scaffolding: Record<string, string>;
}): string {
  const config = GYM_MODES[input.mode];
  const promptText = getModePrompts(input.mode)
    .map((prompt) => {
      const response = input.scaffolding[prompt.id]?.trim();
      return response ? `${prompt.text}\n${response}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  return [
    ...BUDDY_PERSONA,
    ...config.system,
    `Tone profile: ${config.tone}.`,
    input.scenarioPrompt ? `Scenario:\n${input.scenarioPrompt}` : null,
    input.customTopic ? `Custom topic: ${input.customTopic}` : null,
    promptText ? `Student scaffolding:\n${promptText}` : null,
    "Keep responses concise, probing, and centered on the student's thinking process.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
