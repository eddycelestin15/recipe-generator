'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Flame, Dumbbell, TrendingUp } from 'lucide-react';
import type { WorkoutLog } from '../../lib/types/fitness';

export default function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/workouts/history');
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Failed to load workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'great':
        return '🔥';
      case 'good':
        return '😊';
      case 'okay':
        return '😐';
      case 'tired':
        return '😴';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 animate-pulse mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Loading workout history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/fitness"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-orange-600" />
            Workout History
          </h1>
          <p className="text-gray-600">Track your fitness journey</p>
        </div>

        {/* Workout List */}
        {workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {workout.routineName || 'Custom Workout'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(workout.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {workout.mood && (
                    <div className="text-3xl" title={workout.mood}>
                      {getMoodEmoji(workout.mood)}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {workout.totalDuration} min
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-medium">Calories</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {workout.totalCalories}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Dumbbell className="w-4 h-4" />
                      <span className="text-xs font-medium">Exercises</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {workout.exercises.length}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {workout.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 italic">{workout.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No workouts logged yet</p>
            <p className="text-gray-500 mb-6">
              Start your fitness journey by completing your first workout
            </p>
            <Link
              href="/fitness/workout/active"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Dumbbell className="w-5 h-5" />
              Start a Workout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
