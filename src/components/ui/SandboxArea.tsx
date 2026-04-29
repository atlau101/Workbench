import { HTMLAttributes, forwardRef } from "react";

const SandboxArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "bg-white rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)]",
        "focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_2px_var(--color-primary)]",
        "transition-shadow",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);
SandboxArea.displayName = "SandboxArea";

export default SandboxArea;
