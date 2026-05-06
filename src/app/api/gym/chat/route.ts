import { createServerSupabaseClient } from "@/lib/supabase";
import { anthropic, anthropicConfigured, CHAT_MODEL } from "@/lib/anthropic";
import {
  buildGymSystemPrompt,
  GYM_MESSAGE_LIMIT,
  gymChatUnlocked,
  isGymMode,
  toGymMessage,
  toGymSession,
  toScenario,
} from "@/lib/gym";

export async function POST(request: Request) {
  if (!anthropicConfigured()) {
    return Response.json({ error: "Anthropic is not configured." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
    message?: string;
  } | null;

  if (!body?.sessionId || !body?.message?.trim()) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: sessionRow, error: sessionError } = await supabase
    .from("gym_sessions")
    .select("*")
    .eq("id", body.sessionId)
    .eq("student_id", user.id)
    .single();

  if (sessionError || !sessionRow) {
    return Response.json({ error: "Session not found." }, { status: 404 });
  }

  const session = toGymSession(sessionRow);
  if (!isGymMode(session.mode)) {
    return Response.json({ error: "Invalid session mode." }, { status: 400 });
  }

  if (session.completed_at) {
    return Response.json({ error: "Session is complete." }, { status: 409 });
  }

  if (!gymChatUnlocked(session.mode, session.scaffolding)) {
    return Response.json({ error: "AI is locked for this session." }, { status: 403 });
  }

  const [{ data: scenarioRow }, { data: messageRows }] = await Promise.all([
    session.scenario_id
      ? supabase.from("scenarios").select("*").eq("id", session.scenario_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from("gym_messages")
      .select("*")
      .eq("session_id", body.sessionId)
      .order("created_at", { ascending: true }),
  ]);

  const userCount = (messageRows ?? []).filter((row) => row.role === "user").length;
  if (userCount >= GYM_MESSAGE_LIMIT) {
    return Response.json({ error: "AI message limit reached." }, { status: 429 });
  }

  const { error: insertUserError } = await supabase.from("gym_messages").insert({
    session_id: body.sessionId,
    role: "user",
    content: body.message.trim(),
  });

  if (insertUserError) {
    return Response.json({ error: insertUserError.message }, { status: 500 });
  }

  const history = (messageRows ?? []).map((row) => toGymMessage(row));
  const scenario = scenarioRow ? toScenario(scenarioRow) : null;

  const systemPrompt = buildGymSystemPrompt({
    mode: session.mode,
    scenarioPrompt: scenario?.prompt ?? null,
    customTopic: session.custom_topic,
    scaffolding: session.scaffolding,
  });

  const stream = await anthropic.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user", content: body.message.trim() },
    ],
    stream: true,
  });

  let assistantText = "";
  const encoder = new TextEncoder();
  const responseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            assistantText += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }

        if (assistantText.trim()) {
          await supabase.from("gym_messages").insert({
            session_id: body.sessionId,
            role: "assistant",
            content: assistantText,
          });
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
