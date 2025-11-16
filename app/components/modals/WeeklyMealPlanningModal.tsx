'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  X,
  Calendar,
  ShoppingCart,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortableStrategy,
} from '@dnd-kit/sortable';

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

interface WeeklyMealPlanningModalProps {
  open: boolean;
  onClose: () => void;
}

const emptySlot: MealSlot = { recipeId: null };
const emptyDay: DayPlan = {
  breakfast: emptySlot,
  lunch: emptySlot,
  dinner: emptySlot,
  snack: emptySlot,
};

export default function WeeklyMealPlanningModal({
  open,
  onClose,
}: WeeklyMealPlanningModalProps) {
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    if (open) {
      loadRecipes();
      loadWeekPlan();
    }
  }, [open]);

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
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t('shoppingList')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {shoppingList.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowShoppingList(false)} className="flex-1">
              {t('back')}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shoppingList.join('\n'));
                toast.success('Copied to clipboard!');
              }}
              className="flex-1"
            >
              Copy List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <DialogTitle className="text-xl font-bold">{t('title')}</DialogTitle>
                <p className="text-sm text-muted-foreground">{t('weeklyPlan')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                {t('save')}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Weekly Nutrition Summary */}
        <div className="px-6 py-3 bg-muted/50 border-b border-border">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">{t('totalCalories')}</p>
              <p className="text-lg font-bold">{weeklyNutrition.totalCalories}</p>
              <p className="text-xs text-muted-foreground">
                {t('avgPerDay')}: {weeklyNutrition.avgCaloriesPerDay}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Protein</p>
              <p className="text-lg font-bold">{weeklyNutrition.totalProtein}g</p>
              <p className="text-xs text-muted-foreground">
                {t('avgPerDay')}: {weeklyNutrition.avgProteinPerDay}g
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Carbs</p>
              <p className="text-lg font-bold">{weeklyNutrition.totalCarbs}g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fat</p>
              <p className="text-lg font-bold">{weeklyNutrition.totalFat}g</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="grid grid-cols-7 gap-3 min-w-max">
            {days.map((day) => (
              <div key={day} className="min-w-[180px]">
                <h3 className="font-semibold mb-2 capitalize">{t(day)}</h3>
                <div className="space-y-2">
                  {mealTypes.map((mealType) => {
                    const slot = weekPlan[day][mealType];
                    return (
                      <div
                        key={mealType}
                        className="p-3 border-2 border-dashed border-border rounded-lg bg-card hover:border-primary transition-colors"
                      >
                        <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">
                          {t(mealType)}
                        </p>
                        {slot.recipe ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium line-clamp-2">
                              {slot.recipe.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {slot.recipe.calories} cal
                            </p>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeRecipeFromSlot(day, mealType)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              {t('dragRecipeHere')}
                            </p>
                            <select
                              onChange={(e) =>
                                e.target.value && addRecipeToSlot(day, mealType, e.target.value)
                              }
                              className="w-full text-xs p-1 border rounded"
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
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
