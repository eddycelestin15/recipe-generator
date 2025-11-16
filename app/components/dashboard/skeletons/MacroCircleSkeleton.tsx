import { SkeletonCircle, Skeleton } from "../../ui/skeletons/Skeleton";

export function MacroCircleSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-2 animate-fade-in">
      <SkeletonCircle className="w-24 h-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function MacroCirclesGridSkeleton() {
  return (
    <div className="flex justify-around gap-4 py-4">
      <MacroCircleSkeleton />
      <MacroCircleSkeleton />
      <MacroCircleSkeleton />
    </div>
  );
}
