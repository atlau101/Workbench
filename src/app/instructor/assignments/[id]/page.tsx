import { notFound } from "next/navigation";
import Link from "next/link";
import { getAssignment } from "@/app/actions/assignments";
import CopyLinkButton from "./CopyLinkButton";

const GATE_LABELS: Record<string, string> = {
  high: "High Gate",
  low: "Low Gate",
  progressive: "Progressive",
};

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignment(id);
  if (!assignment) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/instructor/assignments"
            className="text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] flex items-center gap-1 mb-2"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            All assignments
          </Link>
          <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)]">
            {assignment.title}
          </h2>
        </div>
        <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
          {GATE_LABELS[assignment.gate_level]}
        </span>
      </div>

      {/* Prompt */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6 shadow-sm">
        <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-3">
          Assignment Prompt
        </p>
        <p className="text-[var(--color-on-surface)] leading-relaxed whitespace-pre-wrap">
          {assignment.prompt}
        </p>
      </div>

      {/* Config summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-5 shadow-sm">
          <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1">
            AI Message Limit
          </p>
          <p className="text-[24px] font-medium text-[var(--color-on-background)]">
            {assignment.ai_msg_limit}
            <span className="text-base font-normal text-[var(--color-on-surface-variant)]">
              {" "}
              msgs / student
            </span>
          </p>
        </div>
        <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-5 shadow-sm">
          <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1">
            Scaffolding Prompts
          </p>
          <p className="text-[24px] font-medium text-[var(--color-on-background)]">
            {
              assignment.scaffolding_prompts.filter((p) => p.enabled).length
            }
            <span className="text-base font-normal text-[var(--color-on-surface-variant)]">
              {" "}
              active
            </span>
          </p>
        </div>
      </div>

      {/* Progressive stage instructions */}
      {assignment.gate_level === "progressive" && assignment.stage_instructions && (
        <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6 shadow-sm">
          <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-4">
            Progressive Stage Instructions
          </p>
          {(
            [
              ["reflect", "Reflect"],
              ["ai_assist", "AI-Assist"],
              ["synthesize", "Synthesize"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="mb-3 last:mb-0">
              <p className="text-xs font-semibold text-[var(--color-primary)] uppercase mb-1">
                {label}
              </p>
              <p className="text-sm text-[var(--color-on-surface)]">
                {assignment.stage_instructions![key as keyof typeof assignment.stage_instructions]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Scaffolding list */}
      {assignment.scaffolding_prompts.length > 0 && (
        <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6 shadow-sm">
          <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-3">
            Scaffolding Prompts
          </p>
          <ul className="space-y-2">
            {assignment.scaffolding_prompts.map((p, i) => (
              <li
                key={p.id}
                className={`flex items-start gap-3 text-sm ${p.enabled ? "text-[var(--color-on-surface)]" : "text-[var(--color-outline)] line-through"}`}
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Access link */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6 shadow-sm">
        <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-3">
          Student Access Link
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 bg-[var(--color-surface-container-low)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-on-surface)] border border-[var(--color-surface-variant)] truncate">
            /a/{id}
          </code>
          <CopyLinkButton id={id} />
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
          Share this link with students to give them access to this assignment.
        </p>
      </div>

      {/* Roster placeholder */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6 shadow-sm">
        <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-4">
          Class Roster
        </p>
        <div className="text-center py-8 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-3xl block mb-2">
            group
          </span>
          <p className="text-sm">No students have started this assignment yet.</p>
          <p className="text-xs mt-1">
            Student attempts will appear here once Phase 3 ships.
          </p>
        </div>
      </div>
    </div>
  );
}
