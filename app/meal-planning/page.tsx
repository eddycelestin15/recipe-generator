'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import WeeklyCalendar from '../components/meal-planning/WeeklyCalendar';
import GenerateMealPlan from '../components/meal-planning/GenerateMealPlan';
import RecipeSelector from '../components/meal-planning/RecipeSelector';
import ShoppingListView from '../components/meal-planning/ShoppingListView';
import type {
  MealPlan,
  DayMealPlan,
  MealSlot,
  MealPlanGenerationCriteria,
  ShoppingList,
} from '@/app/lib/types/meal-plan';
import type { MealType } from '@/app/lib/types/nutrition';
import type { Recipe } from '@/app/lib/types/recipe';
import { getWeekStart } from '@/app/lib/types/meal-plan';
import { MealPlanRepository } from '@/app/lib/repositories/meal-plan-repository';
import { ShoppingListRepository } from '@/app/lib/repositories/shopping-list-repository';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';

export default function MealPlanningPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCalorieTarget, setUserCalorieTarget] = useState(2000);

  // Recipe selector state
  const [recipeSelectorOpen, setRecipeSelectorOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  // View state
  const [activeView, setActiveView] = useState<'calendar' | 'shopping'>('calendar');

  useEffect(() => {
    loadMealPlan();
    loadUserGoals();
  }, [currentWeekStart]);

  const loadUserGoals = () => {
    try {
      const goalsData = localStorage.getItem('nutrition_goals_default_user');
      if (goalsData) {
        const goals = JSON.parse(goalsData);
        setUserCalorieTarget(goals.dailyCalories || 2000);
      }
    } catch (error) {
      console.error('Error loading user goals:', error);
    }
  };

  const loadMealPlan = () => {
    setIsLoading(true);
    setError(null);

    try {
      const plan = MealPlanRepository.getByWeek(currentWeekStart);
      setMealPlan(plan);

      // Load shopping list if meal plan exists
      if (plan) {
        const shopping = ShoppingListRepository.getByMealPlanId(plan.id);
        setShoppingList(shopping);
      } else {
        setShoppingList(null);
      }
    } catch (err) {
      console.error('Error loading meal plan:', err);
      setError('Erreur lors du chargement du plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeekChange = (newWeekStart: Date) => {
    setCurrentWeekStart(newWeekStart);
  };

  const handleMealClick = (date: Date, mealType: MealType, currentMeal?: MealSlot) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setRecipeSelectorOpen(true);
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!selectedDate || !selectedMealType) return;

    try {
      // Create meal plan if it doesn't exist
      let currentPlan = mealPlan;
      if (!currentPlan) {
        currentPlan = MealPlanRepository.create({
          weekStart: currentWeekStart.toISOString(),
        });
        setMealPlan(currentPlan);
      }

      // Update meal slot
      const updatedPlan = MealPlanRepository.updateMealSlot(currentPlan.id, {
        date: selectedDate.toISOString(),
        mealType: selectedMealType,
        recipeId: recipe.id,
        servings: 1,
      });

      if (updatedPlan) {
        // Enrich days with recipe data
        const enrichedDays = enrichDaysWithRecipeData(updatedPlan.days);
        setMealPlan({ ...updatedPlan, days: enrichedDays });
      }
    } catch (err) {
      console.error('Error updating meal slot:', err);
      setError('Erreur lors de la mise à jour du repas');
    }
  };

  const handleMealRemove = (date: Date, mealType: MealType) => {
    if (!mealPlan) return;

    try {
      const updatedPlan = MealPlanRepository.updateMealSlot(mealPlan.id, {
        date: date.toISOString(),
        mealType,
        recipeId: undefined,
        servings: undefined,
      });

      if (updatedPlan) {
        const enrichedDays = enrichDaysWithRecipeData(updatedPlan.days);
        setMealPlan({ ...updatedPlan, days: enrichedDays });
      }
    } catch (err) {
      console.error('Error removing meal:', err);
      setError('Erreur lors de la suppression du repas');
    }
  };

  const handleGeneratePlan = async (criteria: MealPlanGenerationCriteria) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/meal-plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: currentWeekStart.toISOString(),
          criteria,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();

      // Create or update meal plan
      let currentPlan = mealPlan;
      if (currentPlan) {
        currentPlan = MealPlanRepository.update(currentPlan.id, {
          days: data.days,
        });
      } else {
        currentPlan = MealPlanRepository.create({
          weekStart: currentWeekStart.toISOString(),
          days: data.days,
          generationCriteria: criteria,
        });
      }

      if (currentPlan) {
        const enrichedDays = enrichDaysWithRecipeData(currentPlan.days);
        setMealPlan({ ...currentPlan, days: enrichedDays });
      }
    } catch (err) {
      console.error('Error generating meal plan:', err);
      setError('Erreur lors de la génération du plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!mealPlan) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shopping-lists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealPlanId: mealPlan.id,
          subtractFridge: true,
          name: `Liste de courses - ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate shopping list');
      }

      const data: ShoppingList = await response.json();
      setShoppingList(data);
      setActiveView('shopping');
    } catch (err) {
      console.error('Error generating shopping list:', err);
      setError('Erreur lors de la génération de la liste de courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleShoppingItem = (itemName: string) => {
    if (!shoppingList) return;

    const updatedList = ShoppingListRepository.toggleItemChecked(shoppingList.id, itemName);
    if (updatedList) {
      setShoppingList(updatedList);
    }
  };

  const handleDeleteShoppingList = () => {
    if (!shoppingList) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste de courses ?')) {
      ShoppingListRepository.delete(shoppingList.id);
      setShoppingList(null);
      setActiveView('calendar');
    }
  };

  const enrichDaysWithRecipeData = (days: DayMealPlan[]): DayMealPlan[] => {
    return days.map(day => ({
      ...day,
      meals: day.meals.map(meal => {
        if (meal.recipeId) {
          const recipe = RecipeRepository.getById(meal.recipeId);
          if (recipe) {
            return {
              ...meal,
              recipeName: recipe.name,
              calories: recipe.nutritionInfo.calories,
            };
          }
        }
        return meal;
      }),
    }));
  };

  if (isLoading && !mealPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const currentDays = mealPlan
    ? enrichDaysWithRecipeData(mealPlan.days)
    : Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        return { date, meals: [] };
      });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Planification de repas
          </h1>
          <p className="text-gray-600">
            Organisez vos repas de la semaine et générez votre liste de courses
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'calendar'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Calendrier
            </button>
            {shoppingList && (
              <button
                onClick={() => setActiveView('shopping')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'shopping'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Liste de courses
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {mealPlan && !shoppingList && activeView === 'calendar' && (
              <button
                onClick={handleGenerateShoppingList}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Générer liste de courses
              </button>
            )}

            {activeView === 'calendar' && (
              <GenerateMealPlan
                weekStart={currentWeekStart}
                onGenerate={handleGeneratePlan}
                defaultCalorieTarget={userCalorieTarget}
              />
            )}
          </div>
        </div>

        {/* Main content */}
        {activeView === 'calendar' ? (
          <WeeklyCalendar
            weekStart={currentWeekStart}
            days={currentDays}
            onWeekChange={handleWeekChange}
            onMealClick={handleMealClick}
            onMealRemove={handleMealRemove}
          />
        ) : shoppingList ? (
          <ShoppingListView
            shoppingList={shoppingList}
            onToggleItem={handleToggleShoppingItem}
            onDelete={handleDeleteShoppingList}
          />
        ) : null}

        {/* Recipe selector modal */}
        <RecipeSelector
          isOpen={recipeSelectorOpen}
          mealType={selectedMealType}
          onClose={() => setRecipeSelectorOpen(false)}
          onSelect={handleRecipeSelect}
        />
      </div>
    </div>
  );
}
