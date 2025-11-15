'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  ArrowLeft,
  Clock,
  Flame,
  Dumbbell,
  Copy,
  Trash2,
  Play,
  Star,
} from 'lucide-react';
import type { WorkoutRoutine } from '../../lib/types/fitness';

export default function RoutinesPage() {
  const [userRoutines, setUserRoutines] = useState<WorkoutRoutine[]>([]);
  const [templates, setTemplates] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'templates'>('mine');

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const [userRes, templateRes] = await Promise.all([
        fetch('/api/routines?userOnly=true'),
        fetch('/api/routines?templatesOnly=true'),
      ]);

      const userData = await userRes.json();
      const templateData = await templateRes.json();

      setUserRoutines(userData);
      setTemplates(templateData);
    } catch (error) {
      console.error('Failed to load routines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (routineId: string) => {
    try {
      const response = await fetch(`/api/routines/${routineId}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        loadRoutines(); // Reload to show the new routine
      }
    } catch (error) {
      console.error('Failed to duplicate routine:', error);
    }
  };

  const handleDelete = async (routineId: string) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;

    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserRoutines(userRoutines.filter((r) => r.id !== routineId));
      }
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  };

  const RoutineCard = ({
    routine,
    isTemplate,
  }: {
    routine: WorkoutRoutine;
    isTemplate: boolean;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
      {isTemplate && (
        <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium mb-2">
          <Star className="w-4 h-4 fill-current" />
          Template
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 mb-2">{routine.name}</h3>
      {routine.description && (
        <p className="text-sm text-gray-600 mb-4">{routine.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Dumbbell className="w-4 h-4" />
            <span className="text-xs">Exercises</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{routine.exercises.length}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Duration</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{routine.estimatedDuration}m</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs">Calories</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{routine.estimatedCalories}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/fitness/workout/active?routineId=${routine.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Workout
        </Link>

        <button
          onClick={() => handleDuplicate(routine.id)}
          className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>

        {!isTemplate && (
          <button
            onClick={() => handleDelete(routine.id)}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 animate-pulse mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Loading routines...</p>
        </div>
      </div>
    );
  }

  const displayRoutines = activeTab === 'mine' ? userRoutines : templates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/fitness"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Target className="w-10 h-10 text-purple-600" />
                Workout Routines
              </h1>
              <p className="text-gray-600">Create and manage your workout routines</p>
            </div>
            <Link
              href="/fitness/routines/new"
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Routine
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-2 shadow-lg mb-6 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'mine'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Routines ({userRoutines.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Templates ({templates.length})
          </button>
        </div>

        {/* Routines Grid */}
        {displayRoutines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                isTemplate={activeTab === 'templates'}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {activeTab === 'mine'
                ? 'No custom routines yet'
                : 'No templates available'}
            </p>
            <p className="text-gray-500 mb-6">
              {activeTab === 'mine'
                ? 'Create your first routine or duplicate a template to get started'
                : 'Check back later for pre-made workout templates'}
            </p>
            {activeTab === 'mine' && (
              <div className="flex gap-4 justify-center">
                <Link
                  href="/fitness/routines/new"
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Routine
                </Link>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Star className="w-5 h-5" />
                  Browse Templates
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
