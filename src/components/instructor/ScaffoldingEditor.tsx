"use client";

import { type ScaffoldingPrompt } from "@/lib/assignments";

let counter = 0;
function newId() {
  return `sp_${++counter}_${Date.now()}`;
}

interface Props {
  prompts: ScaffoldingPrompt[];
  onChange: (prompts: ScaffoldingPrompt[]) => void;
}

export default function ScaffoldingEditor({ prompts, onChange }: Props) {
  function update(id: string, patch: Partial<ScaffoldingPrompt>) {
    onChange(prompts.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function remove(id: string) {
    onChange(prompts.filter((p) => p.id !== id));
  }

  function add() {
    onChange([...prompts, { id: newId(), text: "", enabled: true }]);
  }

  return (
    <div className="space-y-3">
      {prompts.map((p) => (
        <div
          key={p.id}
          className={`flex items-start gap-4 p-4 bg-white rounded-lg border transition-colors group ${
            p.enabled
              ? "border-[var(--color-outline-variant)]/50 hover:border-[var(--color-primary)]/50"
              : "border-[var(--color-outline-variant)]/30 opacity-60"
          }`}
        >
          <label className="relative inline-flex items-center cursor-pointer mt-1 shrink-0">
            <input
              type="checkbox"
              checked={p.enabled}
              onChange={(e) => update(p.id, { enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[var(--color-outline-variant)] rounded-full peer peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <input
            type="text"
            value={p.text}
            onChange={(e) => update(p.id, { text: e.target.value })}
            placeholder="Enter scaffolding prompt…"
            className="flex-1 bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-[var(--color-on-surface)] font-medium text-[16px]"
          />
          <button
            type="button"
            onClick={() => remove(p.id)}
            className="text-[var(--color-outline)] hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center justify-center w-full py-3 border-2 border-dashed border-[var(--color-outline-variant)]/50 rounded-lg text-[var(--color-outline)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-primary)] transition-colors text-sm font-medium"
      >
        <span className="material-symbols-outlined mr-2">add</span>
        Add Custom Prompt
      </button>
    </div>
  );
}
