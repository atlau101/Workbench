"use client";

import type { GateLevel } from "@/lib/assignments";

interface Option {
  value: GateLevel;
  icon: string;
  label: string;
  description: string;
}

const OPTIONS: Option[] = [
  {
    value: "high",
    icon: "lock",
    label: "High Gate",
    description: "Students must provide deep reflection before AI unlocks.",
  },
  {
    value: "progressive",
    icon: "tune",
    label: "Progressive",
    description: "Gate decreases across stages automatically.",
  },
  {
    value: "low",
    icon: "lock_open",
    label: "Low Gate",
    description: "AI is freely available from the beginning.",
  },
];

interface Props {
  value: GateLevel;
  onChange: (v: GateLevel) => void;
}

export default function GateLevelPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-colors ${
              active
                ? "border-[var(--color-primary)] bg-[var(--color-surface-bright)]"
                : "border-[var(--color-outline-variant)] bg-white hover:bg-[var(--color-surface-container-low)]"
            }`}
          >
            <input
              type="radio"
              name="gate_level"
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <div className="flex w-full flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined ${active ? "text-[var(--color-primary)]" : "text-[var(--color-outline)]"}`}
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {opt.icon}
                  </span>
                  <span className="font-bold text-[var(--color-on-surface)]">
                    {opt.label}
                  </span>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    active
                      ? "border-[var(--color-primary)]"
                      : "border-[var(--color-outline-variant)]"
                  }`}
                >
                  {active && (
                    <div className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                {opt.description}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
