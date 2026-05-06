import { createServerSupabaseClient } from "@/lib/supabase";
import { anthropic, anthropicConfigured, CHAT_MODEL } from "@/lib/anthropic";
import { toAssignment, toAttempt, toReflectionResponse } from "@/lib/assignments";
import { BUDDY_PERSONA } from "@/lib/gym";

function buildSystemPrompt(prompt: string, reflections: string[]): string {
  return [
    ...BUDDY_PERSONA,
    "You are a Socratic tutor.",
    `The student is working on: ${prompt}`,
    `Their reflection: ${reflections.join("\n\n")}`,
    "Quick-action chips: evidence / challenge / strengthen.",
    "Stay aligned to the assignment; do not write the final answer for them.",
  ].join("\n");
}

export async function POST(request: Request) {
  if (!anthropicConfigured()) {
    return Response.json({ error: "Anthropic is not configured." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as {
    attemptId?: string;
    message?: string;
  } | null;

  if (!body?.attemptId || !body?.message?.trim()) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: attemptRow, error: attemptError } = await supabase
    .from("assignment_attempts")
    .select("*")
    .eq("id", body.attemptId)
    .eq("student_id", user.id)
    .single();

  if (attemptError || !attemptRow) {
    return Response.json({ error: "Attempt not found." }, { status: 404 });
  }

  const attempt = toAttempt(attemptRow);
  if (attempt.status !== "ai_assist" && attempt.status !== "synthesize") {
    return Response.json({ error: "AI is locked for this attempt." }, { status: 403 });
  }

  const [{ data: assignmentRow }, { data: chatRows }, { data: responseRows }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select("*")
        .eq("id", attempt.assignment_id)
        .single(),
      supabase
        .from("chat_messages")
        .select("*")
        .eq("attempt_id", body.attemptId)
        .order("created_at", { ascending: true }),
      supabase
        .from("reflection_responses")
        .select("*")
        .eq("attempt_id", body.attemptId)
        .order("updated_at", { ascending: true }),
    ]);

  if (!assignmentRow) {
    return Response.json({ error: "Assignment not found." }, { status: 404 });
  }

  const assignment = toAssignment(assignmentRow);
  const userCount = (chatRows ?? []).filter((row) => row.role === "user").length;
  if (userCount >= assignment.ai_msg_limit) {
    return Response.json({ error: "AI message limit reached." }, { status: 429 });
  }

  const { error: insertUserError } = await supabase.from("chat_messages").insert({
    attempt_id: body.attemptId,
    role: "user",
    content: body.message.trim(),
  });

  if (insertUserError) {
    return Response.json({ error: insertUserError.message }, { status: 500 });
  }

  const reflections = (responseRows ?? [])
    .map((row) => toReflectionResponse(row).response.trim())
    .filter(Boolean);

  const history = (chatRows ?? []).map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
  }));

  const stream = await anthropic.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: buildSystemPrompt(assignment.prompt, reflections) },
      ...history,
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
          await supabase.from("chat_messages").insert({
            attempt_id: body.attemptId,
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
