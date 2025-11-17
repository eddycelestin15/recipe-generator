'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Scale, Flame, Dumbbell, TrendingUp, Award, Calendar } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import MacroCircle from '../components/dashboard/MacroCircle';
import QuickActions from '../components/dashboard/QuickActions';
import { DashboardSkeleton } from '../components/dashboard/skeletons/DashboardSkeleton';
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
    return <DashboardSkeleton />;
  }

  return (
      <div className="bg-background min-h-full">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Santé</h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Suivez vos progrès et atteignez vos objectifs
            </p>
          </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
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
        <div className="space-y-4 mb-6">
          {/* Macros */}
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
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

          {/* Hydration */}
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <h3 className="text-base font-semibold text-foreground mb-3">
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
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <h3 className="text-base font-semibold text-foreground mb-3">
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
                <p className="text-sm text-foreground-tertiary">
                  Aucune recette cette semaine
                </p>
              )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/analytics"
            className="bg-card border border-border rounded-lg shadow p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-foreground">Analytics</h3>
              <TrendingUp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-foreground-secondary">
              Visualisez vos tendances et progrès détaillés
            </p>
          </Link>

          <Link
            href="/progress"
            className="bg-card border border-border rounded-lg shadow p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-foreground">Progression</h3>
              <Scale className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-foreground-secondary">
              Suivez votre poids et vos mesures corporelles
            </p>
          </Link>

          <Link
            href="/goals"
            className="bg-card border border-border rounded-lg shadow p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-foreground">Objectifs</h3>
              <Calendar className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-sm text-foreground-secondary">
              Gérez vos objectifs et milestones
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
