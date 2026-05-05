import Link from "next/link";
import { redirect } from "next/navigation";
import { listEnrolledCoursesForMe } from "@/app/actions/enrollments";
import { getStudentProfileBundle } from "@/app/actions/profile";
import RecentActivityList from "@/components/profile/RecentActivityList";
import PillTag from "@/components/ui/PillTag";
import { GYM_MODES, type GymMode } from "@/lib/gym";
import { createServerSupabaseClient } from "@/lib/supabase";

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

function attemptStageCopy(status: string | undefined) {
  switch (status) {
    case "reflect":
      return "Reflection gate in progress";
    case "ai_assist":
      return "AI assistance unlocked";
    case "synthesize":
      return "Final draft in progress";
    case "submitted":
      return "Submitted for review";
    case "complete":
      return "Review complete";
    default:
      return "Ready to start";
  }
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

type GymSessionRow = {
  id: string;
  mode: GymMode;
  scenario_id: string | null;
  custom_topic: string | null;
  started_at: string;
  completed_at: string | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function StudentDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, enrolledCourses, profileBundle, gymSessionsResult] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    listEnrolledCoursesForMe(),
    getStudentProfileBundle(),
    supabase
      .from("gym_sessions")
      .select("id, mode, scenario_id, custom_topic, started_at, completed_at")
      .eq("student_id", user.id)
      .order("started_at", { ascending: false })
      .limit(6),
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

  const gymSessions = (gymSessionsResult.data ?? []) as GymSessionRow[];
  const scenarioIds = [
    ...new Set(
      gymSessions
        .map((session) => session.scenario_id)
        .filter((value): value is string => Boolean(value))
    ),
  ];
  const scenarioRows = scenarioIds.length
    ? await supabase.from("scenarios").select("id, title").in("id", scenarioIds)
    : { data: [] as Array<{ id: string; title: string }> };
  const scenarioTitles = new Map(
    (scenarioRows.data ?? []).map((row) => [row.id as string, row.title as string])
  );

  const activeSession = gymSessions.find((session) => !session.completed_at) ?? null;
  const latestCompletedSession =
    gymSessions.find((session) => Boolean(session.completed_at)) ?? null;

  function sessionTitle(session: GymSessionRow) {
    return (
      (session.scenario_id ? scenarioTitles.get(session.scenario_id) : null) ??
      session.custom_topic?.trim() ??
      GYM_MODES[session.mode].label
    );
  }

  const pendingCount = allAssignments.filter(
    (a) =>
      !attempts[a.id] ||
      !["submitted", "complete"].includes(attempts[a.id].status)
  ).length;
  const activeCount = allAssignments.filter((assignment) =>
    ["reflect", "ai_assist", "synthesize"].includes(attempts[assignment.id]?.status ?? "")
  ).length;
  const completedCount = profileBundle?.stats.assignmentsSubmitted ?? 0;
  const completedGymSessions = profileBundle?.stats.gymSessionsCompleted ?? 0;
  const nextAssignment =
    allAssignments.find((assignment) =>
      ["reflect", "ai_assist", "synthesize"].includes(attempts[assignment.id]?.status ?? "")
    ) ??
    allAssignments.find((assignment) => !attempts[assignment.id]) ??
    null;
  const nextAttempt = nextAssignment ? attempts[nextAssignment.id] : undefined;
  const nextBadge = attemptStatusBadge(nextAttempt?.status);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-primary)]/20 bg-[color-mix(in_srgb,var(--color-primary-container)_8%,white)] p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <PillTag color="amber">Next up</PillTag>
            <h2 className="mt-4 font-heading text-3xl font-bold text-[var(--color-primary)]">
              Hello, {displayName}!
            </h2>
            <p className="mt-3 text-[18px] leading-8 text-[var(--color-on-surface-variant)]">
              {nextAssignment
                ? "Your dashboard is centered on the next piece of thinking work that needs your attention."
                : "No pending assignment right now. Review your recent work or head into the Thinking Gym for low-stakes practice."}
            </p>
          </div>

          {nextAssignment ? (
            <div className="w-full max-w-xl rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-[color-mix(in_srgb,var(--color-primary-container)_24%,white)] px-2 py-0.5 font-heading text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                      {nextAssignment.courseName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${nextBadge.className}`}
                    >
                      {nextBadge.text}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-[24px] font-semibold text-[var(--color-on-surface)]">
                    {nextAssignment.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
                    {attemptStageCopy(nextAttempt?.status)}
                    {formatDueDate(nextAssignment.due_date)
                      ? ` · ${formatDueDate(nextAssignment.due_date)}`
                      : null}
                  </p>
                </div>
                <Link
                  href={`/a/${nextAssignment.id}`}
                  className="shrink-0 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
                >
                  {attemptButtonLabel(nextAttempt?.status)}
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Assignments in flight
            </p>
            <p className="mt-3 font-heading text-[32px] font-semibold text-[var(--color-on-surface)]">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Submitted work
            </p>
            <p className="mt-3 font-heading text-[32px] font-semibold text-[var(--color-on-surface)]">
              {completedCount}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Gym sessions completed
            </p>
            <p className="mt-3 font-heading text-[32px] font-semibold text-[var(--color-on-surface)]">
              {completedGymSessions}
            </p>
          </div>
        </div>
      </section>

      <RecentActivityList
        items={profileBundle?.recentActivity.slice(0, 6) ?? []}
        title="Learning record"
        description="Submitted assignments and completed practice stay visible here so you can track the process, not just the final product."
      />

      <section className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <PillTag color="amber">Optional practice</PillTag>
            <h3 className="mt-4 font-heading text-[28px] font-semibold text-[var(--color-on-surface)]">
              Thinking Gym
            </h3>
            <p className="mt-3 text-[16px] leading-7 text-[var(--color-on-surface-variant)]">
              {activeSession
                ? `Resume ${GYM_MODES[activeSession.mode].label.toLowerCase()} on ${sessionTitle(activeSession)}.`
                : latestCompletedSession
                  ? `Your latest session focused on ${sessionTitle(latestCompletedSession)}. Start another rep when you want practice without assignment pressure.`
                  : "Use guided scenarios and coaching modes to practice your thinking outside of class deadlines."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeSession ? (
              <Link
                href={`/student/gym/${activeSession.mode}/${activeSession.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
              >
                Continue session
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            ) : null}
            <Link
              href="/student/gym"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Browse practice library
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Modes available
            </p>
            <p className="mt-3 font-heading text-[32px] font-semibold text-[var(--color-on-surface)]">
              {Object.keys(GYM_MODES).length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Latest session
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface)]">
              {activeSession
                ? `${sessionTitle(activeSession)} is still in progress`
                : latestCompletedSession
                  ? `${sessionTitle(latestCompletedSession)}`
                  : "No practice history yet"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Last completion
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface)]">
              {latestCompletedSession?.completed_at
                ? formatDateTime(latestCompletedSession.completed_at)
                : "Complete a session to build your history."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-on-surface)]">
                Assignment queue
              </h3>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                {pendingCount > 0
                  ? `${pendingCount} assignment${pendingCount !== 1 ? "s" : ""} still need attention.`
                  : "No open assignments right now."}
              </p>
            </div>
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
                Published course work will appear here.
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
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                            >
                              {badge.text}
                            </span>
                            <span className="text-xs text-[var(--color-on-surface-variant)]">
                              {attemptStageCopy(attempt?.status)}
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

        <aside className="space-y-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-semibold text-[var(--color-on-surface)]">
                  Course context
                </h3>
                <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                  Kept secondary so the work stays front and center.
                </p>
              </div>
              <Link
                href="/student/courses"
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                All courses
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
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
