import Link from "next/link";
import { redirect } from "next/navigation";
import { listEnrolledCoursesForMe } from "@/app/actions/enrollments";
import { createServerSupabaseClient } from "@/lib/supabase";

type AttemptStatus = "reflect" | "ai_assist" | "synthesize" | "submitted" | "complete";

function statusBadge(status: AttemptStatus | undefined): { label: string; className: string } {
  switch (status) {
    case "reflect":
    case "ai_assist":
    case "synthesize":
      return {
        label: "In progress",
        className: "bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] text-[var(--color-primary)]",
      };
    case "submitted":
      return {
        label: "Submitted",
        className: "bg-[color-mix(in_srgb,var(--color-amber)_15%,white)] text-[color-mix(in_srgb,var(--color-amber)_80%,black)]",
      };
    case "complete":
      return {
        label: "Complete",
        className: "bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] text-[var(--color-primary)]",
      };
    default:
      return {
        label: "Not started",
        className: "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]",
      };
  }
}

function ctaLabel(status: AttemptStatus | undefined): string {
  switch (status) {
    case "reflect":
    case "ai_assist":
    case "synthesize":
      return "Continue";
    case "submitted":
    case "complete":
      return "View";
    default:
      return "Start";
  }
}

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

  let attempts: Record<string, { id: string; status: AttemptStatus }> = {};
  if (allAssignments.length > 0) {
    const { data } = await supabase
      .from("assignment_attempts")
      .select("id, assignment_id, status")
      .in("assignment_id", allAssignments.map((a) => a.id))
      .eq("student_id", user.id);
    for (const row of data ?? []) {
      attempts[row.assignment_id] = { id: row.id, status: row.status as AttemptStatus };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[var(--text-h2)] font-semibold text-[var(--color-on-background)]">
            All Assignments
          </h2>
          <p className="mt-1 text-[var(--color-on-surface-variant)]">
            {allAssignments.length} assignment{allAssignments.length !== 1 ? "s" : ""} across your courses
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline shrink-0"
        >
          Back to Dashboard
        </Link>
      </div>

      {allAssignments.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
            edit_note
          </span>
          <p className="mt-3 font-medium text-[var(--color-on-surface)]">No assignments yet</p>
          <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
            Assignments published by your instructor will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
          <div className="divide-y divide-[var(--color-outline-variant)]">
            {allAssignments.map((assignment) => {
              const attempt = attempts[assignment.id];
              const badge = statusBadge(attempt?.status);
              const cta = ctaLabel(attempt?.status);
              const gateLevel = (assignment as { gate_level?: string }).gate_level;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--color-surface-container-low)]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-on-surface)] truncate">
                      {assignment.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[var(--color-on-surface-variant)]">
                        {assignment.courseName}
                      </span>
                      {gateLevel ? (
                        <>
                          <span className="text-[var(--color-outline-variant)]">·</span>
                          <span className="text-xs capitalize text-[var(--color-on-surface-variant)]">
                            {gateLevel} gate
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <span
                    className={[
                      "shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-xs font-semibold tracking-wide",
                      badge.className,
                    ].join(" ")}
                  >
                    {badge.label}
                  </span>

                  <Link
                    href={`/a/${assignment.id}`}
                    className="shrink-0 rounded-[var(--radius)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
                  >
                    {cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
