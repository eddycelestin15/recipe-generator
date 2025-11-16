'use client';


import { useEffect, useState } from 'react';
import { NutritionCircle } from '@/app/components/nutrition/NutritionCircle';
import { MealTimeline } from '@/app/components/nutrition/MealTimeline';
import { WaterIntake } from '@/app/components/nutrition/WaterIntake';
import { CaloriesBurnedWidget } from '@/app/components/fitness/CaloriesBurnedWidget';
import { Calendar, TrendingUp, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import type { DailyNutritionStats, MealLog } from '@/app/lib/types/nutrition';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';

// Force dynamic rendering - this page uses localStorage
export const dynamic = 'force-dynamic';

export default function NutritionDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState<DailyNutritionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mealsWithDetails, setMealsWithDetails] = useState<any[]>([]);

  const loadDailyStats = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/nutrition/daily/${dateStr}`);

      if (response.ok) {
        const data: DailyNutritionStats = await response.json();
        setStats(data);

        // Enrich meal logs with display names and nutrition
        const enrichedMeals = data.mealsLogged.map((meal: MealLog) => {
          let displayName = '';
          let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

          if (meal.customFood) {
            displayName = meal.customFood.name;
            nutrition = {
              calories: meal.customFood.calories,
              protein: meal.customFood.protein,
              carbs: meal.customFood.carbs,
              fat: meal.customFood.fat,
            };
          } else if (meal.recipeId) {
            const recipe = RecipeRepository.getById(meal.recipeId);
            if (recipe) {
              displayName = recipe.name;
              nutrition = {
                calories: recipe.nutritionInfo.calories / recipe.servings,
                protein: recipe.nutritionInfo.protein / recipe.servings,
                carbs: recipe.nutritionInfo.carbs / recipe.servings,
                fat: recipe.nutritionInfo.fat / recipe.servings,
              };
            }
          }

          return {
            ...meal,
            displayName,
            nutrition,
          };
        });

        setMealsWithDetails(enrichedMeals);
      } else {
        // If profile doesn't exist, redirect to goals page
        if (response.status === 404) {
          window.location.href = '/nutrition/goals';
        }
      }
    } catch (error) {
      console.error('Error loading daily stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDailyStats(selectedDate);
  }, [selectedDate]);

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce repas?')) return;

    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadDailyStats(selectedDate);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleUpdateWater = async (newIntake: number) => {
    try {
      const response = await fetch('/api/nutrition/water', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          waterIntake: newIntake,
        }),
      });

      if (response.ok) {
        loadDailyStats(selectedDate);
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord nutrition</h1>
          <p className="text-gray-600">Suivez vos objectifs nutritionnels quotidiens</p>
        </div>

        {/* Date selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            ← Jour précédent
          </button>

          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-medium">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
          >
            Jour suivant →
          </button>
        </div>

        {/* Nutrition circles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <NutritionCircle
              label="Calories"
              progress={stats.calories}
              unit="cal"
              color="blue"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <NutritionCircle
              label="Protéines"
              progress={stats.protein}
              unit="g"
              color="red"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <NutritionCircle
              label="Glucides"
              progress={stats.carbs}
              unit="g"
              color="yellow"
            />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <NutritionCircle
              label="Lipides"
              progress={stats.fat}
              unit="g"
              color="green"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meal timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Repas du jour</h2>
                <Link
                  href="/nutrition/log"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Logger un repas</span>
                </Link>
              </div>
              <MealTimeline meals={mealsWithDetails} onDelete={handleDeleteMeal} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calories burned from workouts */}
            <CaloriesBurnedWidget date={selectedDate} />

            {/* Water intake */}
            <WaterIntake
              currentIntake={stats.waterIntake}
              onUpdate={handleUpdateWater}
            />

            {/* Quick links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Actions rapides</span>
              </h3>
              <div className="space-y-2">
                <Link
                  href="/nutrition/log"
                  className="block w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-center"
                >
                  Logger un repas
                </Link>
                <Link
                  href="/nutrition/goals"
                  className="block w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-center"
                >
                  Mes objectifs
                </Link>
                <Link
                  href="/recipes"
                  className="block w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-center"
                >
                  Parcourir les recettes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
