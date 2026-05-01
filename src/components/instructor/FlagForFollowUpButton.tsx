"use client";

import { useTransition } from "react";
import { toggleInstructorFlag } from "@/app/actions/attempts";

export default function FlagForFollowUpButton({
  attemptId,
  initialFlagged,
}: {
  attemptId: string;
  initialFlagged: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleInstructorFlag(attemptId, !initialFlagged);
      window.location.reload();
    });
  }

  if (initialFlagged) {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-error-container)] bg-[var(--color-error-container)]/20 text-[var(--color-error)] font-heading text-[12px] font-semibold tracking-[0.05em] uppercase hover:bg-[var(--color-error-container)]/40 transition-colors disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[16px]">flag</span>
        {isPending ? "Updating…" : "Flagged for Follow-up"}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] font-heading text-[12px] font-semibold tracking-[0.05em] uppercase hover:border-[var(--color-error-container)] hover:text-[var(--color-error)] transition-colors disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-[16px]">flag</span>
      {isPending ? "Updating…" : "Flag for Follow-up"}
    </button>
  );
}
