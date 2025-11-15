# Premium Features Implementation Guide

This document describes the freemium model implementation and how to integrate feature gating in your app.

## Subscription Model

### Free Tier Limits
```typescript
{
  fridgeItems: 50,
  recipesPerMonth: 10,
  savedRecipes: 20,
  workoutHistoryDays: 30,
  aiChatMessagesPerMonth: 20,
  photoAnalysisPerMonth: 5,
  customRoutines: 1,
  simultaneousHabits: 3,
  mealPlanDays: 7,
}
```

### Premium Tier
- **Everything unlimited**
- Exclusive features (meal prep, wearables, exports, reports, etc.)

## Usage in Components

### Check Subscription Status

```typescript
import { useSubscription } from '@/app/lib/hooks/useSubscription';

function MyComponent() {
  const { isPremium, isInTrial, trialDaysRemaining } = useSubscription();

  return (
    <div>
      {isPremium ? (
        <p>Premium User</p>
      ) : (
        <button onClick={() => router.push('/pricing')}>
          Upgrade to Premium
        </button>
      )}
    </div>
  );
}
```

### Check Feature Access

```typescript
import { useFeatureAccess } from '@/app/lib/hooks/useSubscription';
import UpgradeModal from '@/app/components/premium/UpgradeModal';

function RecipeGenerator() {
  const { checkFeature } = useFeatureAccess();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGenerateRecipe = () => {
    const access = checkFeature('recipeGeneration');

    if (!access.allowed) {
      setShowUpgradeModal(true);
      return;
    }

    // Generate recipe...
    SubscriptionService.trackRecipeGeneration();
  };

  return (
    <>
      <button onClick={handleGenerateRecipe}>Generate Recipe</button>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={access.reason}
      />
    </>
  );
}
```

### Display Usage Limits

```typescript
import { useUsageLimits } from '@/app/lib/hooks/useSubscription';
import UsageBar from '@/app/components/premium/UsageBar';

function UsageDisplay() {
  const { usageSummary } = useUsageLimits();

  if (!usageSummary) return null;

  return (
    <div>
      <UsageBar
        current={usageSummary.usage.recipesGenerated.current}
        limit={usageSummary.usage.recipesGenerated.limit}
        label="AI-Generated Recipes (Monthly)"
      />
    </div>
  );
}
```

### Add Premium Badge

```typescript
import PremiumBadge, { PremiumFeatureBadge } from '@/app/components/premium/PremiumBadge';

function FeatureCard() {
  return (
    <div>
      <h3>Meal Prep Planning <PremiumFeatureBadge /></h3>
      <p>Only available for Premium users</p>
    </div>
  );
}
```

## Feature Gating Checklist

When adding feature gating to an existing feature:

1. **Import the service**
   ```typescript
   import { SubscriptionService } from '@/app/lib/services/subscription-service';
   ```

2. **Check access before action**
   ```typescript
   const access = SubscriptionService.checkRecipeGeneration();
   if (!access.allowed) {
     // Show upgrade modal
     return;
   }
   ```

3. **Track usage after action**
   ```typescript
   SubscriptionService.trackRecipeGeneration();
   ```

4. **Update usage on delete** (for absolute counters)
   ```typescript
   SubscriptionService.trackRecipeDelete();
   ```

## Feature Methods

| Feature | Check Method | Track Method (Add) | Track Method (Delete) |
|---------|--------------|-------------------|----------------------|
| Recipe Generation | `checkRecipeGeneration()` | `trackRecipeGeneration()` | - |
| Save Recipe | `checkSaveRecipe()` | `trackRecipeSave()` | `trackRecipeDelete()` |
| Fridge Item | `checkAddFridgeItem()` | `trackFridgeItemAdd()` | `trackFridgeItemDelete()` |
| AI Chat | `checkAIChatMessage()` | `trackAIChatMessage()` | - |
| Photo Analysis | `checkPhotoAnalysis()` | `trackPhotoAnalysis()` | - |
| Habit | `checkCreateHabit()` | `trackHabitCreate()` | `trackHabitDelete()` |
| Routine | `checkCreateRoutine()` | `trackRoutineCreate()` | `trackRoutineDelete()` |
| Premium Feature | `checkPremiumFeature(name)` | - | - |

## Premium-Only Features

For features that are exclusive to Premium:

```typescript
import { SubscriptionService } from '@/app/lib/services/subscription-service';

const access = SubscriptionService.checkPremiumFeature('mealPrepPlanning');

if (!access.allowed) {
  // Show upgrade modal
}
```

Available premium features:
- `mealPrepPlanning`
- `wearableIntegrations`
- `dataExport`
- `pdfReports`
- `offlineMode`
- `prioritySupport`
- `earlyAccess`
- `exclusiveRecipes`

## Example: Complete Integration

```typescript
'use client';

import { useState } from 'react';
import { useFeatureAccess } from '@/app/lib/hooks/useSubscription';
import { SubscriptionService } from '@/app/lib/services/subscription-service';
import UpgradeModal from '@/app/components/premium/UpgradeModal';

export default function RecipeForm() {
  const { checkFeature, isPremium } = useFeatureAccess();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const handleSubmit = async () => {
    // Check access
    const access = checkFeature('recipeGeneration');

    if (!access.allowed) {
      setUpgradeReason(access.reason || 'Upgrade required');
      setShowUpgrade(true);
      return;
    }

    // Generate recipe
    const recipe = await generateRecipe();

    // Track usage
    SubscriptionService.trackRecipeGeneration();

    // Check if user can save
    const saveAccess = checkFeature('saveRecipe');
    if (saveAccess.allowed) {
      await saveRecipe(recipe);
      SubscriptionService.trackRecipeSave();
    } else {
      // Show "save" is a premium feature
      console.log(saveAccess.reason);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <button type="submit">
          Generate Recipe {!isPremium && '(Free)'}
        </button>
      </form>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
      />
    </>
  );
}
```

## Testing

### Test Free Tier Limits

1. Open browser DevTools > Application > Local Storage
2. Find keys: `usage_limits_default_user`
3. Manually edit values to test limits:
   ```json
   {
     "recipesGeneratedThisMonth": 9,  // Set to 9, next generation will hit limit
     ...
   }
   ```
4. Trigger the feature to see upgrade modal

### Test Premium Access

1. Open DevTools > Application > Local Storage
2. Find key: `subscription_default_user`
3. Edit to make user premium:
   ```json
   {
     "plan": "premium",
     "status": "active",
     ...
   }
   ```
4. Refresh page - should see unlimited access

## Monthly Reset

Usage limits reset automatically on the 1st of each month. The reset happens in `UsageLimitsRepository.getOrCreate()`.

## Future Enhancements

- [ ] Email notifications for limit warnings (80% reached)
- [ ] Email trial expiration reminders
- [ ] Add coupon code support
- [ ] Implement referral program
- [ ] Add team/family plans
- [ ] Usage analytics dashboard
