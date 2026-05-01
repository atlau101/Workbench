import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-6 py-10 text-center",
        className,
      ].join(" ")}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] border border-[color-mix(in_srgb,var(--color-primary)_18%,white)]">
        <span className="material-symbols-outlined text-[28px] text-[var(--color-primary)]">
          {icon}
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="font-heading text-[20px] font-semibold text-[var(--color-on-surface)]">
          {title}
        </h3>
        <p className="max-w-xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
          {description}
        </p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
