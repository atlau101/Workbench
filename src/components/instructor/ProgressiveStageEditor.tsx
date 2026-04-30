"use client";

import type { StageInstructions } from "@/lib/assignments";

const STAGES: { key: keyof StageInstructions; label: string; icon: string }[] =
  [
    { key: "reflect", label: "Reflect", icon: "edit_note" },
    { key: "ai_assist", label: "AI-Assist", icon: "smart_toy" },
    { key: "synthesize", label: "Synthesize", icon: "auto_fix_high" },
  ];

const DEFAULT_INSTRUCTIONS: StageInstructions = {
  reflect:
    "Complete all reflection prompts before AI unlocks. Aim for depth, not just length.",
  ai_assist:
    "AI is now available to help you explore and strengthen your thinking. You have a limited number of messages.",
  synthesize:
    "Use AI to help polish and organize your final draft. Focus on clarity and coherence.",
};

interface Props {
  value: StageInstructions;
  onChange: (v: StageInstructions) => void;
}

export default function ProgressiveStageEditor({ value, onChange }: Props) {
  function update(key: keyof StageInstructions, text: string) {
    onChange({ ...value, [key]: text });
  }

  return (
    <div className="space-y-4 mt-4 p-4 bg-[var(--color-surface-container-low)] rounded-xl border border-[var(--color-primary)]/20">
      <p className="text-sm font-medium text-[var(--color-primary)] flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">tune</span>
        Progressive Stage Instructions
      </p>
      <p className="text-xs text-[var(--color-on-surface-variant)]">
        Students will see these instructions at each stage. Defaults are set — edit to match your assignment.
      </p>
      {STAGES.map((s) => (
        <div key={s.key}>
          <label className="flex items-center gap-1.5 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1">
            <span className="material-symbols-outlined text-[14px]">
              {s.icon}
            </span>
            {s.label}
          </label>
          <textarea
            rows={2}
            value={value[s.key] ?? DEFAULT_INSTRUCTIONS[s.key]}
            onChange={(e) => update(s.key, e.target.value)}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-white focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 px-3 py-2 text-[var(--color-on-surface)] text-[16px] resize-none transition-shadow"
          />
        </div>
      ))}
    </div>
  );
}
