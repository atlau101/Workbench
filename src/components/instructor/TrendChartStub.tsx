interface TrendPoint {
  label: string;
  value: number;
}

interface TrendChartStubProps {
  points: TrendPoint[];
  submittedAttempts: number;
  averageValue: number | null;
}

export default function TrendChartStub({
  points,
  submittedAttempts,
  averageValue,
}: TrendChartStubProps) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
          Reflection Depth Trend
        </h3>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
            Submitted attempts
          </p>
          <p className="text-sm font-medium text-[var(--color-on-surface)]">
            {submittedAttempts}
          </p>
        </div>
      </div>
      {points.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-surface-container)] bg-[var(--color-surface)]/50 px-6 py-10 text-center">
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            No submission data yet. Reflection depth will appear here once students begin
            turning work in.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-lg border border-[var(--color-surface-container)] bg-[var(--color-surface)]/50 px-4 py-5">
            <div className="flex h-56 items-end gap-3">
              {points.map((point) => {
                const height = Math.max((point.value / maxValue) * 100, 16);

                return (
                  <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                    <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                      {point.value} words
                    </span>
                    <div className="flex h-40 w-full items-end rounded-lg bg-[var(--color-surface-container-low)] px-1.5 pb-1.5">
                      <div
                        className="w-full rounded-md bg-[color-mix(in_srgb,var(--color-primary)_78%,white)]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-on-surface-variant)]">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            {averageValue !== null
              ? `Average reflection depth: ${averageValue} words across recent submission groups.`
              : "Reflection depth appears once submitted attempts include saved responses."}
          </p>
        </div>
      )}
    </div>
  );
}
