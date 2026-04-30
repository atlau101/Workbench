import Link from "next/link";
import { notFound } from "next/navigation";
import { completeSession, getSessionForStudent } from "@/app/actions/gym";
import Scaffolding from "@/app/student/gym/[mode]/[sessionId]/Scaffolding";
import GymChat from "@/app/student/gym/[mode]/[sessionId]/GymChat";
import Button from "@/components/ui/Button";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import { GYM_MODES, gymChatUnlocked, isGymMode } from "@/lib/gym";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function GymSessionPage({
  params,
}: {
  params: Promise<{ mode: string; sessionId: string }>;
}) {
  const { mode, sessionId } = await params;
  if (!isGymMode(mode)) {
    notFound();
  }

  const bundle = await getSessionForStudent(sessionId);
  if ("error" in bundle) {
    notFound();
  }

  const sessionBundle = bundle;

  if (sessionBundle.session.mode !== mode) {
    notFound();
  }

  const config = GYM_MODES[mode];
  const unlocked = gymChatUnlocked(mode, sessionBundle.session.scaffolding);
  const summaryTitle =
    sessionBundle.scenario?.title ?? sessionBundle.session.custom_topic ?? config.label;
  const completedAt = sessionBundle.session.completed_at;

  async function markComplete() {
    "use server";

    await completeSession(sessionId);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href={`/student/gym/${mode}/new`}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] transition-colors hover:opacity-80"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Change topic
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <PillTag color="amber">{config.badge}</PillTag>
            <PillTag color="neutral">{config.tone}</PillTag>
            <PillTag color={completedAt ? "amber" : unlocked ? "teal" : "neutral"}>
              {completedAt
                ? "Session complete"
                : unlocked
                  ? "Coach unlocked"
                  : "Scaffolding in progress"}
            </PillTag>
          </div>
          {completedAt ? (
            <PillTag color="teal">Completed {formatDateTime(completedAt)}</PillTag>
          ) : (
            <form action={markComplete}>
              <Button type="submit">Mark complete</Button>
            </form>
          )}
        </div>
        <div>
          <h2 className="font-[var(--font-heading)] text-[32px] font-semibold text-[var(--color-on-surface)]">
            {config.label}
          </h2>
          <p className="mt-3 max-w-3xl text-[16px] leading-7 text-[var(--color-on-surface-variant)]">
            {config.blurb}
          </p>
        </div>
        {completedAt ? (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_18%,white)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)] px-4 py-3 text-sm text-[var(--color-on-surface)]">
            Session complete. The coach is now locked for this session.
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <SandboxArea className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <PillTag color="neutral">
                {sessionBundle.scenario ? sessionBundle.scenario.discipline : "Custom Topic"}
              </PillTag>
              {sessionBundle.scenario ? (
                <PillTag color="neutral">{sessionBundle.scenario.difficulty}</PillTag>
              ) : null}
            </div>
            <h3 className="mt-4 font-[var(--font-heading)] text-[24px] font-semibold text-[var(--color-on-surface)]">
              {summaryTitle}
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-on-surface-variant)]">
              {sessionBundle.scenario?.prompt ?? sessionBundle.session.custom_topic}
            </p>
          </SandboxArea>

          <Scaffolding
            sessionId={sessionId}
            mode={mode}
            initialScaffolding={sessionBundle.session.scaffolding}
          />
        </div>

        <div className="min-w-0">
          <GymChat
            sessionId={sessionId}
            mode={mode}
            initialMessages={sessionBundle.messages}
            unlocked={unlocked}
            completedAt={completedAt}
          />
        </div>
      </div>
    </div>
  );
}
