import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-16 w-full rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard className="min-h-[420px]" />
        <SkeletonCard className="min-h-[420px]" />
      </div>
    </div>
  );
}
