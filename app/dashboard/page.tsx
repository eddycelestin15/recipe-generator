'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Scale, Flame, Dumbbell, TrendingUp, Award, Calendar } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import MacroCircle from '../components/dashboard/MacroCircle';
import QuickActions from '../components/dashboard/QuickActions';
import type { DashboardSummary } from '../lib/types/health-dashboard';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Santé</h1>
          <p className="text-gray-600 mt-2">
            Suivez vos progrès et atteignez vos objectifs
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Poids Actuel"
            value={summary?.currentWeight ? `${summary.currentWeight}kg` : 'N/A'}
            subtitle="Évolution semaine"
            icon={Scale}
            trend={
              summary?.weekWeightChange
                ? {
                    value: Math.abs(summary.weekWeightChange),
                    isPositive: summary.weekWeightChange < 0,
                  }
                : undefined
            }
            color="blue"
          />

          <StatsCard
            title="Calories Aujourd'hui"
            value={summary ? Math.round(summary.calories.consumed) : 0}
            subtitle={summary ? `Objectif: ${Math.round(summary.calories.goal)}` : ''}
            icon={Flame}
            color="orange"
          />

          <StatsCard
            title="Workout du Jour"
            value={summary?.todayWorkout?.completed ? 'Complété' : 'Non fait'}
            subtitle={summary?.todayWorkout?.name || 'Aucun prévu'}
            icon={Dumbbell}
            color="purple"
          />

          <StatsCard
            title="Streak"
            value={`${summary?.currentStreak || 0} jours`}
            subtitle="Jours consécutifs"
            icon={Award}
            color="green"
          />
        </div>

        {/* Macros and Nutrition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Macros */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Macronutriments Aujourd'hui
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <MacroCircle
                label="Protéines"
                current={summary?.macros.protein.consumed || 0}
                goal={summary?.macros.protein.goal || 150}
                color="#3b82f6"
              />
              <MacroCircle
                label="Glucides"
                current={summary?.macros.carbs.consumed || 0}
                goal={summary?.macros.carbs.goal || 200}
                color="#10b981"
              />
              <MacroCircle
                label="Lipides"
                current={summary?.macros.fat.consumed || 0}
                goal={summary?.macros.fat.goal || 60}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Hydration & Favorites */}
          <div className="space-y-6">
            {/* Hydration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hydratation
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {summary?.hydration.current || 0}ml / {summary?.hydration.goal || 2000}ml
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(summary?.hydration.percentage || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, summary?.hydration.percentage || 0)}%`,
                  }}
                />
              </div>
            </div>

            {/* Favorite Recipes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recettes Favorites (Cette Semaine)
              </h3>
              {summary?.favoriteRecipes && summary.favoriteRecipes.length > 0 ? (
                <ul className="space-y-2">
                  {summary.favoriteRecipes.map((recipe) => (
                    <li
                      key={recipe.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">{recipe.name}</span>
                      <span className="text-gray-500">{recipe.timesCooked}x</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucune recette cette semaine
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <TrendingUp className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-gray-600">
              Visualisez vos tendances et progrès détaillés
            </p>
          </Link>

          <Link
            href="/progress"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Progression</h3>
              <Scale className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-gray-600">
              Suivez votre poids et vos mesures corporelles
            </p>
          </Link>

          <Link
            href="/goals"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Objectifs</h3>
              <Calendar className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-gray-600">
              Gérez vos objectifs et milestones
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
