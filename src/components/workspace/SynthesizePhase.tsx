"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { saveFinalDraft, submitAttempt } from "@/app/actions/attempts";
import Button from "@/components/ui/Button";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import type { Assignment, Attempt, ChatMessage, FinalOutput, ReflectionResponse } from "@/lib/assignments";

function formatRelativeTime(value: string | null): string {
  if (!value) return "Not saved yet";

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 1) return "just now";
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

function formatAbsoluteTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

interface SynthesizePhaseProps {
  attemptId: string;
  attempt: Pick<Attempt, "status" | "submittedAt">;
  assignment: Pick<Assignment, "gate_level" | "stage_instructions" | "minSynthesisWords" | "scaffolding_prompts">;
  finalOutput: FinalOutput | null;
  responses: ReflectionResponse[];
  chatMessages: ChatMessage[];
}

export default function SynthesizePhase({
  attemptId,
  attempt,
  assignment,
  finalOutput,
  responses,
  chatMessages,
}: SynthesizePhaseProps) {
  const [content, setContent] = useState(finalOutput?.content ?? "");
  const [savedContent, setSavedContent] = useState(finalOutput?.content ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(
    finalOutput?.updated_at ?? null
  );
  const [submittedAt, setSubmittedAt] = useState<string | null>(
    attempt.submittedAt
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const relativeSavedAt = useMemo(() => formatRelativeTime(savedAt), [savedAt]);
  const isSubmitted = attempt.status === "submitted" || Boolean(submittedAt);
  const currentWordCount = useMemo(() => countWords(content), [content]);
  const wordFloorMet = currentWordCount >= assignment.minSynthesisWords;

  const [panelOpen, setPanelOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("synth-panel-open");
    return stored === null ? true : stored === "true";
  });
  const [panelTab, setPanelTab] = useState<"reflection" | "chat">("reflection");
  const panelInitialized = useRef(false);

  useEffect(() => {
    if (!panelInitialized.current) {
      panelInitialized.current = true;
      return;
    }
    window.localStorage.setItem("synth-panel-open", String(panelOpen));
  }, [panelOpen]);

  const promptsById = Object.fromEntries(
    assignment.scaffolding_prompts.map((p) => [p.id, p.text])
  );

  useEffect(() => {
    if (isSubmitted || content === savedContent) return;

    const timer = window.setTimeout(async () => {
      setIsSaving(true);
      const result = await saveFinalDraft(attemptId, content);
      setIsSaving(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      setSavedContent(content);
      setSavedAt(result.savedAt ?? new Date().toISOString());
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [attemptId, content, isSubmitted, savedContent]);

  async function handleSubmit() {
    if (isSubmitted || isSaving || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    if (content !== savedContent) {
      setIsSaving(true);
      const saveResult = await saveFinalDraft(attemptId, content);
      setIsSaving(false);

      if (saveResult.error) {
        setIsSubmitting(false);
        setError(saveResult.error);
        return;
      }

      setSavedContent(content);
      setSavedAt(saveResult.savedAt ?? new Date().toISOString());
    }

    const submitResult = await submitAttempt(attemptId);
    setIsSubmitting(false);

    if (submitResult.error) {
      setError(submitResult.error);
      return;
    }

    setSubmittedAt(submitResult.submittedAt ?? new Date().toISOString());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">
            Synthesize Your Final Draft
          </h2>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            {isSubmitted
              ? "This draft has been submitted and is now locked."
              : "Autosaves as you write. Submit when your final draft is ready."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSubmitted && submittedAt ? (
            <PillTag color="teal">Submitted {formatAbsoluteTime(submittedAt)}</PillTag>
          ) : (
            <PillTag color="neutral">Last saved {relativeSavedAt}</PillTag>
          )}
          {!isSubmitted && (
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-3 py-1.5 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <span className="material-symbols-outlined text-[16px]">
                {panelOpen ? "side_navigation" : "menu_open"}
              </span>
              {panelOpen ? "Hide notes" : "Show notes"}
            </button>
          )}
        </div>
      </div>

      {assignment.gate_level === "progressive" && assignment.stage_instructions?.synthesize ? (
        <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          {assignment.stage_instructions.synthesize}
        </div>
      ) : null}

      <div className={`grid gap-6 ${panelOpen && !isSubmitted ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
        <div className="space-y-4">
          <SandboxArea className="p-6 shadow-sm">
            <textarea
              value={content}
              onChange={(event) => {
                setError(null);
                setContent(event.target.value);
              }}
              readOnly={isSubmitted}
              className={`min-h-[400px] w-full resize-y text-[16px] leading-8 text-[var(--color-on-surface)] outline-none ${
                isSubmitted ? "cursor-not-allowed bg-[var(--color-surface-container-low)]/60" : "bg-transparent"
              }`}
              placeholder="Bring together your reflection and AI-assisted thinking into a full draft."
            />
          </SandboxArea>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              {error ? (
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              ) : (
                <span className="text-sm text-[var(--color-on-surface-variant)]">
                  {isSubmitted
                    ? "Your final draft is locked for review."
                    : isSaving
                      ? "Saving..."
                      : "Autosave runs while you write."}
                </span>
              )}
              {!isSubmitted && (
                <p className={`text-sm font-medium ${wordFloorMet ? "text-[var(--color-primary)]" : "text-[var(--color-on-surface-variant)]"}`}>
                  {currentWordCount} / {assignment.minSynthesisWords} words minimum
                </p>
              )}
            </div>
            {isSubmitted && submittedAt ? (
              <span className="text-sm font-medium text-[var(--color-on-surface)]">
                Submitted at {formatAbsoluteTime(submittedAt)}
              </span>
            ) : (
              <Button
                variant="motivational"
                size="lg"
                onClick={handleSubmit}
                disabled={isSaving || isSubmitting || !wordFloorMet}
              >
                {isSubmitting ? "Submitting..." : "Submit final draft"}
                {!isSubmitting && <span className="material-symbols-outlined text-[18px]">check</span>}
              </Button>
            )}
          </div>
        </div>

        {panelOpen && !isSubmitted ? (
          <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex flex-col overflow-hidden h-fit max-h-[600px] sticky top-8">
            {/* Tab bar */}
            <div className="flex border-b border-[var(--color-outline-variant)]">
              {(["reflection", "chat"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPanelTab(tab)}
                  className={[
                    "flex-1 py-3 text-sm font-medium transition-colors",
                    panelTab === tab
                      ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] -mb-px"
                      : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]",
                  ].join(" ")}
                >
                  {tab === "reflection" ? "Your Reflection" : "AI Conversation"}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto p-4 space-y-3 flex-1">
              {panelTab === "reflection" ? (
                responses.length === 0 ? (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">No reflection responses found.</p>
                ) : (
                  responses.map((r) => (
                    <div key={r.id} className="space-y-1">
                      {promptsById[r.prompt_id] ? (
                        <p className="text-xs font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide">
                          {promptsById[r.prompt_id]}
                        </p>
                      ) : null}
                      <p className="text-sm leading-6 text-[var(--color-on-surface)] whitespace-pre-wrap">
                        {r.response || <span className="italic text-[var(--color-on-surface-variant)]">(no response)</span>}
                      </p>
                    </div>
                  ))
                )
              ) : (
                chatMessages.length === 0 ? (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">No AI conversation recorded.</p>
                ) : (
                  chatMessages.map((m) => (
                    <div key={m.id} className="space-y-0.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                        {m.role === "user" ? "You" : "AI"}
                      </p>
                      <p className="text-sm leading-6 text-[var(--color-on-surface)] whitespace-pre-wrap">
                        {m.content}
                      </p>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
