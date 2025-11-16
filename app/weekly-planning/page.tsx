'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  ShoppingCart,
  Sparkles,
  Loader2,
  Trash2,
  Save,
  Copy
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';

interface Recipe {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealSlot {
  recipeId: string | null;
  recipe?: Recipe;
}

interface DayPlan {
  breakfast: MealSlot;
  lunch: MealSlot;
  dinner: MealSlot;
  snack: MealSlot;
}

interface WeekPlan {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

const emptySlot: MealSlot = { recipeId: null };
const emptyDay: DayPlan = {
  breakfast: emptySlot,
  lunch: emptySlot,
  dinner: emptySlot,
  snack: emptySlot,
};

export default function WeeklyPlanningPage() {
  const t = useTranslations('mealPlanning');
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({
    monday: emptyDay,
    tuesday: emptyDay,
    wednesday: emptyDay,
    thursday: emptyDay,
    friday: emptyDay,
    saturday: emptyDay,
    sunday: emptyDay,
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingShoppingList, setIsGeneratingShoppingList] = useState(false);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ] as const;

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  useEffect(() => {
    loadRecipes();
    loadWeekPlan();
  }, []);

  const loadRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const loadWeekPlan = async () => {
    try {
      const response = await fetch('/api/meal-planning/week');
      if (response.ok) {
        const data = await response.json();
        if (data.plan) {
          setWeekPlan(data.plan);
        }
      }
    } catch (error) {
      console.error('Error loading week plan:', error);
    }
  };

  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch('/api/meal-planning/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const data = await response.json();
      setWeekPlan(data.plan);
      toast.success(t('planGenerated'));
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate meal plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    setIsGeneratingShoppingList(true);
    try {
      const response = await fetch('/api/meal-planning/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekPlan }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate shopping list');
      }

      const data = await response.json();
      setShoppingList(data.items);
      setShowShoppingList(true);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      toast.error('Failed to generate shopping list');
    } finally {
      setIsGeneratingShoppingList(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      const response = await fetch('/api/meal-planning/week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: weekPlan }),
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      toast.success(t('planSaved'));
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save meal plan');
    }
  };

  const addRecipeToSlot = (day: keyof WeekPlan, mealType: keyof DayPlan, recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: {
          recipeId,
          recipe,
        },
      },
    }));
  };

  const removeRecipeFromSlot = (day: keyof WeekPlan, mealType: keyof DayPlan) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: emptySlot,
      },
    }));
  };

  const calculateWeeklyNutrition = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    days.forEach((day) => {
      mealTypes.forEach((mealType) => {
        const slot = weekPlan[day][mealType];
        if (slot.recipe) {
          totalCalories += slot.recipe.calories || 0;
          totalProtein += slot.recipe.protein || 0;
          totalCarbs += slot.recipe.carbs || 0;
          totalFat += slot.recipe.fat || 0;
        }
      });
    });

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      avgCaloriesPerDay: Math.round(totalCalories / 7),
      avgProteinPerDay: Math.round(totalProtein / 7),
    };
  };

  const weeklyNutrition = calculateWeeklyNutrition();

  if (showShoppingList) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">{t('shoppingList')}</h1>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowShoppingList(false)}
              >
                {t('back')}
              </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6">
              {shoppingList.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <input type="checkbox" className="w-5 h-5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(shoppingList.join('\n'));
                toast.success('Shopping list copied to clipboard!');
              }}
              className="w-full gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy List
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('weeklyPlan')}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleGenerateAIPlan}
                disabled={isGeneratingPlan}
                className="gap-2"
              >
                {isGeneratingPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {t('generateAIPlan')}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateShoppingList}
                disabled={isGeneratingShoppingList}
                className="gap-2"
              >
                {isGeneratingShoppingList ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {t('generateShoppingList')}
              </Button>
              <Button onClick={handleSavePlan} className="gap-2">
                <Save className="w-4 h-4" />
                {t('save')}
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Nutrition Summary */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <h3 className="font-semibold mb-3">{t('weeklyNutrition')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('totalCalories')}</p>
              <p className="text-2xl font-bold text-primary">{weeklyNutrition.totalCalories}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('avgPerDay')}: {weeklyNutrition.avgCaloriesPerDay}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Protein</p>
              <p className="text-2xl font-bold text-emerald-600">{weeklyNutrition.totalProtein}g</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('avgPerDay')}: {weeklyNutrition.avgProteinPerDay}g
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Carbs</p>
              <p className="text-2xl font-bold text-blue-600">{weeklyNutrition.totalCarbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Fat</p>
              <p className="text-2xl font-bold text-orange-600">{weeklyNutrition.totalFat}g</p>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-max md:min-w-0">
            {days.map((day) => (
              <Card key={day} className="p-4">
                <h3 className="font-bold text-lg mb-3 capitalize text-center border-b pb-2">
                  {t(day)}
                </h3>
                <div className="space-y-3">
                  {mealTypes.map((mealType) => {
                    const slot = weekPlan[day][mealType];
                    return (
                      <div
                        key={mealType}
                        className="p-3 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:border-primary/50 transition-all duration-200"
                      >
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                          {t(mealType)}
                        </p>
                        {slot.recipe ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium line-clamp-2">
                              {slot.recipe.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {slot.recipe.calories} cal • {slot.recipe.protein}g protein
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeRecipeFromSlot(day, mealType)}
                              className="h-7 w-full text-xs gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground mb-2">
                              {t('dragRecipeHere')}
                            </p>
                            <select
                              onChange={(e) =>
                                e.target.value && addRecipeToSlot(day, mealType, e.target.value)
                              }
                              className="w-full text-xs p-2 border rounded bg-background"
                              value=""
                            >
                              <option value="">Select recipe...</option>
                              {recipes.map((recipe) => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
