import { HTMLAttributes } from "react";

type Color = "teal" | "amber" | "neutral";

interface PillTagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color;
}

const colorClasses: Record<Color, string> = {
  teal:    "bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] text-[var(--color-primary)]",
  amber:   "bg-[color-mix(in_srgb,var(--color-amber)_15%,white)] text-[color-mix(in_srgb,var(--color-amber)_80%,black)]",
  neutral: "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]",
};

export default function PillTag({ color = "neutral", className = "", children, ...props }: PillTagProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-semibold font-heading tracking-wide",
        colorClasses[color],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
