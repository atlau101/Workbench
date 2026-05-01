"use client";

import ProgressiveStageEditor from "@/components/instructor/ProgressiveStageEditor";
import type { GateLevel, StageInstructions } from "@/lib/assignments";

export const GATE_LEVELS = {
  standard: "Standard Gate",
  progressive: "Progressive",
} as const;

export interface GateLevelPickerProps {
  gateLevel: GateLevel;
  minWordCount: number;
  onGateLevelChange: (value: GateLevel) => void;
  onMinWordCountChange: (value: number) => void;
  stageInstructions: StageInstructions;
  onStageInstructionsChange: (value: StageInstructions) => void;
}

export default function GateLevelPicker({
  gateLevel,
  minWordCount,
  onGateLevelChange,
  onMinWordCountChange,
  stageInstructions,
  onStageInstructionsChange,
}: GateLevelPickerProps) {
  const isProgressive = gateLevel === "progressive";

  function confirmLeaveProgressive(): boolean {
    if (!isProgressive) return true;
    return window.confirm(
      "Switching away from Progressive stages will clear your custom stage instructions. Continue?"
    );
  }

  function applyPreset(preset: "high" | "low" | "progressive") {
    if (preset === "high") {
      if (!confirmLeaveProgressive()) return;
      onGateLevelChange("standard");
      onMinWordCountChange(300);
      return;
    }

    if (preset === "low") {
      if (!confirmLeaveProgressive()) return;
      onGateLevelChange("standard");
      onMinWordCountChange(100);
      return;
    }

    onGateLevelChange("progressive");
    onMinWordCountChange(minWordCount || 150);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label
              htmlFor="min_word_count"
              className="block font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]"
            >
              Words required before AI unlocks
            </label>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              Students must draft this many words before AI assistance becomes available.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-3 py-2 text-right">
            <div className="text-2xl font-semibold text-[var(--color-primary)]">
              {minWordCount}
            </div>
            <div className="text-xs uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">
              min words
            </div>
          </div>
        </div>
        <input
          id="min_word_count"
          type="range"
          min={50}
          max={500}
          step={10}
          value={minWordCount}
          onChange={(e) => onMinWordCountChange(Number(e.target.value))}
          className="mt-5 w-full accent-[var(--color-primary)]"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("high")}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !isProgressive && minWordCount === 300
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
            }`}
          >
            High Gate
          </button>
          <button
            type="button"
            onClick={() => applyPreset("low")}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !isProgressive && minWordCount === 100
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
            }`}
          >
            Low Gate
          </button>
          <button
            type="button"
            onClick={() => applyPreset("progressive")}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isProgressive
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]"
            }`}
          >
            Progressive
          </button>
        </div>
        <div className="mt-1 flex justify-between text-xs text-[var(--color-on-surface-variant)]">
          <span>50</span>
          <span>500</span>
        </div>
      </div>

      <label className="flex items-start justify-between gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-white p-5 transition-colors hover:bg-[var(--color-surface-container-low)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)]">
              tune
            </span>
            <span className="font-semibold text-[var(--color-on-surface)]">
              Progressive stages
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
            Turn on stage-based instructions that guide students from reflection to synthesis.
          </p>
        </div>
        <div className="relative shrink-0">
          <input
            type="checkbox"
            checked={isProgressive}
            onChange={(e) => {
              if (!e.target.checked && !confirmLeaveProgressive()) return;
              onGateLevelChange(e.target.checked ? "progressive" : "standard");
            }}
            className="peer sr-only"
          />
          <div className="h-7 w-12 rounded-full bg-[var(--color-surface-container-highest)] transition-colors peer-checked:bg-[var(--color-primary)]" />
          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-[var(--color-background)] shadow-sm transition-transform peer-checked:translate-x-5" />
        </div>
      </label>

      {isProgressive && (
        <ProgressiveStageEditor
          value={stageInstructions}
          onChange={onStageInstructionsChange}
        />
      )}
    </div>
  );
}
