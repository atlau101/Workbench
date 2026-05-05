import Link from "next/link";
import { redirect } from "next/navigation";
import { listMyCourses } from "@/app/actions/courses";
import { createServerSupabaseClient } from "@/lib/supabase";
import { listMyAssignments } from "@/app/actions/assignments";
import { listFlaggedAttemptsForInstructor } from "@/app/actions/attempts";
import NeedsAttentionPanel from "@/components/instructor/NeedsAttentionPanel";
import TrendChartStub from "@/components/instructor/TrendChartStub";
import AssignmentsTable from "@/components/instructor/AssignmentsTable";
import EmptyState from "@/components/ui/EmptyState";

type AttemptAnalyticsRow = {
  id: string;
  assignment_id: string;
  status: string;
  gate_passed_at: string | null;
  submitted_at: string | null;
  started_at: string;
};

type ReflectionRow = {
  attempt_id: string;
  word_count: number | null;
};

type ChatRow = {
  attempt_id: string;
  role: string;
};

function formatMetricValue(value: number | null, suffix = "") {
  if (value === null) return "—";
  return `${value}${suffix}`;
}

function formatPercent(value: number, total: number) {
  if (total === 0) return null;
  return Math.round((value / total) * 100);
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
        {label}
      </p>
      <p className="mt-3 font-heading text-[30px] font-semibold text-[var(--color-on-surface)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-on-surface-variant)]">
        {detail}
      </p>
    </div>
  );
}

