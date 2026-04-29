import Link from "next/link";
import { listMyAssignments } from "@/app/actions/assignments";
import AssignmentsTable from "@/components/instructor/AssignmentsTable";

export default async function InstructorAssignmentsPage() {
  const assignments = await listMyAssignments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)]">
            Assignments
          </h2>
          <p className="mt-1 text-[var(--color-on-surface-variant)]">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/instructor/assignments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-container)] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Assignment
        </Link>
      </div>

      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl shadow-sm overflow-hidden">
        <AssignmentsTable assignments={assignments} />
      </div>
    </div>
  );
}
