import Link from "next/link";
import AssignmentStatusBadge from "@/components/instructor/AssignmentStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { Assignment } from "@/lib/assignments";

export default function AssignmentsTable({
  assignments,
  courseNameMap = {},
}: {
  assignments: Assignment[];
  courseNameMap?: Record<string, string>;
}) {
  if (assignments.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="assignment"
          title="No assignments yet"
          description="Create your first assignment to start collecting student work."
          action={
            <Link
              href="/instructor/assignments/new"
              className="inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Create your first assignment
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[16px]">
        <thead>
          <tr className="bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-surface-variant)] text-sm text-[var(--color-on-surface-variant)]">
            <th className="py-4 px-6 font-medium">Assignment</th>
            <th className="py-4 px-6 font-medium">Course</th>
            <th className="py-4 px-6 font-medium">Status</th>
            <th className="py-4 px-6 font-medium">Min Words</th>
            <th className="py-4 px-6 font-medium">AI Limit</th>
            <th className="py-4 px-6 font-medium">Created</th>
            <th className="py-4 px-6 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-surface-variant)] text-[var(--color-on-surface)]">
          {assignments.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-[var(--color-surface-container-low)]/50 transition-colors group"
            >
              <td className="py-4 px-6">
                <div className="font-medium text-[var(--color-on-background)] group-hover:text-[var(--color-primary)] transition-colors">
                  {a.title}
                </div>
              </td>
              <td className="py-4 px-6 text-sm text-[var(--color-on-surface-variant)]">
                {courseNameMap[a.course_id] ?? "—"}
              </td>
              <td className="py-4 px-6">
                <AssignmentStatusBadge status={a.status} />
              </td>
              <td className="py-4 px-6 text-sm">{a.minWordCount} words</td>
              <td className="py-4 px-6 text-sm">{a.ai_msg_limit} msgs</td>
              <td className="py-4 px-6 text-sm text-[var(--color-on-surface-variant)]">
                {new Date(a.created_at).toLocaleDateString()}
              </td>
              <td className="py-4 px-6">
                <Link
                  href={`/instructor/assignments/${a.id}`}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
