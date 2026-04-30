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
      <span className="material-symbols-outlined text-4xl text-[var(--color-outline)]">
        {icon}
      </span>
      <div className="space-y-2">
        <h3 className="font-[var(--font-heading)] text-[20px] font-semibold text-[var(--color-on-surface)]">
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
