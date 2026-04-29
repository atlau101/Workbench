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
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)] shrink-0">
        <span className="material-symbols-outlined text-[var(--color-secondary-container)]">
          article
        </span>
        <h3 className="font-[Lexend] text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
          3. Final Output
        </h3>
      </div>

      <SandboxArea className="flex-1 min-h-0 overflow-hidden shadow-sm">
        <div className="h-1 w-full bg-[var(--color-secondary-container)]" />
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
