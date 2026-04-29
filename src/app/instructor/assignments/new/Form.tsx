"use client";

import { useState, useTransition } from "react";
import { createAssignment } from "@/app/actions/assignments";
import GateLevelPicker from "@/components/instructor/GateLevelPicker";
import ScaffoldingEditor from "@/components/instructor/ScaffoldingEditor";
import ProgressiveStageEditor from "@/components/instructor/ProgressiveStageEditor";
import type {
  AssignmentTemplate,
  GateLevel,
  ScaffoldingPrompt,
  StageInstructions,
} from "@/lib/assignments";

const DEFAULT_STAGE_INSTRUCTIONS: StageInstructions = {
  reflect:
    "Complete all reflection prompts before AI unlocks. Aim for depth, not just length.",
  ai_assist:
    "AI is now available to help you explore and strengthen your thinking. You have a limited number of messages.",
  synthesize:
    "Use AI to help polish and organize your final draft. Focus on clarity and coherence.",
};

const STEPS = ["Basic Info", "Gate Config", "Scaffolding", "Integration"];

interface Props {
  templates: AssignmentTemplate[];
}

export default function NewAssignmentForm({ templates }: Props) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [gateLevel, setGateLevel] = useState<GateLevel>("high");
  const [aiMsgLimit, setAiMsgLimit] = useState(20);
  const [scaffolding, setScaffolding] = useState<ScaffoldingPrompt[]>([]);
  const [stageInstructions, setStageInstructions] = useState<StageInstructions>(
    DEFAULT_STAGE_INSTRUCTIONS
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyTemplate(t: AssignmentTemplate) {
    setTitle(t.title);
    setPrompt(t.prompt);
    setGateLevel(t.default_gate_level);
    setScaffolding(
      t.default_scaffolding.map((p) => ({ ...p, id: `tpl_${p.id}` }))
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createAssignment({
        title,
        prompt,
        gate_level: gateLevel,
        ai_msg_limit: aiMsgLimit,
        scaffolding_prompts: scaffolding,
        stage_instructions:
          gateLevel === "progressive" ? stageInstructions : null,
      });
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  const disciplines = [...new Set(templates.map((t) => t.discipline))].sort();

  return (
    <form onSubmit={handleSubmit}>
      {/* Visual stepper */}
      <div className="mb-10 max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--color-surface-container-highest)] -z-10 rounded-full" />
          {STEPS.map((step, i) => {
            const done = i < 2; // visual only
            const current = i === 1;
            return (
              <div
                key={step}
                className="flex flex-col items-center gap-2 bg-[var(--color-background)] px-2"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-[var(--color-background)] ${
                    done || current
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface-container-highest)] text-[var(--color-outline)]"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase ${
                    done || current
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-outline)]"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Section 1: Basic Info */}
          <section className="bg-white rounded-xl border border-[var(--color-outline-variant)]/30 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)]" />
            <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-6 mt-2">
              Assignment Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Economies of Scale Essay"
                  className="w-full rounded-lg border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 py-2.5 px-3 text-[var(--color-on-surface)] text-[16px] bg-[var(--color-surface-bright)] transition-shadow"
                />
              </div>
              <div>
                <label className="block font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-2">
                  Description / Prompt
                </label>
                <textarea
                  required
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter the main task description…"
                  className="w-full rounded-lg border border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 py-2.5 px-3 text-[var(--color-on-surface)] text-[16px] bg-[var(--color-surface-bright)] resize-y transition-shadow"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Gate Config */}
          <section className="bg-white rounded-xl border border-[var(--color-primary)]/20 p-6 shadow-[0_4px_20px_rgba(0,104,95,0.12)] relative ring-1 ring-[var(--color-primary)]/10">
            <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-1">
                  Gate Configuration
                </h2>
                <p className="text-[var(--color-on-surface-variant)] text-sm">
                  Determine how much initial effort is required before AI
                  assistance unlocks.
                </p>
              </div>
            </div>
            <GateLevelPicker value={gateLevel} onChange={setGateLevel} />
            {gateLevel === "progressive" && (
              <ProgressiveStageEditor
                value={stageInstructions}
                onChange={setStageInstructions}
              />
            )}

            <div className="mt-6">
              <label className="block font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-2">
                AI Message Limit — {aiMsgLimit} messages per student
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={aiMsgLimit}
                onChange={(e) => setAiMsgLimit(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-on-surface-variant)] mt-1">
                <span>5 (focused)</span>
                <span>50 (open-ended)</span>
              </div>
            </div>
          </section>

          {/* Section 3: Scaffolding */}
          <section className="bg-[var(--color-surface-container-low)] rounded-xl border border-[var(--color-outline-variant)]/30 p-6 relative">
            <div className="absolute top-4 right-4 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase px-2 py-1 rounded flex items-center gap-1 opacity-80">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                smart_toy
              </span>
              AI Assisted
            </div>
            <div className="flex justify-between items-end mb-6 mt-2">
              <div>
                <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-1">
                  Scaffolding Prompts
                </h2>
                <p className="text-[var(--color-on-surface-variant)] text-sm">
                  Guiding questions surfaced to students when they get stuck.
                </p>
              </div>
            </div>
            <ScaffoldingEditor prompts={scaffolding} onChange={setScaffolding} />
          </section>

          {/* Section 4: Integration (informational in MVP) */}
          <section className="bg-white rounded-xl border border-[var(--color-outline-variant)]/30 p-6 shadow-sm">
            <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-4">
              Integration
            </h2>
            <div className="flex items-center justify-between p-4 border border-[var(--color-outline-variant)]/50 rounded-lg opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E72429]/10 text-[#E72429] rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--color-on-surface)]">
                    Canvas LMS Sync
                  </h3>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    Available post-MVP. Use access links for now.
                  </p>
                </div>
              </div>
              <span className="text-xs text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] rounded px-2 py-1">
                Coming Soon
              </span>
            </div>
          </section>

          {error && (
            <p className="text-sm text-[var(--color-error)] bg-[var(--color-error-container)]/30 border border-[var(--color-error-container)] rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Sidebar tips */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-6">
          {/* Template picker */}
          <div className="bg-[var(--color-surface-bright)] border border-[var(--color-outline-variant)]/30 rounded-xl p-5 sticky top-24">
            <div className="flex items-center gap-2 text-[var(--color-secondary-container)] mb-3">
              <span className="material-symbols-outlined">library_books</span>
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Browse Templates
              </h3>
            </div>
            <p className="text-[var(--color-on-surface-variant)] text-sm mb-4">
              Pick a template to prefill title, prompt, and scaffolding prompts.
            </p>
            {disciplines.map((disc) => (
              <div key={disc} className="mb-3">
                <p className="font-[Lexend] text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1.5">
                  {disc}
                </p>
                {templates
                  .filter((t) => t.discipline === disc)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-[var(--color-surface-container-low)] text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors mb-1"
                    >
                      {t.title}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-6 bg-white border-t border-slate-200 p-4 px-6 flex justify-between items-center mt-8 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <a
          href="/instructor/assignments"
          className="px-6 py-2.5 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-medium hover:bg-[var(--color-surface-container-low)] transition-colors bg-white"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-2.5 rounded-lg bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] font-medium hover:brightness-105 shadow-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60"
        >
          {isPending ? "Publishing…" : "Publish Assignment"}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            send
          </span>
        </button>
      </div>
    </form>
  );
}
