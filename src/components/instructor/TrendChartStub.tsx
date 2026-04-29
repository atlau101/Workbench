export default function TrendChartStub() {
  return (
    <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
          Reflection Quality Trend
        </h3>
        <span className="text-xs text-[var(--color-on-surface-variant)]">
          Available after first submissions
        </span>
      </div>
      <div className="relative h-48 w-full bg-[var(--color-surface)]/50 rounded-lg border border-[var(--color-surface-container)] p-4 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full pl-12 pr-4 pt-6 pb-8"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 C20,70 30,85 50,40 C70,-5 85,20 100,10 L100,100 L0,100 Z"
            fill="url(#chartGrad)"
          />
          <path
            d="M0,80 C20,70 30,85 50,40 C70,-5 85,20 100,10"
            fill="none"
            stroke="var(--color-primary)"
            strokeOpacity="0.3"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 3"
          />
        </svg>
        <p className="relative text-sm text-[var(--color-on-surface-variant)] text-center z-10">
          No submission data yet
        </p>
      </div>
    </div>
  );
}
