'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Crown,
  Calendar,
  CreditCard,
  ExternalLink,
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import PremiumBadge from '@/app/components/premium/PremiumBadge';
import UsageBar from '@/app/components/premium/UsageBar';
import { SubscriptionRepository } from '@/app/lib/repositories/subscription-repository';
import { SubscriptionService } from '@/app/lib/services/subscription-service';
import type { Subscription } from '@/app/lib/types/subscription';

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const success = searchParams.get('success') === 'true';

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = () => {
    const sub = SubscriptionRepository.getOrCreate();
    const summary = SubscriptionService.getUsageSummary();
    setSubscription(sub);
    setUsageSummary(summary);
  };

  const handleManageSubscription = async () => {
    if (!subscription?.stripeCustomerId) {
      alert('No active subscription to manage');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripeCustomerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to open subscription portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  if (!subscription || !usageSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const isPremium = usageSummary.subscription.isPremium;
  const isInTrial = usageSummary.subscription.isInTrial;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription</h1>
        <p className="text-gray-600 mb-8">Manage your subscription and view usage</p>

        {/* Success message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-900">
                <strong>Success!</strong> Your subscription has been activated. Welcome to Premium!
              </p>
            </div>
          </div>
        )}

        {/* Trial notice */}
        {isInTrial && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">
                <strong>Free trial active!</strong> You have{' '}
                {usageSummary.subscription.trialDaysRemaining} days remaining. Your card will be
                charged after the trial ends.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
                  {isPremium && <PremiumBadge />}
                </div>
                <p className="text-gray-600">
                  {isPremium ? 'Premium' : 'Free'} Plan
                </p>
              </div>
              {isPremium && (
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            {/* Plan details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {subscription.status}
                </span>
              </div>

              {isPremium && (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Renews on:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-900">
                        Your subscription will be canceled at the end of the current period.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {isPremium ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      Manage Subscription
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleUpgrade}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {usageSummary.usage.recipesGenerated.current}
                </p>
                <p className="text-sm text-gray-600">Recipes this month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {usageSummary.usage.savedRecipes.current}
                </p>
                <p className="text-sm text-gray-600">Saved recipes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {usageSummary.usage.fridgeItems.current}
                </p>
                <p className="text-sm text-gray-600">Fridge items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Section - Only for Free plan */}
        {!isPremium && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Limits</h2>
            <div className="space-y-6">
              <UsageBar
                current={usageSummary.usage.recipesGenerated.current}
                limit={usageSummary.usage.recipesGenerated.limit}
                label="AI-Generated Recipes (Monthly)"
              />
              <UsageBar
                current={usageSummary.usage.savedRecipes.current}
                limit={usageSummary.usage.savedRecipes.limit}
                label="Saved Recipes"
              />
              <UsageBar
                current={usageSummary.usage.fridgeItems.current}
                limit={usageSummary.usage.fridgeItems.limit}
                label="Fridge Items"
              />
              <UsageBar
                current={usageSummary.usage.aiChatMessages.current}
                limit={usageSummary.usage.aiChatMessages.limit}
                label="AI Chat Messages (Monthly)"
              />
              <UsageBar
                current={usageSummary.usage.photoAnalyses.current}
                limit={usageSummary.usage.photoAnalyses.limit}
                label="Photo Analyses (Monthly)"
              />
              <UsageBar
                current={usageSummary.usage.habits.current}
                limit={usageSummary.usage.habits.limit}
                label="Simultaneous Habits"
              />
              <UsageBar
                current={usageSummary.usage.routines.current}
                limit={usageSummary.usage.routines.limit}
                label="Custom Routines"
              />
            </div>

            {/* Upgrade CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-2">
                Unlock Unlimited Access
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to Premium for unlimited recipes, AI chat, photo analysis, and more!
              </p>
              <button
                onClick={handleUpgrade}
                className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30"
              >
                View Premium Plans
              </button>
            </div>
          </div>
        )}

        {/* Premium Features - Only for Premium users */}
        {isPremium && (
          <div className="mt-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Your Premium Benefits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Unlimited AI-generated recipes',
                'Unlimited fridge items',
                'Unlimited saved recipes',
                'Unlimited AI chat & photo analysis',
                'Advanced meal prep planning',
                'Wearable integrations',
                'Data export & PDF reports',
                'Priority support',
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
