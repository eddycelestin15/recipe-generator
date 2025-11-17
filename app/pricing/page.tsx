'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, ArrowLeft, Zap } from 'lucide-react';
import PricingCard from '@/app/components/premium/PricingCard';
import { SubscriptionRepository } from '@/app/lib/repositories/subscription-repository';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PricingContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium'>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    const subscription = SubscriptionRepository.getOrCreate();
    setCurrentPlan(subscription.plan);
  }, []);

  const handleSelectPlan = async (billingInterval: 'month' | 'year') => {
    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingInterval,
          userId: localStorage.getItem('current_user_id') || 'default_user',
        }),
      });

      if (!response.ok) {
        throw new Error(t('pricing.errorCreateSession'));
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout using the URL
      if (!url) {
        throw new Error(t('pricing.errorNoUrl'));
      }

      window.location.href = url;
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || t('pricing.errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('pricing.back')}
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            {t('pricing.trialBadge')}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Canceled notice */}
        {canceled && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <X className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-900">
                <strong>{t('pricing.checkoutCanceled')}</strong> {t('pricing.checkoutCanceledMessage')}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900">
                <strong>{t('pricing.error')}:</strong> {error}
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <PricingCard
            plan="free"
            isCurrentPlan={currentPlan === 'free'}
            onSelect={() => router.push('/dashboard')}
          />
          <PricingCard
            plan="monthly"
            isCurrentPlan={currentPlan === 'premium'}
            onSelect={() => handleSelectPlan('month')}
          />
          <PricingCard
            plan="yearly"
            isCurrentPlan={currentPlan === 'premium'}
            onSelect={() => handleSelectPlan('year')}
          />
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">{t('pricing.featureComparison')}</h2>
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {t('pricing.feature')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    {t('pricing.free')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-600">
                    {t('pricing.premium')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: t('pricing.featureFridgeItems'), free: '50', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureAIRecipes'), free: '10', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureSavedRecipes'), free: '20', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureMealPlanning'), free: t('pricing.oneWeek'), premium: t('pricing.oneMonth') },
                  { feature: t('pricing.featureWorkoutHistory'), free: t('pricing.thirtyDays'), premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureAIChat'), free: '20', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featurePhotoAnalysis'), free: '5', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureCustomRoutines'), free: '1', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureSimultaneousHabits'), free: '3', premium: t('pricing.unlimited') },
                  { feature: t('pricing.featureMealPrep'), free: false, premium: true },
                  { feature: t('pricing.featureWearable'), free: false, premium: true },
                  { feature: t('pricing.featureDataExport'), free: false, premium: true },
                  { feature: t('pricing.featurePDFReports'), free: false, premium: true },
                  { feature: t('pricing.featureOfflineMode'), free: false, premium: true },
                  { feature: t('pricing.featurePrioritySupport'), free: false, premium: true },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-sm">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-emerald-600 font-semibold">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">{t('pricing.faqTitle')}</h2>
          <div className="space-y-6">
            {[
              {
                q: t('pricing.faqTrialQuestion'),
                a: t('pricing.faqTrialAnswer'),
              },
              {
                q: t('pricing.faqCancelQuestion'),
                a: t('pricing.faqCancelAnswer'),
              },
              {
                q: t('pricing.faqDowngradeQuestion'),
                a: t('pricing.faqDowngradeAnswer'),
              },
              {
                q: t('pricing.faqDifferenceQuestion'),
                a: t('pricing.faqDifferenceAnswer'),
              },
              {
                q: t('pricing.faqRefundQuestion'),
                a: t('pricing.faqRefundAnswer'),
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t('pricing.ctaTitle')}
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            {t('pricing.ctaSubtitle')}
          </p>
          <button
            onClick={() => handleSelectPlan('month')}
            disabled={isLoading}
            className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? t('pricing.loading') : t('pricing.ctaButton')}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('pricing.redirecting')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
