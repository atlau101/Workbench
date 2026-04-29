import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-3xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard className="min-h-[360px]" />
        </div>
        <SkeletonCard className="min-h-[640px]" />
      </div>
    </div>
  );
}
