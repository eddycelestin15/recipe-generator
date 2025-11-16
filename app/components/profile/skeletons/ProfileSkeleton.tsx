import { Card, CardContent, CardHeader } from "../../ui/card";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { InputSkeleton, SelectSkeleton } from "../../ui/skeletons/InputSkeleton";
import { ButtonSkeleton } from "../../ui/skeletons/ButtonSkeleton";

export function ProfileFormCardSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <InputSkeleton />
        <div className="grid grid-cols-2 gap-4">
          <InputSkeleton />
          <SelectSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputSkeleton />
          <InputSkeleton />
        </div>
        <SelectSkeleton />
      </CardContent>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <InputSkeleton />
          <div className="grid grid-cols-2 gap-4">
            <InputSkeleton />
            <SelectSkeleton />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputSkeleton />
            <InputSkeleton />
          </div>
          <SelectSkeleton />
        </CardContent>
      </Card>

      {/* Health Goals Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectSkeleton />
          <div className="grid grid-cols-2 gap-4">
            <InputSkeleton />
            <InputSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* Diet Preferences Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <SelectSkeleton />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <ButtonSkeleton size="lg" fullWidth />
        <ButtonSkeleton size="lg" className="w-32" />
      </div>
    </div>
  );
}
