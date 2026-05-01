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

const ruledPaper: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(transparent 0px, transparent 27px, var(--color-outline-variant) 27px, var(--color-outline-variant) 28px)",
  backgroundSize: "100% 28px",
};

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, message }),
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
            item.id === assistantMessage.id ? { ...item, content: assistantText } : item
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
      {/* Left: locked reflection */}
      <SandboxArea className="overflow-hidden">
        <div className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[18px] font-medium text-[var(--color-on-surface)]">
              Your Reflection
            </h2>
            <PillTag color="neutral">Locked</PillTag>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="rounded-[var(--radius)] bg-[var(--color-surface-container-low)] p-4 text-sm leading-7 text-[var(--color-on-surface)] whitespace-pre-wrap">
            {assignment.prompt}
          </div>
          {reflectionText.map((text, index) => (
            <div
              key={index}
              className="rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white p-4 text-sm leading-7 text-[var(--color-on-surface)]"
            >
              {text}
            </div>
          ))}
        </div>
      </SandboxArea>

      {/* Right: binder-paper thinking partner */}
      <GuideArea className="flex min-h-[640px] flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-[18px] font-medium text-[var(--color-primary)]">
                Thinking Partner
              </h2>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                {userCount} / {assignment.ai_msg_limit} exchanges used
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

        {/* Thread — ruled paper surface */}
        <div
          aria-live="polite"
          className="flex-1 overflow-y-auto bg-white px-6 py-4"
          style={ruledPaper}
        >
          {/* Welcome note */}
          {!hasMessages ? (
            <div className="flex gap-4 py-3">
              <span className="w-8 shrink-0 text-right font-heading text-[10px] font-semibold uppercase tracking-widest text-[var(--color-primary)] pt-1">
                AI
              </span>
              <p className="flex-1 text-[15px] leading-7 text-[var(--color-on-surface)]">
                Great start. You&apos;ve unlocked AI assistance. Ask for evidence, challenge your thesis, or strengthen your argument before moving to synthesis.
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <div key={message.id} className="flex gap-4 py-3">
              <span
                className={[
                  "w-8 shrink-0 text-right font-heading text-[10px] font-semibold uppercase tracking-widest pt-1",
                  message.role === "user"
                    ? "text-[var(--color-on-surface-variant)]"
                    : "text-[var(--color-primary)]",
                ].join(" ")}
              >
                {message.role === "user" ? "You" : "AI"}
              </span>
              {message.role === "user" ? (
                <p className="flex-1 text-[15px] leading-7 text-[var(--color-on-surface)]">
                  {message.content}
                </p>
              ) : (
                <div className="flex-1 rounded-[var(--radius)] bg-[var(--color-surface-container-low)] px-4 py-3 text-[15px] leading-7 text-[var(--color-on-surface)]">
                  {message.content || (message.pending ? "..." : "")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 pt-4 pb-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setDraft(label)}
                className="rounded-full border border-[var(--color-outline-variant)] bg-white px-3 py-1.5 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {label}
              </button>
            ))}
          </div>

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={limitReached}
            rows={3}
            className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container)]"
            placeholder={
              limitReached
                ? "Exchange limit reached."
                : "Ask AI to challenge or strengthen your thinking."
            }
          />
          <div className="flex items-center justify-between gap-4">
            {error ? (
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            ) : (
              <span className="text-sm text-[var(--color-on-surface-variant)]">
                Stay on the assignment. AI won&apos;t write the final answer for you.
              </span>
            )}
            <Button variant="primary" onClick={handleSend} disabled={!draft.trim() || limitReached}>
              Send
            </Button>
          </div>
        </div>

        {/* Progression — visually separated */}
        <div className="border-t-2 border-dashed border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Ready to write your final draft?
            </p>
            <Button variant="motivational" size="lg" onClick={handleContinue} disabled={isPending}>
              Continue to Synthesize
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Button>
          </div>
        </div>
      </GuideArea>
    </div>
  );
}
