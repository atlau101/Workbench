"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { passReflectionGate, saveReflectionDraft } from "@/app/actions/attempts";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import { totalWordCount, type Assignment, type ReflectionResponse } from "@/lib/assignments";

interface ReflectPhaseProps {
  attemptId: string;
  assignment: Pick<
    Assignment,
    "gate_level" | "minWordCount" | "scaffolding_prompts" | "stage_instructions"
  >;
  responses: ReflectionResponse[];
}

export default function ReflectPhase({
  attemptId,
  assignment,
  responses,
}: ReflectPhaseProps) {
  const initialResponses = useMemo(
    () => Object.fromEntries(responses.map((response) => [response.prompt_id, response.response])),
    [responses]
  );
  const [drafts, setDrafts] = useState<Record<string, string>>(initialResponses);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timers = responses.map((response) => {
      const nextValue = drafts[response.prompt_id] ?? "";
      if (nextValue === response.response || response.frozen) return null;

      return window.setTimeout(async () => {
        setSaving((current) => ({ ...current, [response.prompt_id]: true }));
        const result = await saveReflectionDraft(attemptId, {
          promptId: response.prompt_id,
          response: nextValue,
        });
        setSaving((current) => ({ ...current, [response.prompt_id]: false }));
        if (result.error) setError(result.error);
      }, 300);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, [attemptId, drafts, responses]);

  const promptRows = assignment.scaffolding_prompts.filter((prompt) => prompt.enabled);
  const totalWords = totalWordCount(
    promptRows.map((prompt) => ({
      wordCount:
        (drafts[prompt.id] ?? "")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length ?? 0,
    }))
  );
  const thresholdMet = totalWords >= assignment.minWordCount;

  function handleComplete() {
    setError(null);
    startTransition(async () => {
      const result = await passReflectionGate(attemptId);
      if (result.error) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <SandboxArea className="p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)] pb-4">
          <div>
            <h2 className="font-[Lexend] text-[24px] leading-[1.4] font-medium text-[var(--color-on-surface)]">
              Initial Reflection Gate
            </h2>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              Complete the reflection prompts before AI assistance unlocks.
            </p>
          </div>
          <PillTag color="amber">{totalWords} / {assignment.minWordCount} words</PillTag>
        </div>

        <div className="mt-8 space-y-6">
          {promptRows.map((prompt) => {
            const response = responses.find((item) => item.prompt_id === prompt.id);
            return (
              <div key={prompt.id} className="space-y-3">
                <label className="block font-[Lexend] text-[18px] font-medium text-[var(--color-on-surface)]">
                  {prompt.text}
                </label>
                <textarea
                  value={drafts[prompt.id] ?? ""}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [prompt.id]: event.target.value,
                    }))
                  }
                  readOnly={Boolean(response?.frozen)}
                  rows={5}
                  className="min-h-[140px] w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-4 py-4 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 read-only:cursor-not-allowed read-only:bg-[var(--color-surface-container-low)]"
                  placeholder="Start typing your thoughts here..."
                />
                <div className="text-xs text-[var(--color-on-surface-variant)]">
                  {saving[prompt.id] ? "Saving..." : "Autosaves as you write"}
                </div>
              </div>
            );
          })}
        </div>

        {error ? (
          <p className="mt-6 rounded-lg border border-[var(--color-error-container)] bg-[var(--color-error-container)]/40 px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex justify-end">
          <Button
            variant="motivational"
            size="lg"
            onClick={handleComplete}
            disabled={!thresholdMet || isPending}
          >
            Complete Reflection
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Button>
        </div>
      </SandboxArea>

      <Card className="h-fit p-6">
        <div className="space-y-4">
          <PillTag color="neutral">Reflection</PillTag>
          <div>
            <h3 className="font-[Lexend] text-[20px] font-semibold text-[var(--color-on-surface)]">
              Awaiting Your Thoughts
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Complete the reflection to unlock AI assistance.
            </p>
          </div>
          {assignment.gate_level === "progressive" && assignment.stage_instructions?.reflect ? (
            <div className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-4 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {assignment.stage_instructions.reflect}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
