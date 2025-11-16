'use client';

import { Check } from 'lucide-react';
import { PRICING } from '@/app/lib/types/subscription';

interface PricingCardProps {
  plan: 'free' | 'monthly' | 'yearly';
  isCurrentPlan?: boolean;
  onSelect?: () => void;
}

interface PlanDetail {
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  limitations: boolean;
  popular?: boolean;
  bestValue?: boolean;
  badge?: string;
}

const planDetails: Record<'free' | 'monthly' | 'yearly', PlanDetail> = {
  free: {
    name: 'Free',
    price: '€0',
    interval: '',
    description: 'Perfect for getting started',
    features: [
      'Up to 50 fridge items',
      '10 AI-generated recipes per month',
      'Meal plans (1 week)',
      'Save up to 20 recipes',
      'Workout history (30 days)',
      '20 AI chat messages/month',
      '5 photo analyses/month',
      '1 custom routine',
      '3 simultaneous habits',
    ],
    limitations: true,
  },
  monthly: {
    name: 'Premium',
    price: `€${PRICING.monthly.amount}`,
    interval: '/month',
    description: 'Full access to all features',
    features: [
      'Unlimited fridge items',
      'Unlimited AI-generated recipes',
      'Meal plans (1 month ahead)',
      'Unlimited saved recipes',
      'Complete workout history',
      'Unlimited AI chat',
      'Unlimited photo analysis',
      'Unlimited routines',
      'Unlimited habits',
      'Meal prep planning',
      'Wearable integrations',
      'Export data (CSV/JSON)',
      'Monthly PDF reports',
      'Offline mode',
      'Priority support',
      'Early access to new features',
    ],
    limitations: false,
    popular: true,
  },
  yearly: {
    name: 'Premium Yearly',
    price: `€${PRICING.yearly.amount}`,
    interval: '/year',
    description: 'Best value - save 25%!',
    badge: `-${PRICING.yearly.discount}%`,
    features: [
      'Unlimited fridge items',
      'Unlimited AI-generated recipes',
      'Meal plans (1 month ahead)',
      'Unlimited saved recipes',
      'Complete workout history',
      'Unlimited AI chat',
      'Unlimited photo analysis',
      'Unlimited routines',
      'Unlimited habits',
      'Meal prep planning',
      'Wearable integrations',
      'Export data (CSV/JSON)',
      'Monthly PDF reports',
      'Offline mode',
      'Priority support',
      'Early access to new features',
    ],
    limitations: false,
    bestValue: true,
  },
};

export default function PricingCard({ plan, isCurrentPlan, onSelect }: PricingCardProps) {
  const details = planDetails[plan];

  return (
    <div
      className={`relative rounded-2xl p-8 border-2 transition-all ${
        details.popular || details.bestValue
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
          : 'border-gray-200'
      } ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'}`}
    >
      {/* Badge */}
      {details.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      {details.bestValue && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
          Best Value
        </div>
      )}
      {details.badge && (
        <div className="absolute -top-4 right-8 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {details.badge}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{details.name}</h3>
        <p className="text-gray-600 text-sm">{details.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-gray-900">{details.price}</span>
          {details.interval && (
            <span className="text-gray-600 ml-2">{details.interval}</span>
          )}
        </div>
        {plan === 'yearly' && (
          <p className="text-sm text-gray-500 mt-1">
            €{(PRICING.yearly.amount / 12).toFixed(2)}/month billed annually
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        disabled={isCurrentPlan}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors mb-6 ${
          isCurrentPlan
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : details.popular || details.bestValue
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : plan === 'free' ? 'Get Started' : 'Start 7-Day Trial'}
      </button>

      {/* Features */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">
          {plan === 'free' ? 'What\'s included:' : 'Everything in Free, plus:'}
        </p>
        {details.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      {/* Trial notice for premium plans */}
      {plan !== 'free' && !isCurrentPlan && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>7-day free trial</strong> - Cancel anytime during trial, no charge.
          </p>
        </div>
      )}
    </div>
  );
}
