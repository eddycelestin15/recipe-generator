import { Skeleton } from "./Skeleton";
import { Card, CardContent, CardHeader } from "../card";

interface ChartSkeletonProps {
  showHeader?: boolean;
  type?: "line" | "bar" | "pie";
  className?: string;
}

export function ChartSkeleton({
  showHeader = true,
  type = "line",
  className
}: ChartSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full h-64 flex items-end justify-around gap-2">
          {type === "bar" && (
            <>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full"
                  style={{ height: `${Math.random() * 60 + 40}%` }}
                />
              ))}
            </>
          )}
          {type === "line" && (
            <div className="w-full h-full relative">
              <Skeleton className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-1 w-[90%]" />
              </div>
            </div>
          )}
          {type === "pie" && (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
