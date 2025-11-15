'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Filter, Loader2, RefreshCw } from 'lucide-react';
import InsightCard from '../components/InsightCard';
import type { AIInsight } from '../lib/types/ai';

export default function InsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [filter]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'unread' ? '/api/ai/insights?unread=true' : '/api/ai/insights';
      const response = await fetch(url);
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyReview = async () => {
    setIsGeneratingReview(true);
    try {
      const response = await fetch('/api/ai/weekly-review', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la génération');
        return;
      }

      const data = await response.json();
      alert('Analyse hebdomadaire générée ! Consultez vos nouveaux insights.');
      loadInsights();
    } catch (error) {
      console.error('Error generating weekly review:', error);
      alert('Erreur lors de la génération de l\'analyse');
    } finally {
      setIsGeneratingReview(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setInsights((prev) =>
      prev.map((insight) =>
        insight.id === id ? { ...insight, read: true } : insight
      )
    );
  };

  const handleDelete = (id: string) => {
    setInsights((prev) => prev.filter((insight) => insight.id !== id));
  };

  const unreadCount = insights.filter((i) => !i.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Insights IA
                </h1>
                <p className="text-lg text-gray-600">
                  Alertes, suggestions et analyses personnalisées
                </p>
              </div>
            </div>

            <button
              onClick={generateWeeklyReview}
              disabled={isGeneratingReview}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isGeneratingReview ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Analyse hebdo
                </>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrer:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Non lus ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tous
              </button>
            </div>
          </div>
        </div>

        {/* Insights list */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des insights...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'unread' ? 'Aucun insight non lu' : 'Aucun insight'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'unread'
                ? 'Tous vos insights ont été lus !'
                : 'Générez votre première analyse hebdomadaire pour recevoir des insights.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={generateWeeklyReview}
                disabled={isGeneratingReview}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                Générer une analyse
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Info cards */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {insights.filter((i) => i.type === 'alert').length}
            </div>
            <div className="text-sm text-red-700 font-medium">Alertes</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter((i) => i.type === 'suggestion').length}
            </div>
            <div className="text-sm text-blue-700 font-medium">Suggestions</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {insights.filter((i) => i.type === 'achievement').length}
            </div>
            <div className="text-sm text-green-700 font-medium">Succès</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {insights.filter((i) => i.type === 'tip').length}
            </div>
            <div className="text-sm text-purple-700 font-medium">Conseils</div>
          </div>
        </div>
      </div>
    </div>
  );
}
