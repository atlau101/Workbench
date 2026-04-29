interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  subtext?: string;
  variant?: "default" | "alert";
}

export default function MetricCard({
  label,
  value,
  icon,
  subtext,
  variant = "default",
}: MetricCardProps) {
  const isAlert = variant === "alert";
  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md relative overflow-hidden ${
        isAlert
          ? "bg-[var(--color-error-container)]/20 border-[var(--color-error-container)]"
          : "bg-[var(--color-surface-container-lowest)] border-[var(--color-surface-variant)]"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="font-[Lexend] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAlert
              ? "bg-[var(--color-secondary-container)]/20 text-[var(--color-secondary-container)]"
              : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          }`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3
          className={`text-[40px] leading-[1.2] font-semibold ${
            isAlert
              ? "text-[var(--color-secondary-container)]"
              : "text-[var(--color-on-background)]"
          }`}
        >
          {value}
        </h3>
      </div>
      {subtext && (
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
