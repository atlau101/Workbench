import SandboxArea from "@/components/ui/SandboxArea";
import type { Assignment, ReflectionResponse } from "@/lib/assignments";

function promptLabel(
  assignment: Pick<Assignment, "scaffolding_prompts">,
  response: ReflectionResponse,
  index: number
): string {
  return (
    assignment.scaffolding_prompts.find((prompt) => prompt.id === response.prompt_id)?.text ??
    `Reflection Prompt ${index + 1}`
  );
}

export default function ReflectionColumn({
  assignment,
  responses,
}: {
  assignment: Pick<Assignment, "scaffolding_prompts">;
  responses: ReflectionResponse[];
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)] shrink-0 sticky top-0 z-10 bg-[var(--color-background)] pt-1">
        <span className="material-symbols-outlined text-[var(--color-primary)]">
          flag
        </span>
        <h3 className="font-[var(--font-heading)] text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
          Initial Reflection
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {responses.length === 0 ? (
          <SandboxArea className="p-5">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              No reflection responses were recorded for this attempt.
            </p>
          </SandboxArea>
        ) : (
          responses.map((response, index) => (
            <SandboxArea key={response.id} className="p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)]">
                  Student Pre-Work
                </span>
                <span className="text-[12px] text-[var(--color-outline)]">
                  {response.wordCount} words
                </span>
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-on-surface)] mb-2">
                {promptLabel(assignment, response, index)}
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--color-on-surface-variant)]">
                {response.response.trim() || "No response provided."}
              </p>
            </SandboxArea>
          ))
        )}
      </div>
    </section>
  );
}
