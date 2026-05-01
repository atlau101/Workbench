"use client";

import { useTransition } from "react";
import { setAssignmentStatus } from "@/app/actions/assignments";
import type { AssignmentStatus } from "@/lib/assignments";

const STATES: AssignmentStatus[] = ["draft", "published", "hidden"];

const labels: Record<AssignmentStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

export default function PublishToggle({
  assignmentId,
  currentStatus,
}: {
  assignmentId: string;
  currentStatus: AssignmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as AssignmentStatus;
    startTransition(async () => {
      await setAssignmentStatus(assignmentId, next);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <label className="font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
        Visibility
      </label>
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-3 py-1.5 text-sm text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
      >
        {STATES.map((state) => (
          <option key={state} value={state}>
            {labels[state]}
          </option>
        ))}
      </select>
    </div>
  );
}
