import Link from "next/link";
import { notFound } from "next/navigation";
import { getGymSessionForInstructor } from "@/app/actions/gym";
import { GYM_MODES, getModePrompts, gymChatUnlocked, meetsSentenceRequirement } from "@/lib/gym";
import Markdown from "@/components/instructor/process-log/Markdown";
import SandboxArea from "@/components/ui/SandboxArea";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  if (!completedAt) return null as unknown as string;
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const min = Math.round(ms / 60000);
  return min < 1 ? "less than a minute" : `${min} min`;
}

export default async function InstructorGymSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const bundle = await getGymSessionForInstructor(sessionId);
  if (!bundle) notFound();

  const { session, scenario, messages, studentLabel, studentEmail } = bundle;
  const config = GYM_MODES[session.mode];
  const prompts = getModePrompts(session.mode);
  const unlocked = gymChatUnlocked(session.mode, session.scaffolding);
  const topic = scenario?.title ?? session.custom_topic ?? null;
  const duration = formatDuration(session.started_at, session.completed_at);
  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/instructor/gym"
            className="text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] flex items-center gap-1 mb-2"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            All gym sessions
          </Link>
          <h1 className="font-heading text-[40px] leading-[1.2] font-semibold text-[var(--color-on-background)]">
            {studentLabel}
          </h1>
          {studentEmail && studentEmail !== studentLabel && (
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{studentEmail}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] font-heading text-[12px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[14px] text-[var(--color-primary)]">{config.icon}</span>
            {config.label}
          </span>
          {session.completed_at ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Completed {formatDateTime(session.completed_at)}
            </span>
          ) : (
            <span className="text-sm text-[var(--color-on-surface-variant)]">
              In progress · started {formatDateTime(session.started_at)}
            </span>
          )}
        </div>
      </div>

      {/* Topic / scenario */}
      {topic && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)]">
          <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)] mt-0.5">topic</span>
          <div>
            <p className="font-heading text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-0.5">
              {scenario ? "Scenario" : "Custom Topic"}
            </p>
            <p className="text-[var(--color-on-surface)] text-sm leading-[1.6]">{topic}</p>
            {scenario?.prompt && (
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] leading-[1.6]">{scenario.prompt}</p>
            )}
          </div>
        </div>
      )}

      {/* Diagnostic strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-4">
          <p className="font-heading text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1">
            Context Set
          </p>
          <p className="text-[24px] font-semibold text-[var(--color-on-background)]">
            {prompts.filter((p) => meetsSentenceRequirement(session.scaffolding[p.id] ?? "")).length}
            <span className="text-sm font-normal text-[var(--color-on-surface-variant)]"> / {prompts.length}</span>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-4">
          <p className="font-heading text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1">
            Exchanges
          </p>
          <p className="text-[24px] font-semibold text-[var(--color-on-background)]">
            {userMessages.length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-surface-variant)] bg-[var(--color-surface-container-lowest)] p-4">
          <p className="font-heading text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] mb-1">
            Duration
          </p>
          <p className="text-[24px] font-semibold text-[var(--color-on-background)]">
            {duration ?? <span className="text-[var(--color-on-surface-variant)]">—</span>}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:min-h-[60vh]">
        {/* Left: context scaffolding */}
        <section className="flex min-h-0 flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)] sticky top-0 z-10 bg-[var(--color-background)] pt-1">
            <span className="material-symbols-outlined text-[var(--color-primary)]">settings_suggest</span>
            <h3 className="font-heading text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
              Context Setup
            </h3>
            {!unlocked && (
              <span className="ml-auto font-heading text-[11px] font-semibold tracking-[0.05em] uppercase text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)] rounded-full px-2 py-0.5">
                Incomplete
              </span>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {prompts.map((prompt) => {
              const response = session.scaffolding[prompt.id]?.trim() ?? "";
              const met = meetsSentenceRequirement(response);
              return (
                <SandboxArea key={prompt.id} className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)]">
                      {prompt.text}
                    </p>
                    {met ? (
                      <span className="material-symbols-outlined text-[16px] text-[var(--color-primary)] shrink-0">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-[var(--color-outline)] shrink-0">radio_button_unchecked</span>
                    )}
                  </div>
                  {response ? (
                    <p className="text-sm leading-[1.7] text-[var(--color-on-surface-variant)] whitespace-pre-wrap">
                      {response}
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--color-outline)] italic">No response entered.</p>
                  )}
                </SandboxArea>
              );
            })}
          </div>
        </section>

        {/* Right: coaching conversation */}
        <section className="flex min-h-0 flex-col gap-4 lg:border-l lg:border-[var(--color-outline-variant)] lg:pl-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)] sticky top-0 z-10 bg-[var(--color-background)] pt-1">
            <span className="material-symbols-outlined text-[var(--color-tertiary-container)]">forum</span>
            <h3 className="font-heading text-[24px] leading-[1.4] font-medium text-[var(--color-on-background)]">
              Coaching Session
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {!unlocked && messages.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5">
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  Context setup was not completed — coaching session did not unlock.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-5">
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  No coaching exchanges recorded for this session.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`relative max-w-[95%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "rounded-tr-sm border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]"
                        : "rounded-tl-sm border border-dashed border-[color-mix(in_srgb,var(--color-primary)_35%,white)] bg-[var(--color-surface-container)]"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <span className="absolute top-2 right-3 font-heading text-[10px] font-semibold tracking-[0.05em] uppercase text-[var(--color-primary)]">
                        Coach AI
                      </span>
                    )}
                    <div className={message.role === "assistant" ? "pr-14" : ""}>
                      <Markdown content={message.content} />
                    </div>
                  </div>
                  <span className="text-[12px] text-[var(--color-outline)]">
                    {message.role === "user" ? "Student" : "AI"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
