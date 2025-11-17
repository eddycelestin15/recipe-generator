'use client';

import { X, Crown, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  reason?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature, reason }: UpgradeModalProps) {
  const t = useTranslations();
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('premium.upgradeTitle')}</h2>
            <p className="text-sm text-gray-600">{t('premium.upgradeSubtitle')}</p>
          </div>
        </div>

        {/* Reason */}
        {reason && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-900">
              <strong>{t('premium.limitReached')}:</strong> {reason}
            </p>
          </div>
        )}

        {/* Premium benefits */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('premium.benefitsTitle')}
          </h3>
          <ul className="space-y-3">
            {[
              t('premium.benefit1'),
              t('premium.benefit2'),
              t('premium.benefit3'),
              t('premium.benefit4'),
              t('premium.benefit5'),
              t('premium.benefit6'),
              t('premium.benefit7'),
              t('premium.benefit8'),
              t('premium.benefit9'),
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trial notice */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-900">
            {t('premium.trialNotice')}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('premium.maybeLater')}
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            {t('premium.viewPlans')}
          </button>
        </div>
      </div>
    </div>
  );
}
