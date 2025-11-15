'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Lock, Award } from 'lucide-react';
import { AchievementProgress } from '../lib/types/habits';

export default function AchievementsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  const filteredAchievements = data?.achievements.filter((a: AchievementProgress) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const unlockedCount = data?.achievements.filter((a: AchievementProgress) => a.unlocked).length || 0;
  const totalCount = data?.achievements.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux habitudes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Achievements</h1>
          <p className="text-gray-600">Débloquez des badges en complétant vos habitudes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Badges débloqués</p>
              <Trophy className="text-yellow-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {unlockedCount}/{totalCount}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Points totaux</p>
              <Award className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">{data?.totalPoints || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Niveau</p>
              <div className="text-purple-600 font-bold text-2xl">{data?.level || 1}</div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((data?.pointsForNextLevel || 0) / 100) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data?.pointsForNextLevel || 0} pts pour le prochain niveau
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Progression</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'unlocked'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Débloqués ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'locked'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            À débloquer ({totalCount - unlockedCount})
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements?.map((item: AchievementProgress) => (
            <div
              key={item.achievement.id}
              className={`bg-white rounded-lg shadow p-6 ${
                item.unlocked ? 'border-2 border-yellow-400' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{item.achievement.iconEmoji}</div>
                {item.unlocked ? (
                  <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    DÉBLOQUÉ
                  </div>
                ) : (
                  <Lock className="text-gray-400" size={20} />
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{item.achievement.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.achievement.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-semibold">
                  +{item.achievement.points} pts
                </span>
                <span className="text-xs text-gray-500 capitalize">
                  {item.achievement.category}
                </span>
              </div>

              {!item.unlocked && item.progressDetails && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{item.progressDetails}</p>
                </div>
              )}

              {item.unlocked && item.unlockedDate && (
                <p className="text-xs text-gray-500 mt-3">
                  Débloqué le {new Date(item.unlockedDate).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredAchievements?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun achievement dans cette catégorie
          </div>
        )}
      </div>
    </div>
  );
}
