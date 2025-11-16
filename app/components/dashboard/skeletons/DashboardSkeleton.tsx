import { StatsCardGridSkeleton } from "./StatsCardSkeleton";
import { MacroCirclesGridSkeleton } from "./MacroCircleSkeleton";
import { QuickActionsSkeleton } from "./QuickActionsSkeleton";
import { Skeleton } from "../../ui/skeletons/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="bg-background min-h-full animate-fade-in">
      {/* Stories Carousel Skeleton */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Quick Actions */}
        <QuickActionsSkeleton />

        {/* Stats Overview */}
        <StatsCardGridSkeleton count={4} />

        {/* Macros Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <MacroCirclesGridSkeleton />
        </div>

        {/* Hydration Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>

        {/* Favorite Recipes */}
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
