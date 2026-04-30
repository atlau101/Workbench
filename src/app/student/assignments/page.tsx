import Link from "next/link";
import { redirect } from "next/navigation";
import { listEnrolledCoursesForMe } from "@/app/actions/enrollments";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function StudentAssignmentsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrolledCourses = await listEnrolledCoursesForMe();
  const allAssignments = enrolledCourses.flatMap((course) =>
    course.assignments.map((assignment) => ({
      ...assignment,
      courseName: course.course.name,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[var(--text-h2)] font-semibold text-[var(--color-on-background)]">
          Workspace
        </h2>
        <p className="mt-1 text-[var(--color-on-surface-variant)]">
          {allAssignments.length} assignment
          {allAssignments.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {allAssignments.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
            edit_note
          </span>
          <p className="mt-3 font-medium text-[var(--color-on-surface)]">
            No assignments yet
          </p>
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
            Assignments published by your instructor will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm">
          <div className="divide-y divide-[var(--color-surface-variant)]">
            {allAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[var(--color-surface-container-low)]/50"
              >
                <div>
                  <p className="font-medium text-[var(--color-on-background)]">
                    {assignment.title}
                  </p>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">
                    {assignment.courseName}
                  </p>
                </div>
                <Link
                  href={`/a/${assignment.id}`}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Open →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
