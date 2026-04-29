import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionForStudent } from "@/app/actions/gym";
import Scaffolding from "@/app/student/gym/[mode]/[sessionId]/Scaffolding";
import GymChat from "@/app/student/gym/[mode]/[sessionId]/GymChat";
import PillTag from "@/components/ui/PillTag";
import SandboxArea from "@/components/ui/SandboxArea";
import { GYM_MODES, gymChatUnlocked, isGymMode } from "@/lib/gym";

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

  if (bundle.session.mode !== mode) {
    notFound();
  }

  const config = GYM_MODES[mode];
  const unlocked = gymChatUnlocked(mode, bundle.session.scaffolding);
  const summaryTitle = bundle.scenario?.title ?? bundle.session.custom_topic ?? config.label;

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
        <div className="flex flex-wrap items-center gap-3">
          <PillTag color="amber">{config.badge}</PillTag>
          <PillTag color="neutral">{config.tone}</PillTag>
          <PillTag color={unlocked ? "teal" : "neutral"}>
            {unlocked ? "Coach unlocked" : "Scaffolding in progress"}
          </PillTag>
        </div>
        <div>
          <h2 className="font-[Lexend] text-[32px] font-semibold text-[var(--color-on-surface)]">
            {config.label}
          </h2>
          <p className="mt-3 max-w-3xl text-[16px] leading-7 text-[var(--color-on-surface-variant)]">
            {config.blurb}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <SandboxArea className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <PillTag color="neutral">
                {bundle.scenario ? bundle.scenario.discipline : "Custom Topic"}
              </PillTag>
              {bundle.scenario ? (
                <PillTag color="neutral">{bundle.scenario.difficulty}</PillTag>
              ) : null}
            </div>
            <h3 className="mt-4 font-[Lexend] text-[24px] font-semibold text-[var(--color-on-surface)]">
              {summaryTitle}
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-on-surface-variant)]">
              {bundle.scenario?.prompt ?? bundle.session.custom_topic}
            </p>
          </SandboxArea>

          <Scaffolding
            sessionId={bundle.session.id}
            mode={mode}
            initialScaffolding={bundle.session.scaffolding}
          />
        </div>

        <GymChat
          sessionId={bundle.session.id}
          mode={mode}
          initialMessages={bundle.messages}
          unlocked={unlocked}
        />
      </div>
    </div>
  );
}
