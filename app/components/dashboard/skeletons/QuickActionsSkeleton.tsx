import { Skeleton } from "../../ui/skeletons/Skeleton";

export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 animate-fade-in">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
