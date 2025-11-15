'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Check, Save, Timer, Dumbbell } from 'lucide-react';
import type {
  Exercise,
  WorkoutRoutine,
  WorkoutLogExercise,
  WorkoutSet,
} from '../../../lib/types/fitness';

function ActiveWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineId = searchParams.get('routineId');

  const [routine, setRoutine] = useState<WorkoutRoutine | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutLogExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (routineId) {
      loadRoutine(routineId);
    }
    loadExercises();
  }, [routineId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const loadRoutine = async (id: string) => {
    try {
      const response = await fetch(`/api/routines/${id}`);
      const data = await response.json();
      setRoutine(data);

      // Initialize workout exercises
      const workoutExs: WorkoutLogExercise[] = data.exercises.map(
        (ex: any) => ({
          exerciseId: ex.exerciseId,
          sets: Array(ex.sets)
            .fill(null)
            .map(() => ({
              reps: ex.reps,
              weight: 0,
              duration: ex.duration,
              completed: false,
            })),
        })
      );
      setWorkoutExercises(workoutExs);
    } catch (error) {
      console.error('Failed to load routine:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSet,
    value: any
  ) => {
    const updated = [...workoutExercises];
    (updated[exerciseIndex].sets[setIndex] as any)[field] = value;
    setWorkoutExercises(updated);
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets[setIndex].completed =
      !updated[exerciseIndex].sets[setIndex].completed;
    setWorkoutExercises(updated);
  };

  const calculateTotalCalories = (): number => {
    let total = 0;
    workoutExercises.forEach((workoutEx) => {
      const exercise = exercises.find((e) => e.id === workoutEx.exerciseId);
      if (exercise) {
        const durationMinutes = elapsedTime / 60;
        total += exercise.caloriesPerMinute * durationMinutes;
      }
    });
    return Math.round(total);
  };

  const handleSave = async () => {
    if (!confirm('Save this workout?')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routineId: routine?.id,
          routineName: routine?.name,
          exercises: workoutExercises,
          totalDuration: Math.round(elapsedTime / 60),
          totalCalories: calculateTotalCalories(),
        }),
      });

      if (response.ok) {
        router.push('/fitness/history');
      } else {
        alert('Failed to save workout');
      }
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentWorkoutEx = workoutExercises[currentExerciseIndex];
  const currentExercise = currentWorkoutEx
    ? exercises.find((e) => e.id === currentWorkoutEx.exerciseId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/fitness"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {routine?.name || 'Workout Session'}
          </h1>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
              <Timer className="w-5 h-5" />
              <span className="text-sm font-medium">Workout Duration</span>
            </div>
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {formatTime(elapsedTime)}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || workoutExercises.length === 0}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Finish Workout'}
              </button>
            </div>
          </div>
        </div>

        {/* Exercise Navigation */}
        {routine && (
          <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {routine.exercises.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExerciseIndex(index)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    index === currentExerciseIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Exercise {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Exercise */}
        {currentExercise && currentWorkoutEx && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-blue-600" />
                {currentExercise.name}
              </h2>
              <p className="text-gray-600">{currentExercise.description}</p>
            </div>

            {/* Sets */}
            <div className="space-y-3">
              {currentWorkoutEx.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`border rounded-lg p-4 ${
                    set.completed
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-semibold text-gray-700 w-16">
                      Set {setIndex + 1}
                    </div>

                    {set.reps !== undefined && (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Reps</label>
                        <input
                          type="number"
                          min="0"
                          value={set.reps || ''}
                          onChange={(e) =>
                            updateSet(
                              currentExerciseIndex,
                              setIndex,
                              'reps',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    {set.reps !== undefined && (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight || ''}
                          onChange={(e) =>
                            updateSet(
                              currentExerciseIndex,
                              setIndex,
                              'weight',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    {set.duration !== undefined && (
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">
                          Duration (sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={set.duration || ''}
                          onChange={(e) =>
                            updateSet(
                              currentExerciseIndex,
                              setIndex,
                              'duration',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => toggleSetComplete(currentExerciseIndex, setIndex)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        set.completed
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {currentExerciseIndex > 0 && (
                <button
                  onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous Exercise
                </button>
              )}
              {routine && currentExerciseIndex < routine.exercises.length - 1 && (
                <button
                  onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Exercise
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActiveWorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Timer className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading workout...</p>
          </div>
        </div>
      }
    >
      <ActiveWorkoutContent />
    </Suspense>
  );
}
