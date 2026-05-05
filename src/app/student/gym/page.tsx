import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import ModeCard from "@/components/gym/ModeCard";
import PillTag from "@/components/ui/PillTag";
import { GYM_MODES, GYM_MODE_ORDER, type GymMode } from "@/lib/gym";

type SessionRow = {
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

export default async function StudentGymPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [featuredMode, ...otherModes] = GYM_MODE_ORDER;
  const { data } = await supabase
    .from("gym_sessions")
    .select("id, mode, scenario_id, custom_topic, started_at, completed_at")
    .eq("student_id", user.id)
    .order("started_at", { ascending: false })
    .limit(6);

  const sessions = (data ?? []) as SessionRow[];
  const scenarioIds = [
    ...new Set(
      sessions
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

  const activeSession = sessions.find((session) => !session.completed_at) ?? null;
  const latestCompletedSession =
    sessions.find((session) => Boolean(session.completed_at)) ?? null;

  function sessionTitle(session: SessionRow) {
    return (
      (session.scenario_id ? scenarioTitles.get(session.scenario_id) : null) ??
      session.custom_topic?.trim() ??
      GYM_MODES[session.mode].label
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <PillTag color="amber">Thinking Gym</PillTag>
          <h2 className="mt-4 font-heading text-[40px] font-semibold leading-[1.15] text-[var(--color-on-surface)]">
            Train how you think, not just what you produce.
          </h2>
          <p className="mt-4 text-[18px] leading-8 text-[var(--color-on-surface-variant)]">
            Pick a mode, ground yourself with short scaffolding, then work with an AI
            coach whose tone changes with the kind of thinking you want to practice.
          </p>
        </div>
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-primary)_16%,white)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)] p-5 lg:max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
            Practice library
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">
            Five guided thinking modes. Curated scenarios. Low-stakes reps that stay
            separate from your assignment workflow.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <PillTag color="amber">Optional practice</PillTag>
            <h3 className="mt-4 font-heading text-[28px] font-semibold text-[var(--color-on-surface)]">
              {activeSession
                ? "Continue your latest session"
                : latestCompletedSession
                  ? "Pick up where your last session left off"
                  : "Start a short practice loop"}
            </h3>
            <p className="mt-3 text-[16px] leading-7 text-[var(--color-on-surface-variant)]">
              {activeSession
                ? `${GYM_MODES[activeSession.mode].label}: ${sessionTitle(activeSession)}`
                : latestCompletedSession
                  ? `Your latest completed session was ${GYM_MODES[latestCompletedSession.mode].label.toLowerCase()} on ${sessionTitle(latestCompletedSession)}.`
                  : "Choose a mode, pick a scenario, and spend 15-20 minutes building a sharper thinking habit."}
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
            {latestCompletedSession ? (
              <Link
                href={`/student/gym/${latestCompletedSession.mode}/${latestCompletedSession.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] px-4 py-2.5 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Review last session
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Modes
            </p>
            <p className="mt-3 font-heading text-[30px] font-semibold text-[var(--color-on-surface)]">
              {GYM_MODE_ORDER.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Sessions started
            </p>
            <p className="mt-3 font-heading text-[30px] font-semibold text-[var(--color-on-surface)]">
              {sessions.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
              Latest completion
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-on-surface)]">
              {latestCompletedSession?.completed_at
                ? formatDateTime(latestCompletedSession.completed_at)
                : "No completed sessions yet"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <ModeCard mode={featuredMode} featured />
        {otherModes.map((mode) => (
          <ModeCard key={mode} mode={mode} />
        ))}
      </div>
    </div>
  );
}
