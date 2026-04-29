"use client";

import { useActionState, useState } from "react";
import { startSession, type StartSessionState } from "@/app/actions/gym";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PillTag from "@/components/ui/PillTag";
import { GYM_MODES, type GymMode, type Scenario } from "@/lib/gym";

interface ScenarioPickerProps {
  mode: GymMode;
  scenarios: Scenario[];
}

const INITIAL_STATE: StartSessionState = {
  error: null,
};

export default function ScenarioPicker({ mode, scenarios }: ScenarioPickerProps) {
  const [state, formAction, isPending] = useActionState(startSession, INITIAL_STATE);
  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const config = GYM_MODES[mode];
  const canSubmit = Boolean(selectedScenarioId || customTopic.trim());

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="mode" value={mode} />

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <PillTag color="amber">{config.badge}</PillTag>
            <h3 className="mt-4 font-[Lexend] text-[24px] font-semibold text-[var(--color-on-surface)]">
              Bring Your Own Topic
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Start with a topic, question, or claim you already want to work on.
            </p>
          </div>
          <span className="material-symbols-outlined text-[32px] text-[var(--color-primary)]">
            edit_note
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <label
            htmlFor="customTopic"
            className="text-xs font-semibold tracking-[0.08em] text-[var(--color-on-surface-variant)] uppercase"
          >
            Custom Topic
          </label>
          <textarea
            id="customTopic"
            name="customTopic"
            rows={5}
            value={customTopic}
            onChange={(event) => {
              const nextValue = event.target.value;
              setCustomTopic(nextValue);
              if (nextValue.trim()) {
                setSelectedScenarioId("");
              }
            }}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] bg-white px-4 py-3 text-[16px] leading-7 text-[var(--color-on-surface)] outline-none transition-shadow focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            placeholder="Example: I want to pressure-test an argument about regulating generative AI in public schools."
          />
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-[Lexend] text-[24px] font-semibold text-[var(--color-on-surface)]">
              Curated Scenarios
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--color-on-surface-variant)]">
              Or pick a practice scenario already tagged for {config.label}.
            </p>
          </div>
          <PillTag color="neutral">{scenarios.length} scenarios</PillTag>
        </div>

        {scenarios.length === 0 ? (
          <EmptyState
            icon="psychology"
            title="No curated scenarios for this mode yet"
            description={`Start with your own ${config.label.toLowerCase()} topic above, or come back once curated scenarios are added.`}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {scenarios.map((scenario) => {
              const selected = selectedScenarioId === scenario.id;
              return (
                <label
                  key={scenario.id}
                  className={[
                    "block cursor-pointer rounded-[var(--radius-lg)] border bg-[var(--color-surface-container-lowest)] p-5 transition-colors",
                    selected
                      ? "border-[var(--color-primary)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
                      : "border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="scenarioId"
                    value={scenario.id}
                    checked={selected}
                    onChange={() => {
                      setSelectedScenarioId(scenario.id);
                      setCustomTopic("");
                    }}
                    className="sr-only"
                  />
                  <div className="flex flex-wrap gap-2">
                    <PillTag color="neutral">{scenario.discipline}</PillTag>
                    <PillTag color="neutral">{scenario.difficulty}</PillTag>
                  </div>
                  <h4 className="mt-4 font-[Lexend] text-[18px] font-medium text-[var(--color-on-surface)]">
                    {scenario.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                    {scenario.prompt}
                  </p>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {state.error ? (
        <p className="rounded-lg border border-[var(--color-error-container)] bg-[var(--color-error-container)]/40 px-4 py-3 text-sm text-[var(--color-error)]">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="motivational"
          size="lg"
          disabled={!canSubmit || isPending}
        >
          Start Session
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Button>
      </div>
    </form>
  );
}
