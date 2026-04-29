"use server";

import { requireUser } from "@/lib/auth";
import { GYM_MODES, isGymMode, type GymMode } from "@/lib/gym";

interface ProfileIdentity {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor";
  memberSince: string;
}

export interface StudentRecentActivityItem {
  id: string;
  type: "assignment" | "gym";
  title: string;
  subtitle: string;
  href: string;
  occurredAt: string;
}

export interface StudentProfileBundle {
  identity: ProfileIdentity;
  stats: {
    assignmentsSubmitted: number;
    gymSessionsCompleted: number;
  };
  recentActivity: StudentRecentActivityItem[];
}

export interface InstructorProfileBundle {
  identity: ProfileIdentity;
  stats: {
    assignmentsAuthored: number;
    submittedAttempts: number;
  };
}

function formatProfileName(input: {
  full_name?: string | null;
  email?: string | null;
  id?: string;
}): string {
  if (input.full_name?.trim()) return input.full_name.trim();
  if (input.email?.trim()) return input.email.trim();
  return `User ${input.id?.slice(0, 8) ?? "unknown"}`;
}

export async function getStudentProfileBundle(): Promise<StudentProfileBundle | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileRow || profileRow.role !== "student") {
    return null;
  }

  const [
    submittedCountResult,
    completedCountResult,
    submittedAttemptRowsResult,
    completedSessionRowsResult,
  ] = await Promise.all([
    supabase
      .from("assignment_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .not("submitted_at", "is", null),
    supabase
      .from("gym_sessions")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .not("completed_at", "is", null),
    supabase
      .from("assignment_attempts")
      .select("id, assignment_id, submitted_at")
      .eq("student_id", user.id)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(10),
    supabase
      .from("gym_sessions")
      .select("id, mode, scenario_id, custom_topic, completed_at")
      .eq("student_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(10),
  ]);

  const assignmentIds = [
    ...new Set(
      (submittedAttemptRowsResult.data ?? []).map((row) => row.assignment_id as string)
    ),
  ];
  const scenarioIds = [
    ...new Set(
      (completedSessionRowsResult.data ?? [])
        .map((row) => row.scenario_id as string | null)
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const [assignmentRowsResult, scenarioRowsResult] = await Promise.all([
    assignmentIds.length
      ? supabase.from("assignments").select("id, title").in("id", assignmentIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
    scenarioIds.length
      ? supabase.from("scenarios").select("id, title").in("id", scenarioIds)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
  ]);

  const assignmentsById = new Map(
    (assignmentRowsResult.data ?? []).map((row) => [row.id as string, row.title as string])
  );
  const scenariosById = new Map(
    (scenarioRowsResult.data ?? []).map((row) => [row.id as string, row.title as string])
  );

  const assignmentActivity: StudentRecentActivityItem[] = (
    submittedAttemptRowsResult.data ?? []
  ).flatMap((row) => {
    const assignmentId = row.assignment_id as string;
    const occurredAt = row.submitted_at as string | null;
    if (!occurredAt) return [];

    return [
      {
        id: `assignment-${row.id as string}`,
        type: "assignment",
        title: assignmentsById.get(assignmentId) ?? "Assignment submission",
        subtitle: "Submitted assignment",
        href: `/student/assignments/${row.id as string}`,
        occurredAt,
      },
    ];
  });

  const gymActivity: StudentRecentActivityItem[] = (
    completedSessionRowsResult.data ?? []
  ).flatMap((row) => {
    const occurredAt = row.completed_at as string | null;
    if (!occurredAt) return [];

    const rawMode = row.mode as GymMode;
    const modeLabel = isGymMode(rawMode) ? GYM_MODES[rawMode].label : "Gym";
    const title =
      (row.scenario_id
        ? scenariosById.get(row.scenario_id as string)
        : null) ??
      ((row.custom_topic as string | null)?.trim() || modeLabel);

    return [
      {
        id: `gym-${row.id as string}`,
        type: "gym",
        title,
        subtitle: `${modeLabel} session complete`,
        href: `/student/gym/${row.mode as string}/${row.id as string}`,
        occurredAt,
      },
    ];
  });

  return {
    identity: {
      id: profileRow.id as string,
      name: formatProfileName({
        id: profileRow.id as string,
        full_name: profileRow.full_name as string | null,
        email: profileRow.email as string | null,
      }),
      email: profileRow.email as string,
      role: profileRow.role as "student" | "instructor",
      memberSince: profileRow.created_at as string,
    },
    stats: {
      assignmentsSubmitted: submittedCountResult.count ?? 0,
      gymSessionsCompleted: completedCountResult.count ?? 0,
    },
    recentActivity: [...assignmentActivity, ...gymActivity]
      .sort((left, right) => {
        return (
          new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
        );
      })
      .slice(0, 10),
  };
}

export async function getInstructorProfileBundle(): Promise<InstructorProfileBundle | null> {
  const { supabase, user } = await requireUser();
  if (!user) return null;

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profileRow || profileRow.role !== "instructor") {
    return null;
  }

  const [assignmentsCountResult, assignmentRowsResult] = await Promise.all([
    supabase
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("instructor_id", user.id),
    supabase
      .from("assignments")
      .select("id")
      .eq("instructor_id", user.id),
  ]);

  const assignmentIds = (assignmentRowsResult.data ?? []).map((row) => row.id as string);
  const submittedAttemptsCountResult = assignmentIds.length
    ? await supabase
        .from("assignment_attempts")
        .select("id", { count: "exact", head: true })
        .in("assignment_id", assignmentIds)
        .not("submitted_at", "is", null)
    : { count: 0 };

  return {
    identity: {
      id: profileRow.id as string,
      name: formatProfileName({
        id: profileRow.id as string,
        full_name: profileRow.full_name as string | null,
        email: profileRow.email as string | null,
      }),
      email: profileRow.email as string,
      role: profileRow.role as "student" | "instructor",
      memberSince: profileRow.created_at as string,
    },
    stats: {
      assignmentsAuthored: assignmentsCountResult.count ?? 0,
      submittedAttempts: submittedAttemptsCountResult.count ?? 0,
    },
  };
}
