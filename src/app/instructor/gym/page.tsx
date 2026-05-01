import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { listGymSessionsForInstructor } from "@/app/actions/gym";
import { GYM_MODES, type GymMode } from "@/lib/gym";
import EmptyState from "@/components/ui/EmptyState";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const min = Math.round(ms / 60000);
  return min < 1 ? "<1 min" : `${min} min`;
}

function ModeBadge({ mode }: { mode: GymMode }) {
  const config = GYM_MODES[mode];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] font-[var(--font-heading)] text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
      <span className="material-symbols-outlined text-[12px] text-[var(--color-primary)]">
        {config.icon}
      </span>
      {config.badge}
    </span>
  );
}

export default async function InstructorGymPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sessions = await listGymSessionsForInstructor();

  const completedSessions = sessions.filter((s) => s.completedAt);
  const uniqueStudents = new Set(sessions.map((s) => s.studentId)).size;

  const modeCounts = sessions.reduce<Partial<Record<GymMode, number>>>((acc, s) => {
    acc[s.mode] = (acc[s.mode] ?? 0) + 1;
    return acc;
  }, {});
  const topMode = Object.entries(modeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as GymMode | undefined;

  return (
    <div className="space-y-8">
      <div className="pt-4">
        <h2 className="text-[30px] leading-[1.3] font-semibold text-[var(--color-on-background)] tracking-tight">
          Thinking Gym
        </h2>
        {sessions.length > 0 && (
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              <span className="font-medium text-[var(--color-on-surface)]">{sessions.length}</span>{" "}
              {sessions.length === 1 ? "session" : "sessions"} across{" "}
              <span className="font-medium text-[var(--color-on-surface)]">{uniqueStudents}</span>{" "}
              {uniqueStudents === 1 ? "student" : "students"}
            </p>
            {completedSessions.length > 0 && (
              <>
                <span className="text-[var(--color-outline-variant)]">·</span>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  <span className="font-medium text-[var(--color-primary)]">{completedSessions.length}</span> completed
                </p>
              </>
            )}
            {topMode && (
              <>
                <span className="text-[var(--color-outline-variant)]">·</span>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Top mode:{" "}
                  <span className="font-medium text-[var(--color-on-surface)]">
                    {GYM_MODES[topMode].label}
                  </span>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl p-8">
          <EmptyState
            icon="psychology"
            title="No gym activity yet"
            description="Students enrolled in your courses will appear here once they start a Thinking Gym session."
          />
        </div>
      ) : (
        <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-surface-variant)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-surface-variant)] text-sm text-[var(--color-on-surface-variant)]">
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Student</th>
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Mode</th>
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Topic</th>
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Exchanges</th>
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Duration</th>
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Started</th>
                  <th className="py-4 px-6 font-[var(--font-heading)] text-[12px] font-semibold tracking-[0.05em] uppercase">Status</th>
                  <th className="py-4 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-surface-variant)] text-[var(--color-on-surface)]">
                {sessions.map((s) => (
                  <tr
                    key={s.sessionId}
                    className="hover:bg-[var(--color-surface-container-low)]/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-[var(--color-on-background)]">{s.studentLabel}</p>
                      {s.studentEmail && s.studentEmail !== s.studentLabel && (
                        <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">{s.studentEmail}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <ModeBadge mode={s.mode} />
                    </td>
                    <td className="py-4 px-6 max-w-[220px]">
                      <p className="text-sm text-[var(--color-on-surface)] truncate">
                        {s.scenarioTitle ?? s.customTopic ?? (
                          <span className="text-[var(--color-on-surface-variant)]">—</span>
                        )}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-sm tabular-nums text-[var(--color-on-surface-variant)]">
                      {s.messageCount > 0 ? Math.floor(s.messageCount / 2) : 0}
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--color-on-surface-variant)]">
                      {formatDuration(s.startedAt, s.completedAt)}
                    </td>
                    <td className="py-4 px-6 text-sm text-[var(--color-on-surface-variant)]">
                      {formatDate(s.startedAt)}
                    </td>
                    <td className="py-4 px-6">
                      {s.completedAt ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Complete
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--color-on-surface-variant)]">In progress</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/instructor/gym/${s.sessionId}`}
                        className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-container)] transition-colors"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
