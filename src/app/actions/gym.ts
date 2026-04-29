"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  createInitialScaffolding,
  getModePrompts,
  isGymMode,
  toGymMessage,
  toGymSession,
  toScenario,
  type GymSessionBundle,
  type GymMode,
  type Scenario,
} from "@/lib/gym";

export interface StartSessionState {
  error: string | null;
}

const INITIAL_START_SESSION_STATE: StartSessionState = {
  error: null,
};

export async function startSession(
  _previousState: StartSessionState = INITIAL_START_SESSION_STATE,
  formData: FormData
): Promise<StartSessionState | never> {
  const modeValue = String(formData.get("mode") ?? "");
  const scenarioIdValue = String(formData.get("scenarioId") ?? "").trim();
  const customTopicValue = String(formData.get("customTopic") ?? "").trim();

  if (!isGymMode(modeValue)) {
    return { error: "Invalid thinking mode." };
  }

  if (!scenarioIdValue && !customTopicValue) {
    return { error: "Pick a scenario or add your own topic." };
  }

  if (scenarioIdValue && customTopicValue) {
    return { error: "Choose either a scenario or your own topic." };
  }

  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  let scenario: Scenario | null = null;
  if (scenarioIdValue) {
    const { data: scenarioRow, error: scenarioError } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", scenarioIdValue)
      .single();

    if (scenarioError || !scenarioRow) {
      return { error: "Scenario not found." };
    }

    scenario = toScenario(scenarioRow);
    if (!scenario.mode_tags.includes(modeValue)) {
      return { error: "Scenario does not match this mode." };
    }
  }

  const scaffolding = createInitialScaffolding(modeValue);
  const { data: sessionRow, error: sessionError } = await supabase
    .from("gym_sessions")
    .insert({
      student_id: user.id,
      mode: modeValue,
      scenario_id: scenario?.id ?? null,
      custom_topic: customTopicValue || null,
      scaffolding,
    })
    .select("*")
    .single();

  if (sessionError || !sessionRow) {
    return { error: sessionError?.message ?? "Unable to start session." };
  }

  redirect(`/student/gym/${modeValue}/${sessionRow.id}`);
}

export async function saveScaffoldingDraft(
  sessionId: string,
  input: { promptId: string; response: string }
): Promise<{ error: string | null }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: sessionRow, error: sessionError } = await supabase
    .from("gym_sessions")
    .select("id, mode, scaffolding")
    .eq("id", sessionId)
    .eq("student_id", user.id)
    .single();

  if (sessionError || !sessionRow) {
    return { error: "Session not found." };
  }

  const allowedPromptIds = new Set(getModePrompts(sessionRow.mode as GymMode).map((prompt) => prompt.id));
  if (!allowedPromptIds.has(input.promptId)) {
    return { error: "Scaffolding prompt not found." };
  }

  const scaffolding =
    sessionRow.scaffolding && typeof sessionRow.scaffolding === "object"
      ? (sessionRow.scaffolding as Record<string, string>)
      : {};

  const { error: updateError } = await supabase
    .from("gym_sessions")
    .update({
      scaffolding: {
        ...scaffolding,
        [input.promptId]: input.response,
      },
    })
    .eq("id", sessionId)
    .eq("student_id", user.id);

  return { error: updateError?.message ?? null };
}

export async function completeSession(
  sessionId: string
): Promise<{ error: string | null; completedAt?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: sessionRow, error: sessionError } = await supabase
    .from("gym_sessions")
    .select("completed_at")
    .eq("id", sessionId)
    .eq("student_id", user.id)
    .single();

  if (sessionError || !sessionRow) {
    return { error: "Session not found." };
  }

  if (sessionRow.completed_at) {
    return { error: null, completedAt: sessionRow.completed_at };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("gym_sessions")
    .update({
      completed_at: now,
    })
    .eq("id", sessionId)
    .eq("student_id", user.id)
    .is("completed_at", null);

  return {
    error: error?.message ?? null,
    completedAt: error ? undefined : now,
  };
}

export async function getSessionForStudent(
  sessionId: string
): Promise<GymSessionBundle | { error: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Not authenticated." };

  const { data: sessionRow, error: sessionError } = await supabase
    .from("gym_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", user.id)
    .single();

  if (sessionError || !sessionRow) {
    return { error: "Session not found." };
  }

  const session = toGymSession(sessionRow);
  const [{ data: scenarioRow }, { data: messageRows }] = await Promise.all([
    session.scenario_id
      ? supabase.from("scenarios").select("*").eq("id", session.scenario_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("gym_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
  ]);

  return {
    session,
    scenario: scenarioRow ? toScenario(scenarioRow) : null,
    messages: (messageRows ?? []).map((row) => toGymMessage(row)),
  };
}

export async function listScenariosForMode(mode: GymMode): Promise<Scenario[]> {
  const { supabase, user } = await requireUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .contains("mode_tags", [mode])
    .order("title", { ascending: true });

  if (error) return [];

  return (data ?? []).map((row) => toScenario(row));
}
