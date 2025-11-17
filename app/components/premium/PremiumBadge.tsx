'use client';

import { Crown, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PremiumBadgeProps {
  variant?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

export default function PremiumBadge({
  variant = 'medium',
  showIcon = true,
  className = '',
}: PremiumBadgeProps) {
  const t = useTranslations();
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-full ${sizes[variant]} ${className}`}
    >
      {showIcon && <Crown className={iconSizes[variant]} />}
      {t('premium.badge')}
    </span>
  );
}

export function PremiumFeatureBadge({ className = '' }: { className?: string }) {
  const t = useTranslations();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md ${className}`}
    >
      <Sparkles className="w-3 h-3" />
      {t('premium.featureBadge')}
    </span>
  );
}
