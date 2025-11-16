import { SkeletonCircle, Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface CircleSkeletonProps {
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  className?: string;
}

export function CircleSkeleton({
  size = "md",
  showLabel = true,
  className
}: CircleSkeletonProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <SkeletonCircle className={sizeClasses[size]} />
      {showLabel && (
        <>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </>
      )}
    </div>
  );
}

export function MacroCircleSkeleton() {
  return (
    <div className="flex justify-around gap-4">
      <CircleSkeleton size="lg" />
      <CircleSkeleton size="lg" />
      <CircleSkeleton size="lg" />
    </div>
  );
}
