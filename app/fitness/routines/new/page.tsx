'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Save, GripVertical } from 'lucide-react';
import type { Exercise, WorkoutRoutineExercise } from '../../../lib/types/fitness';

export default function NewRoutinePage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutRoutineExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const addExercise = (exercise: Exercise) => {
    const newExercise: WorkoutRoutineExercise = {
      exerciseId: exercise.id,
      order: selectedExercises.length + 1,
      sets: 3,
      reps: exercise.category === 'strength' ? 10 : undefined,
      duration: exercise.category !== 'strength' ? 60 : undefined,
      restBetweenSets: 60,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((ex, i) => (ex.order = i + 1));
    setSelectedExercises(updated);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    (updated[index] as any)[field] = value;
    setSelectedExercises(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a routine name');
      return;
    }

    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          exercises: selectedExercises,
        }),
      });

      if (response.ok) {
        router.push('/fitness/routines');
      } else {
        alert('Failed to create routine');
      }
    } catch (error) {
      console.error('Failed to save routine:', error);
      alert('Failed to create routine');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/fitness/routines"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Routines
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Routine</h1>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Routine Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Upper Body Day"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your routine..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Exercises</h2>
              <button
                onClick={() => setShowExercisePicker(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Exercise
              </button>
            </div>

            {selectedExercises.length > 0 ? (
              <div className="space-y-4">
                {selectedExercises.map((routineEx, index) => {
                  const exercise = exercises.find((e) => e.id === routineEx.exerciseId);
                  if (!exercise) return null;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                            <button
                              onClick={() => removeExercise(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Sets</label>
                              <input
                                type="number"
                                min="1"
                                value={routineEx.sets}
                                onChange={(e) =>
                                  updateExercise(index, 'sets', parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>

                            {routineEx.reps !== undefined && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Reps</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={routineEx.reps}
                                  onChange={(e) =>
                                    updateExercise(index, 'reps', parseInt(e.target.value))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            )}

                            {routineEx.duration !== undefined && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Duration (sec)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={routineEx.duration}
                                  onChange={(e) =>
                                    updateExercise(index, 'duration', parseInt(e.target.value))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Rest (sec)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={routineEx.restBetweenSets}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    'restBetweenSets',
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-600 mb-4">No exercises added yet</p>
                <button
                  onClick={() => setShowExercisePicker(true)}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Exercise
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Routine'}
            </button>
            <Link
              href="/fitness/routines"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Select Exercise</h2>
              <button
                onClick={() => setShowExercisePicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="text-left border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                        {exercise.category}
                      </span>
                      {exercise.muscleGroup && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {exercise.muscleGroup}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
