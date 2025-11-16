import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "wave";
}

export function Skeleton({
  className,
  variant = "shimmer",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        variant === "shimmer" && "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        variant === "wave" && "animate-wave",
        variant === "default" && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCircle({
  className,
  variant = "shimmer",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-muted",
        variant === "shimmer" && "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        variant === "wave" && "animate-wave",
        variant === "default" && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({
  className,
  lines = 1,
  variant = "shimmer",
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-4/5" : "w-full",
            className
          )}
          variant={variant}
        />
      ))}
    </div>
  );
}
