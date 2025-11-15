'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const EMOJI_OPTIONS = ['💧', '🏃', '📖', '🧘', '🥗', '💪', '🌙', '☀️', '🎯', '✍️', '🚶', '🧠'];

const COLORS = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rouge', value: '#EF4444' },
];

export default function NewHabitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'boolean' as 'boolean' | 'number',
    target: '',
    unit: '',
    frequency: 'daily' as 'daily' | 'weekly',
    specificDays: [] as number[],
    reminderEnabled: false,
    reminderTime: '09:00',
    category: 'health' as 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'other',
    iconEmoji: '🎯',
    color: '#3B82F6',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        target: formData.type === 'number' ? Number(formData.target) : undefined,
        unit: formData.type === 'number' ? formData.unit : undefined,
        frequency: formData.frequency,
        specificDays: formData.frequency === 'weekly' ? formData.specificDays : undefined,
        reminderEnabled: formData.reminderEnabled,
        reminderTime: formData.reminderEnabled ? formData.reminderTime : undefined,
        category: formData.category,
        iconEmoji: formData.iconEmoji,
        color: formData.color,
      };

      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/habits');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      specificDays: prev.specificDays.includes(day)
        ? prev.specificDays.filter((d) => d !== day)
        : [...prev.specificDays, day],
    }));
  };

  const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux habitudes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle habitude</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l&apos;habitude *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Boire 2L d'eau"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Pourquoi cette habitude est importante..."
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, iconEmoji: emoji })}
                  className={`text-2xl p-2 rounded-lg border-2 ${
                    formData.iconEmoji === emoji
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'boolean' })}
                className={`p-4 rounded-lg border-2 ${
                  formData.type === 'boolean'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Simple (Oui/Non)</div>
                <div className="text-sm text-gray-600">Fait ou pas fait</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'number' })}
                className={`p-4 rounded-lg border-2 ${
                  formData.type === 'number'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Quantifiable</div>
                <div className="text-sm text-gray-600">Avec objectif chiffré</div>
              </button>
            </div>
          </div>

          {/* Target & Unit (for number type) */}
          {formData.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectif *
                </label>
                <input
                  type="number"
                  required
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unité *</label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ml, pas, min..."
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as typeof formData.category,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="health">Santé</option>
              <option value="fitness">Fitness</option>
              <option value="productivity">Productivité</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, frequency: 'daily', specificDays: [] })}
                className={`p-4 rounded-lg border-2 ${
                  formData.frequency === 'daily'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Quotidien
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, frequency: 'weekly' })}
                className={`p-4 rounded-lg border-2 ${
                  formData.frequency === 'weekly'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Jours spécifiques
              </button>
            </div>
          </div>

          {/* Specific Days (for weekly) */}
          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours de la semaine *
              </label>
              <div className="flex gap-2">
                {DAYS.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      formData.specificDays.includes(index)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Activer les rappels</span>
            </label>
            {formData.reminderEnabled && (
              <input
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Création...' : 'Créer l\'habitude'}
            </button>
            <Link
              href="/habits"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
