"use client";

import { useEffect, useMemo, useState } from "react";
import { saveFinalDraft } from "@/app/actions/attempts";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import type { Assignment, FinalOutput } from "@/lib/assignments";

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

interface SynthesizePhaseProps {
  attemptId: string;
  assignment: Pick<Assignment, "gate_level" | "stage_instructions">;
  finalOutput: FinalOutput | null;
}

export default function SynthesizePhase({
  attemptId,
  assignment,
  finalOutput,
}: SynthesizePhaseProps) {
  const [content, setContent] = useState(finalOutput?.content ?? "");
  const [savedAt, setSavedAt] = useState<string | null>(
    finalOutput?.updated_at ?? null
  );
  const [error, setError] = useState<string | null>(null);

  const relativeSavedAt = useMemo(() => formatRelativeTime(savedAt), [savedAt]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (content === (finalOutput?.content ?? "")) return;

      const result = await saveFinalDraft(attemptId, content);
      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      setSavedAt(result.savedAt ?? new Date().toISOString());
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [attemptId, content, finalOutput?.content]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-[Lexend] text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">
            Synthesize Your Final Draft
          </h2>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Draft freely here. There is no hard submit button in the MVP.
          </p>
        </div>
        <PillTag color="neutral">Last saved {relativeSavedAt}</PillTag>
      </div>

      {assignment.gate_level === "progressive" && assignment.stage_instructions?.synthesize ? (
        <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm leading-6 text-[var(--color-on-surface-variant)]">
          {assignment.stage_instructions.synthesize}
        </div>
      ) : null}

      <SandboxArea className="p-6 shadow-sm">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-[400px] w-full resize-y bg-transparent text-[16px] leading-8 text-[var(--color-on-surface)] outline-none"
          placeholder="Bring together your reflection and AI-assisted thinking into a full draft."
        />
      </SandboxArea>

      {error ? (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      ) : null}
    </div>
  );
}
