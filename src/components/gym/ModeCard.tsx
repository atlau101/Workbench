import Link from "next/link";
import PillTag from "@/components/ui/PillTag";
import { GYM_MODES, getModePrompts, type GymMode } from "@/lib/gym";

interface ModeCardProps {
  mode: GymMode;
  featured?: boolean;
}

export default function ModeCard({ mode, featured = false }: ModeCardProps) {
  const config = GYM_MODES[mode];
  const promptCount = getModePrompts(mode).length;

  return (
    <Link
      href={`/student/gym/${mode}/new`}
      className={[
        "group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_0_color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
        featured ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[color-mix(in_srgb,var(--color-primary)_18%,white)]">
        <div
          className={`h-full rounded-r-full bg-[var(--color-primary)] ${featured ? "w-4/5" : "w-2/3"}`}
        />
      </div>

      <div className={`relative ${featured ? "p-8" : "p-6"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-surface-container)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-primary)]">
            <span className="material-symbols-outlined">{config.icon}</span>
          </div>
          <PillTag color={featured ? "amber" : "neutral"}>{config.badge}</PillTag>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <h3 className="font-heading text-[24px] font-semibold text-[var(--color-on-surface)]">
              {config.label}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-on-surface-variant)]">
              {config.blurb}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-on-surface-variant)]">
            <span>{config.tone} tone</span>
            <span>•</span>
            <span>{promptCount} prompts</span>
          </div>
        </div>

        <div className="mt-6">
          <span
            className={[
              "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-4 py-2 text-base font-medium transition-colors",
              featured
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] group-hover:bg-[var(--color-primary-container)]"
                : "border border-[var(--color-outline-variant)] bg-white text-[var(--color-on-surface)] group-hover:bg-[var(--color-surface-container-low)]",
            ].join(" ")}
          >
            Start Session
          </span>
        </div>
      </div>
    </Link>
  );
}
