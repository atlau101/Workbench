"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeStudent } from "@/app/actions/enrollments";
import type { Enrollment } from "@/lib/courses";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  accepted: "Enrolled",
  declined: "Declined",
};

const statusColor: Record<string, string> = {
  pending: "text-[var(--color-on-surface-variant)]",
  accepted: "text-[var(--color-primary)]",
  declined: "text-[var(--color-error)]",
};

function RemoveButton({ enrollmentId, courseId }: { enrollmentId: string; courseId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      await removeStudent(enrollmentId, courseId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs text-[var(--color-error)] hover:underline disabled:opacity-40"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}

export default function EnrollmentRoster({
  enrollments,
  courseId,
}: {
  enrollments: Enrollment[];
  courseId: string;
}) {
  if (enrollments.length === 0) {
    return (
      <p className="text-sm text-[var(--color-on-surface-variant)]">
        No students invited yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-surface-variant)]">
      {enrollments.map((e) => (
        <li key={e.id} className="flex items-center justify-between py-3 text-sm">
          <span className="text-[var(--color-on-surface)]">{e.student_email}</span>
          <div className="flex items-center gap-4">
            <span className={statusColor[e.status] ?? ""}>{statusLabel[e.status] ?? e.status}</span>
            <RemoveButton enrollmentId={e.id} courseId={courseId} />
          </div>
        </li>
      ))}
    </ul>
  );
}
