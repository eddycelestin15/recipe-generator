'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AnalyticsTrends } from '../lib/types/health-dashboard';

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/trends?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setTrends(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const nutritionData = trends
    ? trends.nutritionTrends.labels.map((label, i) => ({
        date: label,
        calories: trends.nutritionTrends.calories[i],
        protein: trends.nutritionTrends.protein[i],
        carbs: trends.nutritionTrends.carbs[i],
        fat: trends.nutritionTrends.fat[i],
      }))
    : [];

  const weightData = trends
    ? trends.weightTrends.labels.map((label, i) => ({
        date: label,
        weight: trends.weightTrends.weight[i],
        bmi: trends.weightTrends.bmi[i],
      }))
    : [];

  const workoutData = trends
    ? trends.workoutConsistency.labels.map((label, i) => ({
        week: label,
        workouts: trends.workoutConsistency.workouts[i],
        avgDuration: trends.workoutConsistency.avgDuration[i],
      }))
    : [];

  const complianceData = trends
    ? trends.compliance.labels.map((label, i) => ({
        week: label,
        compliance: trends.compliance.complianceRate[i],
      }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">
            Analysez vos tendances et suivez vos progrès
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Période:</span>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === 'week' && 'Semaine'}
                  {p === 'month' && 'Mois'}
                  {p === 'quarter' && 'Trimestre'}
                  {p === 'year' && 'Année'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrition Trends */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Tendances Nutritionnelles
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={nutritionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                name="Calories"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="protein"
                name="Protéines (g)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="carbs"
                name="Glucides (g)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="fat"
                name="Lipides (g)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weight & Workout Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weight Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Évolution du Poids
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Poids (kg)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Workout Consistency */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Consistance des Entraînements
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="workouts"
                  name="Entraînements"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compliance Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Conformité aux Objectifs
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="compliance"
                name="Conformité (%)"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        {trends && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Insights & Corrélations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Corrélation Poids vs Calories
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {trends.correlations.weightVsCalories.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.abs(trends.correlations.weightVsCalories) > 0.5
                    ? 'Forte corrélation détectée'
                    : 'Corrélation faible'}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Recommandation
                </h3>
                <p className="text-sm text-gray-700">
                  {trends.correlations.weightVsCalories < -0.3
                    ? 'Votre apport calorique influence positivement votre perte de poids. Continuez !'
                    : trends.correlations.weightVsCalories > 0.3
                    ? 'Considérez ajuster votre apport calorique pour atteindre vos objectifs.'
                    : 'Maintenez vos habitudes actuelles et suivez vos progrès.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
