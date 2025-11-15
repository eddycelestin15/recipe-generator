'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Habit, HabitLog, TodayHabitsResponse } from '../lib/types/habits';
import { CheckCircle2, Circle, Plus, TrendingUp, Flame } from 'lucide-react';

export default function HabitsPage() {
  const [todayData, setTodayData] = useState<TodayHabitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadTodayHabits();
  }, []);

  const loadTodayHabits = async () => {
    try {
      const response = await fetch('/api/habits/today');
      const data = await response.json();
      setTodayData(data);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: string, completed: boolean, currentValue?: number) => {
    try {
      const response = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitId,
          date: new Date(),
          completed: !completed,
          value: currentValue,
        }),
      });

      const result = await response.json();

      if (result.newAchievements && result.newAchievements.length > 0) {
        setNewAchievements(result.newAchievements);
        setTimeout(() => setNewAchievements([]), 5000);
      }

      await loadTodayHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Habitudes</h1>
          <p className="text-gray-600">Suivez vos habitudes quotidiennes</p>
        </div>

        {/* Achievement Notifications */}
        {newAchievements.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-semibold text-yellow-900 mb-2">🎉 Nouveau badge débloqué !</div>
            {newAchievements.map((achievement) => (
              <div key={achievement.id} className="text-yellow-800">
                {achievement.iconEmoji} {achievement.name} - {achievement.description}
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(todayData?.completionRate || 0)}%
                </p>
              </div>
              <CheckCircle2 className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak global</p>
                <p className="text-2xl font-bold text-orange-600">{todayData?.streak || 0} jours</p>
              </div>
              <Flame className="text-orange-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Habitudes actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {todayData?.habits.length || 0}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        {/* Habit List */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Checklist du jour</h2>
            <Link
              href="/habits/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nouvelle habitude
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {todayData?.habits && todayData.habits.length > 0 ? (
              todayData.habits.map(({ habit, log, isScheduledToday }) => (
                <div
                  key={habit.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !isScheduledToday ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabit(habit.id, log?.completed || false, log?.value)}
                      className="flex-shrink-0"
                    >
                      {log?.completed ? (
                        <CheckCircle2 className="text-green-600" size={28} />
                      ) : (
                        <Circle className="text-gray-400" size={28} />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {habit.iconEmoji && <span className="text-xl">{habit.iconEmoji}</span>}
                        <h3
                          className={`font-semibold ${
                            log?.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {habit.name}
                        </h3>
                      </div>
                      {habit.description && (
                        <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                      )}
                      {habit.type === 'number' && (
                        <p className="text-sm text-gray-500 mt-1">
                          Objectif: {habit.target} {habit.unit}
                          {log?.value && ` • Complété: ${log.value} ${habit.unit}`}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/habits/${habit.id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Stats
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>Aucune habitude pour aujourd&apos;hui</p>
                <Link href="/habits/new" className="text-blue-600 hover:underline mt-2 inline-block">
                  Créer votre première habitude
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/daily-routines"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🌅 Routines quotidiennes</h3>
            <p className="text-gray-600">Gérez vos routines du matin et du soir</p>
          </Link>

          <Link
            href="/achievements"
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏆 Achievements</h3>
            <p className="text-gray-600">Consultez vos badges et récompenses</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
