import { Skeleton, SkeletonCircle } from "../../ui/skeletons/Skeleton";

export function RecipeCardSkeleton() {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in">
      {/* Header - Instagram style */}
      <div className="flex items-center gap-3 p-3 pb-2">
        {/* Avatar */}
        <SkeletonCircle className="w-10 h-10 flex-shrink-0" />

        {/* Username and time */}
        <div className="flex-1 min-w-0 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* More options */}
        <SkeletonCircle className="w-5 h-5" />
      </div>

      {/* Image - Square aspect ratio */}
      <div className="relative w-full aspect-square">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Difficulty badge overlay */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          {/* Left actions */}
          <div className="flex items-center gap-4">
            <SkeletonCircle className="w-7 h-7" />
            <SkeletonCircle className="w-7 h-7" />
            <SkeletonCircle className="w-7 h-7" />
          </div>

          {/* Right action */}
          <SkeletonCircle className="w-7 h-7" />
        </div>

        {/* Nutrition Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-5 w-3/4 mb-2" />

        {/* Description */}
        <div className="space-y-2 mb-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-18" />
        </div>
      </div>
    </article>
  );
}

export function RecipeGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </>
  );
}
