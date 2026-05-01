import Link from "next/link";
import { listAttemptsForAssignment } from "@/app/actions/attempts";
import PillTag from "@/components/ui/PillTag";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join(" ");
}

export default async function AttemptRosterTable({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const attempts = await listAttemptsForAssignment(assignmentId);

  return (
    <div className="bg-[var(--color-surface-container-lowest)] rounded-xl border border-[var(--color-surface-variant)] p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
          Submission History
        </p>
        <span className="text-sm text-[var(--color-on-surface-variant)]">
          {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"}
        </span>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-3xl block mb-2">
            group
          </span>
          <p className="text-sm">No students have started this assignment yet.</p>
          <p className="text-xs mt-1">
            Student attempts will appear here as soon as they begin the workflow.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-surface-variant)] text-left">
                <th className="pb-3 pr-4 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
                  Student
                </th>
                <th className="pb-3 pr-4 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
                  Status
                </th>
                <th className="pb-3 pr-4 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
                  Reflection Words
                </th>
                <th className="pb-3 pr-4 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
                  Submitted
                </th>
                <th className="pb-3 pr-4 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
                  Updated
                </th>
                <th className="pb-3 text-right font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
                  Review
                </th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr
                  key={attempt.attemptId}
                  className="border-b border-[var(--color-surface-variant)] last:border-b-0"
                >
                  <td className="py-4 pr-4 align-top">
                    <p className="font-medium text-[var(--color-on-surface)]">
                      {attempt.studentLabel}
                    </p>
                    {attempt.studentEmail ? (
                      <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                        {attempt.studentEmail}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                        {attempt.studentId}
                      </p>
                    )}
                  </td>
                  <td className="py-4 pr-4 align-top">
                    <div className="flex flex-wrap items-center gap-2">
                      <PillTag color="neutral">{formatStatus(attempt.status)}</PillTag>
                      {attempt.flagged ? (
                        <PillTag color="amber">Flagged</PillTag>
                      ) : null}
                    </div>
                    {attempt.reasons[0] ? (
                      <p className="mt-2 text-xs text-[var(--color-on-surface-variant)]">
                        {attempt.reasons[0]}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-4 pr-4 align-top text-[var(--color-on-surface)]">
                    {attempt.reflectionWordCount}
                  </td>
                  <td className="py-4 pr-4 align-top text-[var(--color-on-surface-variant)]">
                    {attempt.submittedAt ? formatDate(attempt.submittedAt) : "—"}
                  </td>
                  <td className="py-4 pr-4 align-top text-[var(--color-on-surface-variant)]">
                    {formatDate(attempt.updatedAt)}
                  </td>
                  <td className="py-4 align-top text-right">
                    <Link
                      href={`/instructor/attempts/${attempt.attemptId}`}
                      className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors"
                    >
                      View Log
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
