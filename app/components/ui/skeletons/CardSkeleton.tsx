import { Skeleton, SkeletonText } from "./Skeleton";
import { Card, CardContent, CardHeader } from "../card";

interface CardSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
  className?: string;
}

export function CardSkeleton({
  showHeader = true,
  showFooter = false,
  contentLines = 3,
  className
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
      )}
      <CardContent>
        <SkeletonText lines={contentLines} />
      </CardContent>
      {showFooter && (
        <div className="p-6 pt-0">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
    </Card>
  );
}
