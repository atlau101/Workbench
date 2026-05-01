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
  type GymSession,
  type GymMessage,
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

export interface InstructorGymSessionItem {
  sessionId: string;
  studentId: string;
  studentLabel: string;
  studentEmail: string | null;
  mode: GymMode;
  scenarioTitle: string | null;
  customTopic: string | null;
  messageCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface InstructorGymSessionBundle {
  session: GymSession;
  scenario: Scenario | null;
  messages: GymMessage[];
  studentLabel: string;
  studentEmail: string | null;
}

function formatStudentLabel(
  profile: { email?: string | null; full_name?: string | null } | null,
  studentId: string
): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  if (profile?.email?.trim()) return profile.email.trim();
  return `Student ${studentId.slice(0, 8)}`;
}

export async function listGymSessionsForInstructor(): Promise<InstructorGymSessionItem[]> {
  const { supabase, user } = await requireUser();
  if (!user) return [];

  const { data: sessionRows, error } = await supabase
    .from("gym_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(200);

  if (error || !sessionRows?.length) return [];

  const sessions = sessionRows.map((row) => toGymSession(row));
  const sessionIds = sessions.map((s) => s.id);
  const studentIds = [...new Set(sessions.map((s) => s.student_id))];
  const scenarioIds = [...new Set(sessions.map((s) => s.scenario_id).filter(Boolean))] as string[];

  const [profilesResult, messageRows, scenariosResult] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name").in("id", studentIds),
    supabase.from("gym_messages").select("session_id").in("session_id", sessionIds),
    scenarioIds.length
      ? supabase.from("scenarios").select("id, title").in("id", scenarioIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const profileMap = new Map(
    (profilesResult.data ?? []).map((p) => [p.id, p])
  );
  const scenarioMap = new Map(
    ((scenariosResult as { data: { id: string; title: string }[] }).data ?? []).map((s) => [s.id, s.title])
  );
  const messageCountMap = new Map<string, number>();
  for (const row of messageRows.data ?? []) {
    const count = messageCountMap.get(row.session_id) ?? 0;
    messageCountMap.set(row.session_id, count + 1);
  }

  return sessions.map((session) => {
    const profile = profileMap.get(session.student_id) ?? null;
    return {
      sessionId: session.id,
      studentId: session.student_id,
      studentLabel: formatStudentLabel(profile, session.student_id),
      studentEmail: profile?.email ?? null,
      mode: session.mode,
      scenarioTitle: session.scenario_id ? (scenarioMap.get(session.scenario_id) ?? null) : null,
      customTopic: session.custom_topic,
      messageCount: messageCountMap.get(session.id) ?? 0,
      startedAt: session.started_at,
      completedAt: session.completed_at,
    };
  });
}

export async function getGymSessionForInstructor(
  sessionId: string
): Promise<InstructorGymSessionBundle | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const { data: sessionRow, error } = await supabase
    .from("gym_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !sessionRow) return null;
  const session = toGymSession(sessionRow);

  const [messagesResult, scenarioResult, profileResult] = await Promise.all([
    supabase
      .from("gym_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
    session.scenario_id
      ? supabase.from("scenarios").select("*").eq("id", session.scenario_id).single()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", session.student_id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data ?? null;
  return {
    session,
    scenario: scenarioResult.data ? toScenario(scenarioResult.data as Record<string, unknown>) : null,
    messages: (messagesResult.data ?? []).map((row) => toGymMessage(row)),
    studentLabel: formatStudentLabel(profile, session.student_id),
    studentEmail: profile?.email ?? null,
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
