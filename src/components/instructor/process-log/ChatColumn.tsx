import Markdown from "@/components/instructor/process-log/Markdown";
import type { ChatMessage } from "@/lib/assignments";

export default function ChatColumn({
  chatMessages,
}: {
  chatMessages: ChatMessage[];
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-4 lg:border-l lg:border-[var(--color-outline-variant)] lg:pl-6">
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)] shrink-0">
        <span className="material-symbols-outlined text-[var(--color-tertiary-container)]">
          forum
        </span>
        <h3 className="font-[var(--font-heading)] text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
          2. AI Assistance Session
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {chatMessages.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              No AI conversation was recorded for this attempt.
            </p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-1 ${
                message.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`relative max-w-[95%] rounded-2xl p-4 shadow-sm ${
                  message.role === "user"
                    ? "rounded-tr-sm border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]"
                    : "rounded-tl-sm border border-dashed border-[color-mix(in_srgb,var(--color-primary)_35%,white)] bg-[var(--color-surface-container)]"
                }`}
              >
                {message.role === "assistant" ? (
                  <span className="absolute top-2 right-3 font-[var(--font-heading)] text-[10px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)]">
                    Guide AI
                  </span>
                ) : null}
                <div className={message.role === "assistant" ? "pr-14" : ""}>
                  <Markdown content={message.content} />
                </div>
              </div>
              <span className="text-[12px] text-[var(--color-outline)]">
                {message.role === "user" ? "Student" : "AI"}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
