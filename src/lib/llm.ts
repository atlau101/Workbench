import OpenAI from "openai";

export const anthropic = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const CHAT_MODEL = "gemini-2.5-flash";

export function anthropicConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export interface ReflectionQualityResult {
  pass: boolean;
  feedback: string;
}

export async function evaluateReflectionQuality(input: {
  assignmentPrompt: string;
  scaffoldingPrompts: string[];
  responses: string[];
}): Promise<ReflectionQualityResult> {
  const promptPairs = input.scaffoldingPrompts
    .map((prompt, i) => `Prompt ${i + 1}: ${prompt}\nResponse ${i + 1}: ${input.responses[i] ?? "(no response)"}`)
    .join("\n\n");

  const systemMessage = `You are evaluating a student's reflection for an assignment.
Assignment context: ${input.assignmentPrompt}

Judge whether the student's responses show genuine engagement with each prompt — not whether they are correct or well-written, but whether they demonstrate real thinking: personal perspective, specific reasoning, or grappling with complexity.

Filler text, restating the question, or vague generic statements should fail.

Respond with valid JSON only, no markdown:
{"pass": true/false, "feedback": "One or two sentences. If failing, be specific and encouraging about what to add."}`;

  const result = await anthropic.chat.completions.create({
    model: CHAT_MODEL,
    max_tokens: 256,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: promptPairs },
    ],
  });

  const raw = result.choices[0]?.message?.content?.trim() ?? "";

  try {
    const parsed = JSON.parse(raw) as { pass?: boolean; feedback?: string };
    return {
      pass: Boolean(parsed.pass),
      feedback: parsed.feedback ?? (parsed.pass ? "Good reflection." : "Try to add more specific personal thinking."),
    };
  } catch {
    // If JSON parse fails, fail safe — don't block the student
    return { pass: true, feedback: "" };
  }
}
