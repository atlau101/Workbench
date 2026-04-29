import ModeCard from "@/components/gym/ModeCard";
import PillTag from "@/components/ui/PillTag";
import { GYM_MODE_ORDER } from "@/lib/gym";

export default function StudentGymPage() {
  const [featuredMode, ...otherModes] = GYM_MODE_ORDER;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <PillTag color="amber">Thinking Gym</PillTag>
          <h2 className="mt-4 font-[Lexend] text-[40px] font-semibold leading-[1.15] text-[var(--color-on-surface)]">
            Train how you think, not just what you produce.
          </h2>
          <p className="mt-4 text-[18px] leading-8 text-[var(--color-on-surface-variant)]">
            Pick a mode, ground yourself with short scaffolding, then work with an AI
            coach whose tone changes with the kind of thinking you want to practice.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ModeCard mode={featuredMode} featured />
        {otherModes.map((mode) => (
          <ModeCard key={mode} mode={mode} />
        ))}
      </div>
    </div>
  );
}
