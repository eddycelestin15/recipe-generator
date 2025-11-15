/**
 * useSubscription Hook
 *
 * React hook for accessing subscription status and usage limits
 */

'use client';

import { useState, useEffect } from 'react';
import { SubscriptionRepository } from '../repositories/subscription-repository';
import { SubscriptionService } from '../services/subscription-service';
import type { Subscription } from '../types/subscription';

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isInTrial, setIsInTrial] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscription = () => {
    try {
      const sub = SubscriptionRepository.getOrCreate();
      const premium = SubscriptionRepository.isPremium();
      const trial = SubscriptionRepository.isInTrial();
      const daysLeft = SubscriptionRepository.getTrialDaysRemaining();

      setSubscription(sub);
      setIsPremium(premium);
      setIsInTrial(trial);
      setTrialDaysRemaining(daysLeft);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  return {
    subscription,
    isPremium,
    isInTrial,
    trialDaysRemaining,
    isLoading,
    refresh: loadSubscription,
  };
}

export function useUsageLimits() {
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsage = () => {
    try {
      const summary = SubscriptionService.getUsageSummary();
      setUsageSummary(summary);
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  return {
    usageSummary,
    isLoading,
    refresh: loadUsage,
  };
}

export function useFeatureAccess() {
  const { isPremium } = useSubscription();

  const checkFeature = (featureName: string) => {
    switch (featureName) {
      case 'recipeGeneration':
        return SubscriptionService.checkRecipeGeneration();
      case 'saveRecipe':
        return SubscriptionService.checkSaveRecipe();
      case 'addFridgeItem':
        return SubscriptionService.checkAddFridgeItem();
      case 'aiChat':
        return SubscriptionService.checkAIChatMessage();
      case 'photoAnalysis':
        return SubscriptionService.checkPhotoAnalysis();
      case 'createHabit':
        return SubscriptionService.checkCreateHabit();
      case 'createRoutine':
        return SubscriptionService.checkCreateRoutine();
      default:
        return { allowed: isPremium };
    }
  };

  return {
    checkFeature,
    isPremium,
  };
}
