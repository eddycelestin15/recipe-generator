'use client';

import type { NutritionProgress } from '@/app/lib/types/nutrition';

interface NutritionCircleProps {
  label: string;
  progress: NutritionProgress;
  unit: string;
  color: string;
}

export function NutritionCircle({ label, progress, unit, color }: NutritionCircleProps) {
  const percentage = Math.min(progress.percentage, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = () => {
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    if (percentage < 100) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="transform -rotate-90 w-40 h-40">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={getColorClass()}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(progress.consumed)}</span>
          <span className="text-xs text-gray-500">/ {Math.round(progress.goal)}</span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-500">
          Restant: {Math.round(progress.remaining)} {unit}
        </p>
      </div>
    </div>
  );
}
