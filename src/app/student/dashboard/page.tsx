import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { listEnrolledCoursesForMe } from "@/app/actions/enrollments";

const COURSE_COLORS = [
  {
    badge: "bg-[color-mix(in_srgb,var(--color-primary-container)_25%,white)] text-[var(--color-primary)]",
    dot: "bg-[var(--color-primary)]",
    icon: "bg-[var(--color-primary)]",
  },
  {
    badge: "bg-[color-mix(in_srgb,var(--color-secondary-container)_25%,white)] text-[var(--color-secondary)]",
    dot: "bg-[var(--color-secondary)]",
    icon: "bg-[var(--color-secondary)]",
  },
  {
    badge: "bg-[color-mix(in_srgb,var(--color-tertiary-container)_25%,white)] text-[var(--color-tertiary)]",
    dot: "bg-[var(--color-tertiary)]",
    icon: "bg-[var(--color-tertiary)]",
  },
] as const;

function attemptStatusBadge(status: string | undefined) {
  switch (status) {
    case "reflect":
      return {
        text: "In progress",
        className:
          "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]",
      };
    case "ai_assist":
      return {
        text: "AI phase",
        className:
          "bg-[color-mix(in_srgb,var(--color-secondary-container)_30%,white)] text-[var(--color-secondary)]",
      };
    case "synthesize":
      return {
        text: "Synthesizing",
        className:
          "bg-[color-mix(in_srgb,var(--color-primary-container)_30%,white)] text-[var(--color-primary)]",
      };
    case "submitted":
      return {
        text: "Submitted",
        className: "bg-[color-mix(in_srgb,var(--color-amber)_15%,white)] text-[color-mix(in_srgb,var(--color-amber)_80%,black)]",
      };
    case "complete":
      return {
        text: "Complete",
        className: "bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] text-[var(--color-primary)]",
      };
    default:
      return {
        text: "Not started",
        className:
          "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]",
      };
  }
}

function attemptButtonLabel(status: string | undefined) {
  if (!status) return "Start";
  if (status === "submitted" || status === "complete") return "View";
  return "Continue";
}

// Formats a due_date string for display. Returns null when no date is set.
function formatDueDate(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  return `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

type AssignmentRow = {
  id: string;
  title: string;
  due_date?: string | null;
  courseName: string;
  courseIndex: number;
};

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, enrolledCourses] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    listEnrolledCoursesForMe(),
  ]);

  const displayName =
    profileResult.data?.full_name || user.email?.split("@")[0] || "there";

  // due_date is not yet in the schema; the field will be added later.
  // When available it will populate automatically via the select below.
  const allAssignments: AssignmentRow[] = enrolledCourses.flatMap(
    (ec, courseIndex) =>
      ec.assignments.map((a) => ({
        ...a,
        due_date: (a as AssignmentRow).due_date ?? null,
        courseName: ec.course.name,
        courseIndex,
      }))
  );

  const attempts: Record<string, { id: string; status: string }> = {};
  if (allAssignments.length > 0) {
    const { data } = await supabase
      .from("assignment_attempts")
      .select("id, assignment_id, status")
      .in(
        "assignment_id",
        allAssignments.map((a) => a.id)
      )
      .eq("student_id", user.id);
    for (const row of data ?? []) {
      attempts[row.assignment_id] = { id: row.id, status: row.status };
    }
  }

  const pendingCount = allAssignments.filter(
    (a) =>
      !attempts[a.id] ||
      !["submitted", "complete"].includes(attempts[a.id].status)
  ).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* Main feed */}
      <div className="space-y-8">
        {/* Welcome hero */}
        <section className="rounded-2xl border border-[var(--color-primary)]/20 bg-[color-mix(in_srgb,var(--color-primary-container)_8%,white)] p-8">
          <h2 className="font-heading text-3xl font-bold text-[var(--color-primary)]">
            Hello, {displayName}!
          </h2>
          <p className="mt-2 text-[var(--color-on-surface-variant)]">
            {pendingCount > 0
              ? `You have ${pendingCount} assignment${pendingCount !== 1 ? "s" : ""} to work on.`
              : "All caught up — great work!"}
          </p>
        </section>

        {/* Assignments timeline */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-[var(--color-on-surface)]">
              Assignments
            </h3>
            <Link
              href="/student/assignments"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              View all →
            </Link>
          </div>

          {allAssignments.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
                edit_note
              </span>
              <p className="mt-3 font-medium text-[var(--color-on-surface)]">
                No assignments yet
              </p>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                Assignments from your courses will appear here.
              </p>
            </div>
          ) : (
            <div className="relative space-y-3 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-[var(--color-outline-variant)]">
              {allAssignments.map((assignment) => {
                const colors =
                  COURSE_COLORS[assignment.courseIndex % COURSE_COLORS.length];
                const attempt = attempts[assignment.id];
                const badge = attemptStatusBadge(attempt?.status);
                const btnLabel = attemptButtonLabel(attempt?.status);
                const dueLabel = formatDueDate(assignment.due_date);

                return (
                  <div key={assignment.id} className="relative pl-10">
                    <div
                      className={`absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 border-[var(--color-background)] ${colors.dot}`}
                    />
                    <div className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 transition-shadow hover:shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span
                            className={`inline-block rounded px-2 py-0.5 font-heading text-xs font-semibold uppercase tracking-[0.05em] ${colors.badge}`}
                          >
                            {assignment.courseName}
                          </span>
                          <h4 className="mt-2 font-heading font-semibold text-[var(--color-on-surface)]">
                            {assignment.title}
                          </h4>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                            >
                              {badge.text}
                            </span>
                            {dueLabel && (
                              <span className="text-xs text-[var(--color-on-surface-variant)]">
                                {dueLabel}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/a/${assignment.id}`}
                          className="shrink-0 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
                        >
                          {btnLabel}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Right panel */}
      <aside className="space-y-6">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-[var(--color-on-surface)]">
              Active Courses
            </h3>
            <Link
              href="/student/courses"
              className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              All Courses
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-6 text-center">
              <span className="material-symbols-outlined text-3xl text-[var(--color-on-surface-variant)]">
                school
              </span>
              <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                Not enrolled in any courses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledCourses.map((ec, idx) => {
                const colors = COURSE_COLORS[idx % COURSE_COLORS.length];
                return (
                  <Link
                    key={ec.enrollment_id}
                    href="/student/courses"
                    className="flex items-center gap-3 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-3 transition-colors hover:border-[var(--color-primary)]"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${colors.icon}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        school
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-bold text-[var(--color-on-surface)]">
                        {ec.course.name}
                      </p>
                      <p className="text-xs text-[var(--color-on-surface-variant)]">
                        {ec.assignments.length} assignment
                        {ec.assignments.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-outline)]">
                      <span className="material-symbols-outlined text-[16px]">
                        assignment
                      </span>
                      <span className="text-xs font-bold">
                        {ec.assignments.length}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
