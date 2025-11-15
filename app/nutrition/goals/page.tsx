'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import type {
  Sex,
  ActivityLevel,
  GoalType,
  DietType,
  UserProfile,
  NutritionGoals,
} from '@/app/lib/types/nutrition';
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  DIET_LABELS,
} from '@/app/lib/types/nutrition';

export default function NutritionGoalsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState<Sex>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalType, setGoalType] = useState<GoalType>('maintain');
  const [dietType, setDietType] = useState<DietType>('balanced');

  useEffect(() => {
    loadProfileAndGoals();
  }, []);

  const loadProfileAndGoals = async () => {
    setIsLoading(true);
    try {
      // Load profile
      const profileResponse = await fetch('/api/nutrition/profile');
      if (profileResponse.ok) {
        const profileData: UserProfile = await profileResponse.json();
        setProfile(profileData);
        setWeight(profileData.weight);
        setHeight(profileData.height);
        setAge(profileData.age);
        setSex(profileData.sex);
        setActivityLevel(profileData.activityLevel);
        setGoalType(profileData.goalType);
        setDietType(profileData.dietType);
      }

      // Load goals
      const goalsResponse = await fetch('/api/nutrition/goals');
      if (goalsResponse.ok) {
        const goalsData: NutritionGoals = await goalsResponse.json();
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('Error loading profile and goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/nutrition/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight,
          height,
          age,
          sex,
          activityLevel,
          goalType,
          dietType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setGoals(data.goals);
        alert('Profil et objectifs mis à jour avec succès!');
        router.push('/nutrition');
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {profile && (
            <Link
              href="/nutrition"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <Target className="w-8 h-8" />
            <span>Objectifs nutritionnels</span>
          </h1>
          <p className="text-gray-600">
            {profile
              ? 'Ajustez vos informations pour recalculer vos objectifs'
              : 'Créez votre profil pour calculer vos objectifs nutritionnels'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Âge (ans)
                    </label>
                    <input
                      type="number"
                      min="13"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sexe
                    </label>
                    <select
                      value={sex}
                      onChange={(e) => setSex(e.target.value as Sex)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Niveau d&apos;activité</h2>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Objectif</h2>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as GoalType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Type de régime</h2>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as DietType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(DIET_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Sauvegarde en cours...' : 'Calculer mes objectifs'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {goals && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span>Métabolisme</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">BMR (Métabolisme de base)</p>
                      <p className="text-2xl font-bold text-gray-900">{goals.bmr} cal/jour</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">TDEE (Dépense énergétique)</p>
                      <p className="text-2xl font-bold text-gray-900">{goals.tdee} cal/jour</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <span>Objectifs quotidiens</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Calories</span>
                      <span className="font-semibold">{goals.dailyCalories} cal</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Protéines</span>
                      <span className="font-semibold">{goals.dailyProtein}g</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Glucides</span>
                      <span className="font-semibold">{goals.dailyCarbs}g</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Lipides</span>
                      <span className="font-semibold">{goals.dailyFat}g</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
