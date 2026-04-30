import Link from "next/link";
import { notFound } from "next/navigation";
import { listScenariosForMode } from "@/app/actions/gym";
import ScenarioPicker from "@/components/gym/ScenarioPicker";
import PillTag from "@/components/ui/PillTag";
import { GYM_MODES, isGymMode } from "@/lib/gym";

export default async function NewGymSessionPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (!isGymMode(mode)) {
    notFound();
  }

  const config = GYM_MODES[mode];
  const scenarios = await listScenariosForMode(mode);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link
          href="/student/gym"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] transition-colors hover:opacity-80"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to modes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <PillTag color="amber">{config.badge}</PillTag>
          <PillTag color="neutral">{config.tone}</PillTag>
        </div>
        <div>
          <h2 className="font-[var(--font-heading)] text-[32px] font-semibold text-[var(--color-on-surface)]">
            Start a {config.label} Session
          </h2>
          <p className="mt-3 max-w-3xl text-[16px] leading-7 text-[var(--color-on-surface-variant)]">
            {config.blurb} Pick a curated scenario tagged for this mode or bring your own
            topic, then move into the scaffolding and chat workspace.
          </p>
        </div>
      </div>

      <ScenarioPicker mode={mode} scenarios={scenarios} />
    </div>
  );
}
