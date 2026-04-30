import Stepper from "@/components/ui/Stepper";
import PillTag from "@/components/ui/PillTag";
import type { AttemptStatus, Assignment } from "@/lib/assignments";

const STEPS = ["Reflect", "AI Assist", "Synthesize"];

const STEP_INDEX: Record<AttemptStatus, number> = {
  reflect: 0,
  ai_assist: 1,
  synthesize: 2,
  submitted: 2,
  complete: 2,
};

interface WorkspaceShellProps {
  assignment: Pick<Assignment, "title" | "gate_level">;
  status: AttemptStatus;
  children: React.ReactNode;
}

export default function WorkspaceShell({
  assignment,
  status,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <PillTag color="teal">
            {assignment.gate_level === "progressive" ? "Progressive" : "Standard"}
          </PillTag>
        </div>
        <div>
          <h1 className="font-[var(--font-heading)] text-[40px] leading-[1.2] font-semibold text-[var(--color-on-background)]">
            {assignment.title}
          </h1>
        </div>
        <div className="max-w-3xl">
          <Stepper steps={STEPS} currentStep={STEP_INDEX[status]} />
        </div>
      </div>
      {children}
    </div>
  );
}
