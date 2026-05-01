import { HTMLAttributes, forwardRef } from "react";

const GuideArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "bg-[color-mix(in_srgb,var(--color-primary)_6%,white)] rounded-[var(--radius-lg)]",
        "border border-dashed border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]",
        "relative",
        className,
      ].join(" ")}
      {...props}
    >
      <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-widest uppercase text-[var(--color-primary)] font-heading">
        AI
      </span>
      {children}
    </div>
  )
);
GuideArea.displayName = "GuideArea";

export default GuideArea;
