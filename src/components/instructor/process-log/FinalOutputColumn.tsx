import Markdown from "@/components/instructor/process-log/Markdown";
import SandboxArea from "@/components/ui/SandboxArea";
import type { FinalOutput } from "@/lib/assignments";

export default function FinalOutputColumn({
  finalOutput,
}: {
  finalOutput: FinalOutput | null;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-4 lg:border-l lg:border-[var(--color-outline-variant)] lg:pl-6">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)] shrink-0 sticky top-0 z-10 bg-[var(--color-background)] pt-1">
        <span className="material-symbols-outlined text-[var(--color-secondary-container)]">
          article
        </span>
        <h3 className="font-[var(--font-heading)] text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
          Final Output
        </h3>
      </div>

      <SandboxArea className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-5">
          {finalOutput?.content.trim() ? (
            <Markdown content={finalOutput.content} />
          ) : (
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              No final draft has been saved for this attempt yet.
            </p>
          )}
        </div>
      </SandboxArea>
    </section>
  );
}
