"use client";

import { useMemo, useState, useTransition } from "react";
import { goToSynthesize } from "@/app/actions/attempts";
import Button from "@/components/ui/Button";
import GuideArea from "@/components/ui/GuideArea";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import type { Assignment, ChatMessage, ReflectionResponse } from "@/lib/assignments";

const QUICK_ACTIONS = [
  "Help me find evidence",
  "Challenge my thesis",
  "Strengthen my argument",
];

interface AIAssistPhaseProps {
  attemptId: string;
  assignment: Pick<
    Assignment,
    "prompt" | "ai_msg_limit" | "gate_level" | "stage_instructions"
  >;
  responses: ReflectionResponse[];
  chatMessages: ChatMessage[];
}

type LocalMessage = ChatMessage & { pending?: boolean };

export default function AIAssistPhase({
  attemptId,
  assignment,
  responses,
  chatMessages,
}: AIAssistPhaseProps) {
  const [messages, setMessages] = useState<LocalMessage[]>(chatMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isPending, startTransition] = useTransition();

  const userCount = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages]
  );
  const limitReached = userCount >= assignment.ai_msg_limit || isSending;

  async function handleSend() {
    const message = draft.trim();
    if (!message || limitReached) return;

    setDraft("");
    setError(null);
    setIsSending(true);

    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      attempt_id: attemptId,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
      pending: true,
    };
    const assistantMessage: LocalMessage = {
      id: `assistant-${Date.now()}`,
      attempt_id: attemptId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      pending: true,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          message,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Unable to send message.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessage.id
              ? { ...item, content: assistantText }
              : item
          )
        );
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === userMessage.id || item.id === assistantMessage.id
            ? { ...item, pending: false }
            : item
        )
      );
    } catch (caught) {
      const messageText =
        caught instanceof Error ? caught.message : "Unable to send message.";
      setMessages((current) =>
        current.filter(
          (item) => item.id !== userMessage.id && item.id !== assistantMessage.id
        )
      );
      setDraft(message);
      setError(messageText);
    } finally {
      setIsSending(false);
    }
  }

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      const result = await goToSynthesize(attemptId);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  const reflectionText = responses
    .map((response) => response.response.trim())
    .filter(Boolean);

  const hasMessages = messages.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SandboxArea className="overflow-hidden">
        <div className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[Lexend] text-[18px] font-medium text-[var(--color-on-surface)]">
              Your Reflection
            </h2>
            <PillTag color="neutral">Locked</PillTag>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="rounded-lg bg-[var(--color-surface-container-low)] p-4 text-sm leading-7 text-[var(--color-on-surface)] whitespace-pre-wrap">
            {assignment.prompt}
          </div>
          {reflectionText.map((text, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--color-outline-variant)] bg-white p-4 text-sm leading-7 text-[var(--color-on-surface)]"
            >
              {text}
            </div>
          ))}
        </div>
      </SandboxArea>

      <GuideArea className="flex min-h-[640px] flex-col overflow-hidden border-[color-mix(in_srgb,var(--color-primary)_35%,white)] shadow-[0_4px_20px_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
        <div className="border-b border-[color-mix(in_srgb,var(--color-primary)_20%,white)] bg-white/60 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-[Lexend] text-[18px] font-medium text-[var(--color-primary)]">
                AI Assistant
              </h2>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                {userCount} / {assignment.ai_msg_limit} messages used
              </p>
            </div>
            <PillTag color="teal">AI Guide</PillTag>
          </div>
          {assignment.gate_level === "progressive" && assignment.stage_instructions?.ai_assist ? (
            <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {assignment.stage_instructions.ai_assist}
            </p>
          ) : null}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {!hasMessages ? (
            <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-[color-mix(in_srgb,var(--color-primary)_25%,white)] bg-white p-4 text-sm leading-7 text-[var(--color-on-surface)] shadow-sm">
              Great start. You&apos;ve unlocked AI assistance. Ask for evidence, challenge your thesis, or strengthen your argument before moving to synthesis.
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-4 text-sm leading-7 shadow-sm ${
                  message.role === "user"
                    ? "rounded-tr-sm bg-[color-mix(in_srgb,var(--color-amber)_20%,white)] text-[var(--color-on-surface)]"
                    : "rounded-tl-sm border border-[color-mix(in_srgb,var(--color-primary)_25%,white)] bg-white text-[var(--color-on-surface)]"
                }`}
              >
                {message.content || (message.pending ? "..." : "")}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-[color-mix(in_srgb,var(--color-primary)_20%,white)] bg-white/70 p-6">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setDraft(label)}
                className="rounded-full border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={limitReached}
              rows={4}
              className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container-low)]"
              placeholder={
                limitReached
                  ? "Message limit reached."
                  : "Ask AI to challenge or strengthen your thinking."
              }
            />
            <div className="flex items-center justify-between gap-4">
              {error ? (
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              ) : (
                <span className="text-sm text-[var(--color-on-surface-variant)]">
                  Stay aligned to the assignment. AI will not write the final answer for you.
                </span>
              )}
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!draft.trim() || limitReached}
              >
                Send
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="motivational"
              size="lg"
              onClick={handleContinue}
              disabled={isPending}
            >
              Continue to Synthesize
            </Button>
          </div>
        </div>
      </GuideArea>
    </div>
  );
}
