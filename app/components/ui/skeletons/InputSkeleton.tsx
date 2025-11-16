import { Skeleton } from "./Skeleton";

interface InputSkeletonProps {
  label?: boolean;
  className?: string;
}

export function InputSkeleton({ label = true, className }: InputSkeletonProps) {
  return (
    <div className={className}>
      {label && <Skeleton className="h-4 w-24 mb-2" />}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

export function TextareaSkeleton({ label = true, className }: InputSkeletonProps) {
  return (
    <div className={className}>
      {label && <Skeleton className="h-4 w-24 mb-2" />}
      <Skeleton className="h-24 w-full rounded-md" />
    </div>
  );
}

export function SelectSkeleton({ label = true, className }: InputSkeletonProps) {
  return (
    <div className={className}>
      {label && <Skeleton className="h-4 w-24 mb-2" />}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
