import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>

      <SkeletonCard className="p-0">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-none first:rounded-t-[var(--radius-lg)] last:rounded-b-[var(--radius-lg)]" />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
