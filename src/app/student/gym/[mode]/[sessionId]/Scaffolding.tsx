"use client";

import { useEffect, useMemo, useState } from "react";
import { saveScaffoldingDraft } from "@/app/actions/gym";
import Card from "@/components/ui/Card";
import PillTag from "@/components/ui/PillTag";
import {
  getModePrompts,
  gymChatUnlocked,
  meetsSentenceRequirement,
  type GymMode,
} from "@/lib/gym";

interface ScaffoldingProps {
  sessionId: string;
  mode: GymMode;
  initialScaffolding: Record<string, string>;
}

export default function Scaffolding({
  sessionId,
  mode,
  initialScaffolding,
}: ScaffoldingProps) {
  const prompts = useMemo(() => getModePrompts(mode), [mode]);
  const [drafts, setDrafts] = useState<Record<string, string>>(initialScaffolding);
  const [savedDrafts, setSavedDrafts] = useState<Record<string, string>>(initialScaffolding);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timers = prompts.map((prompt) => {
      const nextValue = drafts[prompt.id] ?? "";
      const savedValue = savedDrafts[prompt.id] ?? "";
      if (nextValue === savedValue) return null;

      return window.setTimeout(async () => {
        setSaving((current) => ({ ...current, [prompt.id]: true }));
        const result = await saveScaffoldingDraft(sessionId, {
          promptId: prompt.id,
          response: nextValue,
        });
        setSaving((current) => ({ ...current, [prompt.id]: false }));

        if (result.error) {
          setError(result.error);
          return;
        }

        setSavedDrafts((current) => ({
          ...current,
          [prompt.id]: nextValue,
        }));
      }, 300);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, [drafts, prompts, savedDrafts, sessionId]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("gym-session-unlock", {
        detail: {
          sessionId,
          unlocked: gymChatUnlocked(mode, savedDrafts),
        },
      })
    );
  }, [mode, savedDrafts, sessionId]);

  const readyCount = prompts.filter((prompt) =>
    meetsSentenceRequirement(drafts[prompt.id] ?? "")
  ).length;
  const unlocked = gymChatUnlocked(mode, savedDrafts);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-outline-variant)] pb-4">
        <div>
          <h3 className="font-heading text-[22px] font-semibold text-[var(--color-on-surface)]">
            Scaffolding
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Write at least one sentence for each prompt to unlock the coach.
          </p>
        </div>
        <PillTag color={unlocked ? "teal" : "amber"}>
          {readyCount} / {prompts.length} ready
        </PillTag>
      </div>

      <div className="mt-6 space-y-6">
        {prompts.map((prompt) => {
          const ready = meetsSentenceRequirement(drafts[prompt.id] ?? "");
          return (
            <div key={prompt.id} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <label className="font-heading text-[18px] font-medium text-[var(--color-on-surface)]">
                  {prompt.text}
                </label>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
                  {ready ? "Ready" : "Needs a sentence"}
                </span>
              </div>
              <textarea
                value={drafts[prompt.id] ?? ""}
                onChange={(event) => {
                  setError(null);
                  setDrafts((current) => ({
                    ...current,
                    [prompt.id]: event.target.value,
                  }));
                }}
                rows={4}
                className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="Use a full sentence so the coach has enough context to work with."
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
    </Card>
  );
}
