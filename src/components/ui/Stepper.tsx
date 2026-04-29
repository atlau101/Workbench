"use client";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol role="list" className="flex w-full items-center gap-0">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <li
            key={label}
            role="listitem"
            aria-current={active ? "step" : undefined}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  done
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : active
                    ? "bg-white border-2 border-[var(--color-amber)] text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-[var(--font-heading)] tracking-wide ${active ? "text-[var(--color-on-surface)]" : "text-[var(--color-on-surface-variant)]"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${done ? "bg-[var(--color-primary)]" : "bg-[var(--color-outline-variant)]"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
