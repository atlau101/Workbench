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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
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

  return (
    <GuideArea className="flex min-h-[720px] flex-col overflow-hidden border-[color-mix(in_srgb,var(--color-primary)_35%,white)] shadow-[0_4px_20px_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)]">
      <div className="border-b border-[color-mix(in_srgb,var(--color-primary)_20%,white)] bg-white/60 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-[Lexend] text-[20px] font-semibold text-[var(--color-primary)]">
              {config.label} Coach
            </h3>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {userCount} / {GYM_MESSAGE_LIMIT} messages used
            </p>
          </div>
          <PillTag color={completed ? "amber" : "teal"}>
            {completed ? "Session complete" : config.tone}
          </PillTag>
        </div>
      </div>

      <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto p-6">
        {!hasMessages ? (
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-[color-mix(in_srgb,var(--color-primary)_25%,white)] bg-white p-4 text-sm leading-7 text-[var(--color-on-surface)] shadow-sm">
            {chatUnlocked
              ? `Your scaffolding is ready. Use this ${config.tone.toLowerCase()} coach to sharpen your thinking.`
              : "Complete each scaffolding prompt with at least one sentence to unlock the coach."}
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
          {config.quickActions.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setDraft(label)}
              disabled={composerDisabled}
              className="rounded-full border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container-low)]"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={composerDisabled}
            rows={4}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container-low)]"
            placeholder={
              completed
                ? "This session is complete."
                : !chatUnlocked
                ? "Finish the scaffolding first."
                : limitReached
                  ? "Message limit reached."
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
                  : "The coach should deepen your reasoning, not replace it."}
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
      </div>
    </GuideArea>
  );
}
