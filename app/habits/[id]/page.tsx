'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Flame, TrendingUp, Calendar, Target } from 'lucide-react';
import { Habit, HabitStats } from '@/app/lib/types/habits';

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadHabitStats();
    }
  }, [params.id]);

  const loadHabitStats = async () => {
    try {
      const response = await fetch(`/api/habits/${params.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setHabit(data.habit);
        setStats(data.stats);
      } else {
        router.push('/habits');
      }
    } catch (error) {
      console.error('Error loading habit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette habitude ?')) return;

    try {
      const response = await fetch(`/api/habits/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/habits');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!habit || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Habitude introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux habitudes
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {habit.iconEmoji && <span className="text-4xl">{habit.iconEmoji}</span>}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{habit.name}</h1>
                {habit.description && <p className="text-gray-600 mt-1">{habit.description}</p>}
              </div>
            </div>
            <button
              onClick={deleteHabit}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Streak actuel</p>
              <Flame className="text-orange-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
            <p className="text-xs text-gray-500">jours consécutifs</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Record</p>
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.longestStreak}</p>
            <p className="text-xs text-gray-500">meilleur streak</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Complétions</p>
              <Calendar className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.totalCompletions}</p>
            <p className="text-xs text-gray-500">fois au total</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Taux de réussite</p>
              <Target className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(stats.completionRate)}%
            </p>
            <p className="text-xs text-gray-500">30 derniers jours</p>
          </div>
        </div>

        {/* Habit Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold">
                {habit.type === 'boolean' ? 'Simple (Oui/Non)' : 'Quantifiable'}
              </p>
            </div>

            {habit.type === 'number' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Objectif</p>
                  <p className="font-semibold">
                    {habit.target} {habit.unit}
                  </p>
                </div>
                {stats.averageValue && (
                  <div>
                    <p className="text-sm text-gray-600">Moyenne</p>
                    <p className="font-semibold">
                      {Math.round(stats.averageValue)} {habit.unit}
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <p className="text-sm text-gray-600">Fréquence</p>
              <p className="font-semibold">
                {habit.frequency === 'daily' ? 'Quotidien' : 'Jours spécifiques'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Catégorie</p>
              <p className="font-semibold capitalize">{habit.category}</p>
            </div>

            {stats.lastCompletedDate && (
              <div>
                <p className="text-sm text-gray-600">Dernière complétion</p>
                <p className="font-semibold">
                  {new Date(stats.lastCompletedDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600">Créée le</p>
              <p className="font-semibold">
                {new Date(habit.createdDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* Streak History Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Historique des 30 derniers jours
          </h2>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {stats.streakHistory.slice(-30).map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded ${
                      item.streak > 0 ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    title={`${new Date(item.date).toLocaleDateString('fr-FR')} - Streak: ${
                      item.streak
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {new Date(item.date).getDate()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Complété</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200" />
              <span>Manqué</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
