interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  subtext?: string;
  variant?: "default" | "alert";
}

export default function MetricCard({
  label,
  value,
  subtext,
  variant = "default",
}: MetricCardProps) {
  const isAlert = variant === "alert";

  return (
    <div
      className={[
        "rounded-xl p-5 border",
        isAlert
          ? "bg-[var(--color-error-container)]/25 border-[var(--color-error)]/20"
          : "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={[
            "h-2 w-2 rounded-full shrink-0",
            isAlert ? "bg-[var(--color-error)]" : "bg-[var(--color-primary)]",
          ].join(" ")}
        />
        <p className="font-heading text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--color-on-surface-variant)]">
          {label}
        </p>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={[
            "tabular font-heading text-4xl font-semibold leading-none tracking-tight",
            isAlert
              ? "text-[var(--color-error)]"
              : "text-[var(--color-on-surface)]",
          ].join(" ")}
        >
          {value}
        </span>
        {subtext && (
          <span className="text-sm text-[var(--color-on-surface-variant)] text-right leading-snug">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
