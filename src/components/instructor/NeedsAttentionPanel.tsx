import Link from "next/link";
import type { FlaggedAttemptItem } from "@/app/actions/attempts";
import EmptyState from "@/components/ui/EmptyState";

interface NeedsAttentionPanelProps {
  items: FlaggedAttemptItem[];
}

export default function NeedsAttentionPanel({
  items,
}: NeedsAttentionPanelProps) {
  return (
    <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[var(--color-surface-variant)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-secondary-container)]">
            priority_high
          </span>
          <h3 className="text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
            Needs Attention
          </h3>
        </div>
        <span className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] text-xs font-bold px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 p-6">
          <EmptyState
            icon="check_circle"
            title="No flags yet"
            description="Flags appear when students submit below-threshold reflections."
            className="h-full"
          />
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-surface-variant)]">
          {items.map((item) => (
            <Link
              key={item.attemptId}
              href={`/instructor/attempts/${item.attemptId}`}
              className="block p-5 transition-colors hover:bg-[var(--color-surface-container-low)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)]">
                    {item.studentLabel}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--color-on-surface)] line-clamp-2">
                    {item.assignmentTitle}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-on-surface-variant)] line-clamp-3">
                    {item.reason}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[var(--color-outline)]">
                  chevron_right
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
