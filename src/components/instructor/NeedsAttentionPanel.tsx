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
    <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-6 py-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-[var(--color-on-surface)]">
          Needs Attention
        </h3>
        {items.length > 0 && (
          <span className="font-heading text-[11px] font-semibold tracking-[0.05em] tabular bg-[var(--color-error-container)] text-[var(--color-on-error-container)] px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
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
        <div className="divide-y divide-[var(--color-outline-variant)] overflow-y-auto flex-1">
          {items.map((item) => (
            <Link
              key={item.attemptId}
              href={`/instructor/attempts/${item.attemptId}`}
              className="block px-5 py-4 transition-colors hover:bg-[var(--color-surface-container-low)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)] mb-1">
                    {item.studentLabel}
                  </p>
                  <p className="text-sm font-medium text-[var(--color-on-surface)] line-clamp-2 leading-snug">
                    {item.assignmentTitle}
                  </p>
                  <p className="mt-1.5 text-xs text-[var(--color-on-surface-variant)] line-clamp-2 leading-relaxed">
                    {item.reason}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[var(--color-outline)] shrink-0 mt-0.5">
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
