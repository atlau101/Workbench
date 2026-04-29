import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={[
        "animate-pulse rounded-[var(--radius)] bg-[var(--color-surface-container)]/80",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function SkeletonCard({ className = "", children, ...props }: SkeletonProps) {
  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6",
        className,
      ].join(" ")}
      {...props}
    >
      {children ? (
        children
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-24 w-full rounded-[var(--radius-lg)]" />
        </div>
      )}
    </div>
  );
}
