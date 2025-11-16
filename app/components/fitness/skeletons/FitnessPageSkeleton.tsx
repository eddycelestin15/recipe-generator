import { Skeleton } from "../../ui/skeletons/Skeleton";
import { StatsCardGridSkeleton } from "../../dashboard/skeletons/StatsCardSkeleton";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { ChartSkeleton } from "../../ui/skeletons/ChartSkeleton";

export function FitnessPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>

        {/* Stats Cards */}
        <StatsCardGridSkeleton count={4} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <ChartSkeleton type="bar" />
      </div>
    </div>
  );
}
