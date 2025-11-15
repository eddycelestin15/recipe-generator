'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, ArrowLeft, Zap } from 'lucide-react';
import PricingCard from '@/app/components/premium/PricingCard';
import { SubscriptionRepository } from '@/app/lib/repositories/subscription-repository';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PricingPage() {
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
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
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
          Back
        </button>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            7-Day Free Trial Available
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a free plan and upgrade anytime. All premium plans include a 7-day free trial.
          </p>
        </div>

        {/* Canceled notice */}
        {canceled && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <X className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-900">
                <strong>Checkout canceled.</strong> No worries! You can upgrade anytime.
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
                <strong>Error:</strong> {error}
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
          <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-600">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Fridge Items', free: '50', premium: 'Unlimited' },
                  { feature: 'AI-Generated Recipes/Month', free: '10', premium: 'Unlimited' },
                  { feature: 'Saved Recipes', free: '20', premium: 'Unlimited' },
                  { feature: 'Meal Planning', free: '1 week', premium: '1 month' },
                  { feature: 'Workout History', free: '30 days', premium: 'Unlimited' },
                  { feature: 'AI Chat Messages/Month', free: '20', premium: 'Unlimited' },
                  { feature: 'Photo Analysis/Month', free: '5', premium: 'Unlimited' },
                  { feature: 'Custom Routines', free: '1', premium: 'Unlimited' },
                  { feature: 'Simultaneous Habits', free: '3', premium: 'Unlimited' },
                  { feature: 'Meal Prep Planning', free: false, premium: true },
                  { feature: 'Wearable Integrations', free: false, premium: true },
                  { feature: 'Data Export', free: false, premium: true },
                  { feature: 'PDF Reports', free: false, premium: true },
                  { feature: 'Offline Mode', free: false, premium: true },
                  { feature: 'Priority Support', free: false, premium: true },
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
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'How does the free trial work?',
                a: 'You get 7 days of full Premium access at no cost. Your card will only be charged after the trial ends. Cancel anytime during the trial with no charge.',
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription at any time from your account settings. You\'ll retain access until the end of your current billing period.',
              },
              {
                q: 'What happens to my data if I downgrade?',
                a: 'Your data is never deleted. If you downgrade to Free, you\'ll have read-only access to content that exceeds free tier limits, but you won\'t be able to add more until you upgrade again.',
              },
              {
                q: 'Is there a difference between monthly and yearly premium?',
                a: 'Both plans give you access to all Premium features. The yearly plan saves you 25% compared to paying monthly.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact support for a full refund.',
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-emerald-50 mb-8">
            Join thousands of users achieving their health goals
          </p>
          <button
            onClick={() => handleSelectPlan('month')}
            disabled={isLoading}
            className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Start Your Free Trial'}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to checkout...</p>
          </div>
        </div>
      )}
    </div>
  );
}
