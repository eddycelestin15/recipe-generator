'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Dumbbell,
  Heart,
  Zap,
  Users,
  Play,
  ArrowLeft,
  Plus,
  X,
} from 'lucide-react';
import type { Exercise, ExerciseCategory, ExerciseDifficulty } from '../../lib/types/fitness';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExerciseDifficulty | ''>('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    loadExercises();
    loadMetadata();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exercises, searchTerm, selectedCategory, selectedDifficulty, selectedMuscle]);

  const loadExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const response = await fetch('/api/exercises/metadata');
      const data = await response.json();
      setMuscleGroups(data.muscleGroups || []);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...exercises];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(term) ||
          ex.description.toLowerCase().includes(term) ||
          ex.muscleGroup?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((ex) => ex.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    if (selectedMuscle) {
      filtered = filtered.filter((ex) => ex.muscleGroup === selectedMuscle);
    }

    setFilteredExercises(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedMuscle('');
  };

  const getCategoryIcon = (category: ExerciseCategory) => {
    switch (category) {
      case 'cardio':
        return <Heart className="w-5 h-5" />;
      case 'strength':
        return <Dumbbell className="w-5 h-5" />;
      case 'flexibility':
        return <Zap className="w-5 h-5" />;
      case 'sport':
        return <Users className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: ExerciseCategory) => {
    switch (category) {
      case 'cardio':
        return 'text-red-600 bg-red-50';
      case 'strength':
        return 'text-blue-600 bg-blue-50';
      case 'flexibility':
        return 'text-green-600 bg-green-50';
      case 'sport':
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getDifficultyColor = (difficulty: ExerciseDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/fitness"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-blue-600" />
            Exercise Library
          </h1>
          <p className="text-gray-600">
            Browse {exercises.length} exercises and build your perfect routine
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {(selectedCategory || selectedDifficulty || selectedMuscle) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {
                    [selectedCategory, selectedDifficulty, selectedMuscle].filter(Boolean)
                      .length
                  }
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sport">Sport</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Muscle Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Muscle Group
                </label>
                <select
                  value={selectedMuscle}
                  onChange={(e) => setSelectedMuscle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Muscles</option>
                  {muscleGroups.map((muscle) => (
                    <option key={muscle} value={muscle}>
                      {muscle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedDifficulty || selectedMuscle || searchTerm) && (
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredExercises.length} of {exercises.length} exercises
          </p>
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${getCategoryColor(
                      exercise.category
                    )}`}
                  >
                    {getCategoryIcon(exercise.category)}
                    <span className="text-sm font-medium capitalize">
                      {exercise.category}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                      exercise.difficulty
                    )}`}
                  >
                    {exercise.difficulty}
                  </span>
                </div>

                {/* Exercise Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{exercise.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {exercise.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {exercise.muscleGroup && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Dumbbell className="w-4 h-4" />
                      <span>{exercise.muscleGroup}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>{exercise.caloriesPerMinute} cal/min</span>
                  </div>
                  {exercise.equipment.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Equipment:</span>
                      <span className="capitalize">
                        {exercise.equipment.join(', ').replace(/-/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Link */}
                {exercise.videoUrl && (
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No exercises found</p>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <X className="w-5 h-5" />
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
