'use client';

interface UsageBarProps {
  current: number;
  limit: number;
  label: string;
  unit?: string;
}

export default function UsageBar({ current, limit, label, unit = '' }: UsageBarProps) {
  const isUnlimited = limit === Infinity;
  const percentage = isUnlimited ? 0 : Math.min(100, (current / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      {/* Label and count */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`font-semibold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-600'}`}>
          {isUnlimited ? (
            <span className="text-emerald-600">Unlimited</span>
          ) : (
            `${current} / ${limit}${unit}`
          )}
        </span>
      </div>

      {/* Progress bar */}
      {!isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                ? 'bg-orange-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Warning message */}
      {isAtLimit && (
        <p className="text-xs text-red-600">
          You&apos;ve reached your limit. Upgrade to Premium for unlimited access.
        </p>
      )}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-orange-600">
          You&apos;re approaching your limit. Consider upgrading to Premium.
        </p>
      )}
    </div>
  );
}
