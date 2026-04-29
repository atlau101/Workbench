import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Assignment } from "@/lib/assignments";

const GATE_LABELS: Record<string, string> = {
  high: "High Gate",
  low: "Low Gate",
  progressive: "Progressive",
};

export default async function AssignmentAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("id, title, prompt, gate_level, ai_msg_limit")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const a = data as Pick<
    Assignment,
    "id" | "title" | "prompt" | "gate_level" | "ai_msg_limit"
  >;

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-4">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <h1 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)] font-[Lexend]">
            {a.title}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-sm px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 font-medium">
              {GATE_LABELS[a.gate_level]}
            </span>
            <span className="text-sm text-[var(--color-on-surface-variant)]">
              {a.ai_msg_limit} AI messages
            </span>
          </div>
        </div>

        {/* Prompt */}
        <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6 shadow-sm">
          <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-3">
            Assignment Prompt
          </p>
          <p className="text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
            {a.prompt}
          </p>
        </div>

        {/* Workspace placeholder */}
        <div className="bg-[var(--color-surface-container-low)] rounded-xl border border-dashed border-[var(--color-primary)]/30 p-8 text-center">
          <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]/40 block mb-3">
            construction
          </span>
          <p className="font-medium text-[var(--color-on-surface)]">
            Student Workspace — Coming in Phase 3
          </p>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-2 max-w-sm mx-auto">
            The Reflect → AI-Assist → Synthesize workspace will appear here.
            You&apos;re accessing the right assignment.
          </p>
        </div>
      </div>
    </div>
  );
}
