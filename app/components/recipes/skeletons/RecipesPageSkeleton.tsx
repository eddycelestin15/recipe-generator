import { RecipeGridSkeleton } from "./RecipeCardSkeleton";
import { Skeleton } from "../../ui/skeletons/Skeleton";

export function RecipesPageSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-10 w-80 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <Skeleton className="h-12 w-44 rounded-lg" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* View Options Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecipeGridSkeleton count={9} />
          </div>
        </div>
      </div>
    </main>
  );
}
