"use client";

import { useEffect, useMemo, useState } from "react";
import { saveFinalDraft, submitAttempt } from "@/app/actions/attempts";
import Button from "@/components/ui/Button";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import type { Assignment, Attempt, FinalOutput } from "@/lib/assignments";

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

interface SynthesizePhaseProps {
  attemptId: string;
  attempt: Pick<Attempt, "status" | "submittedAt">;
  assignment: Pick<Assignment, "gate_level" | "stage_instructions">;
  finalOutput: FinalOutput | null;
}

export default function SynthesizePhase({
  attemptId,
  attempt,
  assignment,
  finalOutput,
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
          <h2 className="font-[var(--font-heading)] text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">
            Synthesize Your Final Draft
          </h2>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            {isSubmitted
              ? "This draft has been submitted and is now locked."
              : "Autosaves as you write. Submit when your final draft is ready."}
          </p>
        </div>
        {isSubmitted && submittedAt ? (
          <PillTag color="teal">Submitted {formatAbsoluteTime(submittedAt)}</PillTag>
        ) : (
          <PillTag color="neutral">Last saved {relativeSavedAt}</PillTag>
        )}
      </div>

      {assignment.gate_level === "progressive" && assignment.stage_instructions?.synthesize ? (
        <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          {assignment.stage_instructions.synthesize}
        </div>
      ) : null}

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
        {isSubmitted && submittedAt ? (
          <span className="text-sm font-medium text-[var(--color-on-surface)]">
            Submitted at {formatAbsoluteTime(submittedAt)}
          </span>
        ) : (
          <Button
            variant="motivational"
            size="lg"
            onClick={handleSubmit}
            disabled={isSaving || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit final draft"}
            {!isSubmitting && <span className="material-symbols-outlined text-[18px]">check</span>}
          </Button>
        )}
      </div>
    </div>
  );
}
