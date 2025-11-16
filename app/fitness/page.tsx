'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Dumbbell,
  TrendingUp,
  Calendar,
  Flame,
  Clock,
  Target,
  Plus,
  Library,
} from 'lucide-react';
import { FitnessPageSkeleton } from '../components/fitness/skeletons/FitnessPageSkeleton';
import type { WorkoutStats } from '../lib/types/fitness';

export default function FitnessDashboard() {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/workouts/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load workout stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <FitnessPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-blue-600" />
            Fitness Tracker
          </h1>
          <p className="text-gray-600">Track your workouts and progress</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/fitness/workout/active"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Plus className="w-8 h-8 mb-2" />
            <h3 className="text-lg font-semibold">Start Workout</h3>
            <p className="text-sm text-blue-100">Begin a training session</p>
          </Link>

          <Link
            href="/fitness/exercises"
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Library className="w-8 h-8 mb-2 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Exercises</h3>
            <p className="text-sm text-gray-600">Browse exercise library</p>
          </Link>

          <Link
            href="/fitness/routines"
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Target className="w-8 h-8 mb-2 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">My Routines</h3>
            <p className="text-sm text-gray-600">View & create routines</p>
          </Link>

          <Link
            href="/fitness/history"
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Calendar className="w-8 h-8 mb-2 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">History</h3>
            <p className="text-sm text-gray-600">View past workouts</p>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Workouts</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalWorkouts || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Duration</h3>
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalDuration || 0}
              <span className="text-lg text-gray-500 ml-1">min</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Calories Burned</h3>
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalCalories || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Current Streak</h3>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.currentStreak || 0}
              <span className="text-lg text-gray-500 ml-1">days</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Longest: {stats?.longestStreak || 0} days
            </p>
          </div>
        </div>

        {/* Recent Workouts & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Workouts */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Recent Workouts
            </h2>

            {stats?.recentWorkouts && stats.recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {stats.recentWorkouts.slice(0, 5).map((workout) => (
                  <div
                    key={workout.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {workout.routineName || 'Custom Workout'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(workout.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      {workout.mood && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            workout.mood === 'great'
                              ? 'bg-green-100 text-green-700'
                              : workout.mood === 'good'
                              ? 'bg-blue-100 text-blue-700'
                              : workout.mood === 'okay'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {workout.mood}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {workout.totalDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {workout.totalCalories} cal
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        {workout.exercises.length} exercises
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No workouts yet</p>
                <Link
                  href="/fitness/workout/active"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Start Your First Workout
                </Link>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Category Breakdown
            </h2>

            {stats && stats.totalWorkouts > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.workoutsByCategory).map(([category, count]) => {
                  const total = Object.values(stats.workoutsByCategory).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  const categoryColors: Record<string, string> = {
                    cardio: 'bg-red-500',
                    strength: 'bg-blue-500',
                    flexibility: 'bg-green-500',
                    sport: 'bg-yellow-500',
                  };

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {category}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            categoryColors[category] || 'bg-gray-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.averageWorkoutDuration}
                        <span className="text-sm text-gray-500 ml-1">min</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Avg Calories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.averageCaloriesPerWorkout}
                        <span className="text-sm text-gray-500 ml-1">cal</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Complete workouts to see category breakdown
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
