import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "rounded-[var(--radius-lg)] bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] transition-shadow duration-200",
        elevated ? "shadow-[0_4px_24px_0_color-mix(in_srgb,var(--color-primary)_14%,transparent)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export default Card;
