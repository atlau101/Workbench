import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "motivational";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:     "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)]",
  secondary:   "bg-white text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]",
  ghost:       "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)]",
  motivational:"bg-[var(--color-amber)] text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-base font-semibold",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => (
    <button
      ref={ref}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

export default Button;
