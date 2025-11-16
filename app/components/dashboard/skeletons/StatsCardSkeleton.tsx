import { Skeleton, SkeletonCircle } from "../../ui/skeletons/Skeleton";

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-28" />
        </div>
        <SkeletonCircle className="w-12 h-12" />
      </div>
    </div>
  );
}

export function StatsCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
