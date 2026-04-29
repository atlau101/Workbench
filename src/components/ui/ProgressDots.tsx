interface ProgressDotsProps {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "rounded-full transition-all",
            i < current
              ? "w-2 h-2 bg-[var(--color-primary)]"
              : i === current
              ? "w-3 h-3 bg-white border-2 border-[var(--color-amber)]"
              : "w-2 h-2 bg-[var(--color-surface-container-high)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
