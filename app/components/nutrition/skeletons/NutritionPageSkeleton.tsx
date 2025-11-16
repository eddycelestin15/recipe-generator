import { Skeleton } from "../../ui/skeletons/Skeleton";
import { CircleSkeleton } from "../../ui/skeletons/CircleSkeleton";
import { Card, CardContent, CardHeader } from "../../ui/card";

export function NutritionPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-card rounded-lg shadow p-4">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>

        {/* Nutrition Circles */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <CircleSkeleton size="md" />
              <CircleSkeleton size="md" />
              <CircleSkeleton size="md" />
              <CircleSkeleton size="md" />
            </div>
          </CardContent>
        </Card>

        {/* Meal Timeline */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Add Button */}
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}
