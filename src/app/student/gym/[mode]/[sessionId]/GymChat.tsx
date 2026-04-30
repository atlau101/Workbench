"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import GuideArea from "@/components/ui/GuideArea";
import PillTag from "@/components/ui/PillTag";
import {
  GYM_MESSAGE_LIMIT,
  GYM_MODES,
  type GymMessage,
  type GymMode,
} from "@/lib/gym";

type LocalMessage = GymMessage & { pending?: boolean };

interface GymChatProps {
  sessionId: string;
  mode: GymMode;
  initialMessages: GymMessage[];
  unlocked: boolean;
  completedAt: string | null;
}

const ruledPaper: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(transparent 0px, transparent 27px, var(--color-outline-variant) 27px, var(--color-outline-variant) 28px)",
  backgroundSize: "100% 28px",
};

export default function GymChat({
  sessionId,
  mode,
  initialMessages,
  unlocked,
  completedAt,
}: GymChatProps) {
  const config = GYM_MODES[mode];
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [chatUnlocked, setChatUnlocked] = useState(unlocked);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const userCount = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages]
  );
  const completed = Boolean(completedAt);
  const limitReached = userCount >= GYM_MESSAGE_LIMIT || isSending;
  const hasMessages = messages.length > 0;
  const composerDisabled = !chatUnlocked || limitReached || completed;

  useEffect(() => {
    setChatUnlocked(unlocked);
  }, [unlocked]);

  useEffect(() => {
    function handleUnlockChange(event: Event) {
      const detail = (
        event as CustomEvent<{ sessionId?: string; unlocked?: boolean }>
      ).detail;
      if (detail?.sessionId === sessionId) {
        setChatUnlocked(Boolean(detail.unlocked));
      }
    }
    window.addEventListener("gym-session-unlock", handleUnlockChange as EventListener);
    return () => {
      window.removeEventListener("gym-session-unlock", handleUnlockChange as EventListener);
    };
  }, [sessionId]);

  async function handleSend() {
    const message = draft.trim();
    if (!message || !chatUnlocked || limitReached || completed) return;

    setDraft("");
    setError(null);
    setIsSending(true);

    const timestamp = new Date().toISOString();
    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: message,
      created_at: timestamp,
      pending: true,
    };
    const assistantMessage: LocalMessage = {
      id: `assistant-${Date.now()}`,
      session_id: sessionId,
      role: "assistant",
      content: "",
      created_at: timestamp,
      pending: true,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/gym/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }),
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

  return (
    <GuideArea className="flex min-h-[720px] flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-[var(--font-heading)] text-[20px] font-semibold text-[var(--color-primary)]">
              {config.label} Coach
            </h3>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {userCount} / {GYM_MESSAGE_LIMIT} exchanges used
            </p>
          </div>
          <PillTag color={completed ? "amber" : "teal"}>
            {completed ? "Session complete" : config.tone}
          </PillTag>
        </div>
      </div>

      {/* Thread — ruled paper surface */}
      <div
        aria-live="polite"
        className="flex-1 overflow-y-auto bg-white px-6 py-4"
        style={ruledPaper}
      >
        {/* Locked/welcome state */}
        {!hasMessages ? (
          <div className="flex gap-4 py-3">
            <span className="w-8 shrink-0 text-right font-[var(--font-heading)] text-[10px] font-semibold uppercase tracking-widest text-[var(--color-primary)] pt-1">
              AI
            </span>
            <p className="flex-1 text-[15px] leading-7 text-[var(--color-on-surface)]">
              {chatUnlocked
                ? `Your scaffolding is ready. Use this ${config.tone.toLowerCase()} coach to sharpen your thinking.`
                : "Complete each scaffolding prompt with at least one sentence to unlock the coach."}
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className="flex gap-4 py-3">
            <span
              className={[
                "w-8 shrink-0 text-right font-[var(--font-heading)] text-[10px] font-semibold uppercase tracking-widest pt-1",
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
      <div className="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 pt-4 pb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {config.quickActions.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraft(label)}
              disabled={composerDisabled}
              className="rounded-full border border-[var(--color-outline-variant)] bg-white px-3 py-1.5 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={composerDisabled}
          rows={3}
          className="w-full rounded-[var(--radius)] border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container)]"
          placeholder={
            completed
              ? "This session is complete."
              : !chatUnlocked
              ? "Finish the scaffolding first."
              : limitReached
              ? "Exchange limit reached."
              : `Ask the ${config.tone.toLowerCase()} coach to push your thinking.`
          }
        />
        <div className="flex items-center justify-between gap-4">
          {error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : (
            <span className="text-sm text-[var(--color-on-surface-variant)]">
              {completed
                ? "Session complete. Chat is locked."
                : "The coach deepens your reasoning. It won’t do the thinking for you."}
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!draft.trim() || composerDisabled}
          >
            Send
          </Button>
        </div>
      </div>
    </GuideArea>
  );
}
