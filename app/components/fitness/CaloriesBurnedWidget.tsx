'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Dumbbell, TrendingUp } from 'lucide-react';

interface CaloriesBurnedWidgetProps {
  date?: Date;
}

export function CaloriesBurnedWidget({ date = new Date() }: CaloriesBurnedWidgetProps) {
  const [totalCalories, setTotalCalories] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaloriesBurned();
  }, [date]);

  const loadCaloriesBurned = async () => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/workouts?date=${dateStr}`);

      if (response.ok) {
        const workouts = await response.json();
        const total = workouts.reduce((sum: number, w: any) => sum + w.totalCalories, 0);
        setTotalCalories(total);
        setWorkoutCount(workouts.length);
      }
    } catch (error) {
      console.error('Failed to load calories burned:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-20 bg-orange-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 shadow-lg border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Calories Burned</h3>
        </div>
        <Link
          href="/fitness"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
        >
          <Dumbbell className="w-4 h-4" />
          Fitness
        </Link>
      </div>

      {workoutCount > 0 ? (
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-orange-600">{totalCalories}</span>
            <span className="text-gray-600">cal</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>
              {workoutCount} workout{workoutCount > 1 ? 's' : ''} today
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            These calories can be added to your daily nutrition budget
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-2">No workouts logged today</p>
          <Link
            href="/fitness/workout/active"
            className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <Dumbbell className="w-4 h-4" />
            Start a Workout
          </Link>
        </div>
      )}
    </div>
  );
}
