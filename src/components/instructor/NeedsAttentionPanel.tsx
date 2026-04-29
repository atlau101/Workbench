export default function NeedsAttentionPanel({ count = 0 }: { count?: number }) {
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
          {count}
        </span>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <span className="material-symbols-outlined text-[var(--color-outline)] text-4xl">
          check_circle
        </span>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          No students flagged yet. Flags appear when students submit
          below-threshold reflections.
        </p>
      </div>
    </div>
  );
}
