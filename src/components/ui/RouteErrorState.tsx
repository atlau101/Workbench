"use client";

import Button from "@/components/ui/Button";

export default function RouteErrorState({
  title,
  reset,
}: {
  title: string;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-error-container)] bg-[var(--color-error-container)]/25 px-6 text-center">
      <span className="material-symbols-outlined text-4xl text-[var(--color-error)]">
        error
      </span>
      <div className="space-y-2">
        <h2 className="font-heading text-[24px] font-semibold text-[var(--color-on-surface)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Something went wrong loading this page. Refresh to try again, or go back and open a different assignment.
        </p>
      </div>
      <Button type="button" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
