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
        "rounded-xl p-5 border-t-2",
        isAlert
          ? "bg-[var(--color-error-container)]/10 border-t-[var(--color-error)]"
          : "bg-[var(--color-surface-container-low)] border-t-[var(--color-primary)]",
      ].join(" ")}
    >
      <p className="font-heading text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--color-on-surface-variant)] mb-3">
        {label}
      </p>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={[
            "tabular font-heading text-3xl font-semibold leading-none",
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
