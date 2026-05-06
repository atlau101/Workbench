import OpenAI from "openai";

export const anthropic = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const CHAT_MODEL = "gemini-2.5-flash";

export function anthropicConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
