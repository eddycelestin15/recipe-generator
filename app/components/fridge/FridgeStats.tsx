'use client';

import { useTranslations } from 'next-intl';
import { FridgeStats as FridgeStatsType, FridgeCategory } from '@/app/lib/types/fridge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface FridgeStatsProps {
  stats: FridgeStatsType;
}

const COLORS: Record<FridgeCategory, string> = {
  Fruits: '#ef4444',
  Légumes: '#22c55e',
  Viandes: '#ec4899',
  Poissons: '#3b82f6',
  'Produits laitiers': '#eab308',
  Céréales: '#f59e0b',
  Condiments: '#a855f7',
  Autre: '#6b7280',
};

export default function FridgeStats({ stats }: FridgeStatsProps) {
  const t = useTranslations();
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Fruits': t('fridge.categories.fruits'),
      'Légumes': t('fridge.categories.vegetables'),
      'Viandes': t('fridge.categories.meats'),
      'Poissons': t('fridge.categories.fish'),
      'Produits laitiers': t('fridge.categories.dairy'),
      'Céréales': t('fridge.categories.grains'),
      'Condiments': t('fridge.categories.condiments'),
      'Autre': t('fridge.categories.other'),
    };
    return categoryMap[category] || category;
  };

  const categoryData = Object.entries(stats.itemsByCategory)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      name: getCategoryLabel(category),
      value: count,
      color: COLORS[category as FridgeCategory],
    }));

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('fridge.fridgeStatistics')}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fridge.totalItems')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fridge.expiringSoon')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.expiringCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fridge.expiredItems')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.expiredCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('fridge.estimatedValue')}</p>
              <p className="text-2xl font-bold text-gray-800">€{stats.estimatedValue?.toFixed(0) || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('fridge.categoryDistribution')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {categoryData.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('fridge.noItemsInFridge')}</p>
          <p className="text-sm text-gray-400">{t('fridge.addItemsToSeeStats')}</p>
        </div>
      )}
    </div>
  );
}
