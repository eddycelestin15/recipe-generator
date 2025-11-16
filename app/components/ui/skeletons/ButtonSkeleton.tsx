import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface ButtonSkeletonProps {
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export function ButtonSkeleton({
  size = "md",
  fullWidth = false,
  className
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <Skeleton
      className={cn(
        sizeClasses[size],
        fullWidth && "w-full",
        "rounded-md",
        className
      )}
    />
  );
}