export default async function InstructorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [assignments, flaggedAttempts, courses] = await Promise.all([
    listMyAssignments(),
    listFlaggedAttemptsForInstructor(),
    listMyCourses(),
  ]);
  const courseNameMap = Object.fromEntries(courses.map((course) => [course.id, course.name]));
  const assignmentIds = assignments.map((assignment) => assignment.id);
  const attemptRows = assignmentIds.length
    ? (((await supabase
        .from("assignment_attempts")
        .select("id, assignment_id, status, gate_passed_at, submitted_at, started_at")
        .in("assignment_id", assignmentIds)
        .order("started_at", { ascending: false })).data ?? []) as AttemptAnalyticsRow[])
    : [];
  const attemptIds = attemptRows.map((attempt) => attempt.id);
  const [reflectionRowsResult, chatRowsResult] = attemptIds.length
    ? await Promise.all([
        supabase
          .from("reflection_responses")
          .select("attempt_id, word_count")
          .in("attempt_id", attemptIds),
        supabase
          .from("chat_messages")
          .select("attempt_id, role")
          .in("attempt_id", attemptIds),
      ])
    : [{ data: [] as ReflectionRow[] }, { data: [] as ChatRow[] }];

  const reflectionRows = (reflectionRowsResult.data ?? []) as ReflectionRow[];
  const chatRows = (chatRowsResult.data ?? []) as ChatRow[];

  const reflectionWordsByAttempt = new Map<string, number>();
  for (const row of reflectionRows) {
    reflectionWordsByAttempt.set(
      row.attempt_id,
      (reflectionWordsByAttempt.get(row.attempt_id) ?? 0) + (row.word_count ?? 0)
    );
  }

  const userMessagesByAttempt = new Map<string, number>();
  for (const row of chatRows) {
    if (row.role !== "user") continue;
    userMessagesByAttempt.set(
      row.attempt_id,
      (userMessagesByAttempt.get(row.attempt_id) ?? 0) + 1
    );
  }

  const startedAttempts = attemptRows.length;
  const submittedAttempts = attemptRows.filter((attempt) => Boolean(attempt.submitted_at));
  const submittedAttemptsCount = submittedAttempts.length;
  const gatePassedCount = attemptRows.filter(
    (attempt) => Boolean(attempt.gate_passed_at) || attempt.status !== "reflect"
  ).length;
  const gateCompletionRate = formatPercent(gatePassedCount, startedAttempts);

  const attemptsWithReflection = attemptRows.filter(
    (attempt) => (reflectionWordsByAttempt.get(attempt.id) ?? 0) > 0
  );
  const totalReflectionWords = attemptsWithReflection.reduce(
    (sum, attempt) => sum + (reflectionWordsByAttempt.get(attempt.id) ?? 0),
    0
  );
  const averageReflectionWords = attemptsWithReflection.length
    ? Math.round(totalReflectionWords / attemptsWithReflection.length)
    : null;

  const aiAttempts = attemptRows.filter((attempt) => (userMessagesByAttempt.get(attempt.id) ?? 0) > 0);
  const totalUserMessages = aiAttempts.reduce(
    (sum, attempt) => sum + (userMessagesByAttempt.get(attempt.id) ?? 0),
    0
  );
  const averageAiMessages = aiAttempts.length
    ? Math.round((totalUserMessages / aiAttempts.length) * 10) / 10
    : null;

  const flaggedStudentCount = new Set(
    flaggedAttempts.map((attempt) => attempt.studentLabel)
  ).size;
  const trendBuckets = new Map<
    string,
    { label: string; totalWords: number; count: number; timestamp: number }
  >();
  for (const attempt of submittedAttempts) {
    const submittedAt = attempt.submitted_at ?? attempt.started_at;
    const date = new Date(submittedAt);
    const key = date.toISOString().slice(0, 10);
    const bucket = trendBuckets.get(key) ?? {
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      totalWords: 0,
      count: 0,
      timestamp: date.getTime(),
    };
    bucket.totalWords += reflectionWordsByAttempt.get(attempt.id) ?? 0;
    bucket.count += 1;
    trendBuckets.set(key, bucket);
  }
  const trendPoints = [...trendBuckets.values()]
    .sort((left, right) => left.timestamp - right.timestamp)
    .slice(-6)
    .map((bucket) => ({
      label: bucket.label,
      value: Math.round(bucket.totalWords / Math.max(bucket.count, 1)),
    }));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between pt-4">
        <div>
          <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)] tracking-tight">
            Overview
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="font-body text-[var(--color-on-surface-variant)]">
              {user.email}
            </p>
            {assignments.length > 0 ? (
              <span className="text-sm text-[var(--color-on-surface-variant)]">
                ·{" "}
                <span className="font-medium text-[var(--color-on-surface)]">
                  {courses.length}
                </span>{" "}
                {courses.length === 1 ? "course" : "courses"} ·{" "}
                <span className="font-medium text-[var(--color-on-surface)]">
                  {assignments.length}
                </span>{" "}
                {assignments.length === 1 ? "assignment" : "assignments"} ·{" "}
                <span className="font-medium text-[var(--color-on-surface)]">
                  {submittedAttemptsCount}
                </span>{" "}
                submitted
              </span>
            ) : null}
          </div>
        </div>
        <Link
          href="/instructor/assignments/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-heading text-[12px] font-semibold tracking-[0.05em] uppercase hover:bg-[var(--color-primary-container)] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Assignment
        </Link>
      </div>

      <div className="max-w-4xl">
        <p className="text-[16px] leading-7 text-[var(--color-on-surface-variant)]">
          Watch where students are getting traction, where the reflection gate is
          working, and which submissions need follow-up before you dive into
          individual process logs.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-8 shadow-sm">
          <EmptyState
            icon="edit_note"
            title="No assignments to analyze yet"
            description="Create your first assignment to start collecting reflection, AI, and submission data for this overview."
            action={
              <Link
                href="/instructor/assignments/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] transition-opacity hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Assignment
              </Link>
            }
          />
        </div>
      ) : null}

      {assignments.length > 0 ? (
        <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Reflection depth"
          value={formatMetricValue(averageReflectionWords, " words")}
          detail={
            attemptsWithReflection.length > 0
              ? `Average across ${attemptsWithReflection.length} attempt${attemptsWithReflection.length !== 1 ? "s" : ""} with saved reflection work.`
              : "No saved reflection responses yet."
          }
        />
        <MetricCard
          label="AI usage"
          value={formatMetricValue(averageAiMessages)}
          detail={
            aiAttempts.length > 0
              ? `Average student messages across ${aiAttempts.length} attempt${aiAttempts.length !== 1 ? "s" : ""} that used AI.`
              : "No AI-assisted attempts yet."
          }
        />
        <MetricCard
          label="Gate completion"
          value={gateCompletionRate !== null ? `${gateCompletionRate}%` : "—"}
          detail={
            startedAttempts > 0
              ? `${gatePassedCount} of ${startedAttempts} started attempt${startedAttempts !== 1 ? "s" : ""} reached AI assist or beyond.`
              : "No started attempts yet."
          }
        />
        <MetricCard
          label="Needs follow-up"
          value={`${flaggedAttempts.length}`}
          detail={
            flaggedAttempts.length > 0
              ? `${flaggedStudentCount} student${flaggedStudentCount !== 1 ? "s" : ""} currently surfaced by low-effort signals.`
              : "No flagged submissions right now."
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <TrendChartStub
            points={trendPoints}
            submittedAttempts={submittedAttemptsCount}
            averageValue={averageReflectionWords}
          />

          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[var(--color-surface-variant)] flex items-center justify-between bg-[var(--color-surface)]/30">
              <h3 className="text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
                Active Assignments
              </h3>
              <Link
                href="/instructor/assignments"
                className="font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors"
              >
                View All
              </Link>
            </div>
            <AssignmentsTable
              assignments={assignments.slice(0, 5)}
              courseNameMap={courseNameMap}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <NeedsAttentionPanel items={flaggedAttempts} />
        </div>
      </div>
        </>
      ) : null}
    </div>
  );
}
