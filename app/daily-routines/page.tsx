'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Sun, Moon, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { RoutineWithHabits, Habit, CreateRoutineDTO } from '../lib/types/habits';

export default function DailyRoutinesPage() {
  const [routines, setRoutines] = useState<RoutineWithHabits[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routinesRes, habitsRes] = await Promise.all([
        fetch('/api/daily-routines'),
        fetch('/api/habits?active=true'),
      ]);

      const routinesData = await routinesRes.json();
      const habitsData = await habitsRes.json();

      setRoutines(routinesData);
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoutine = async (id: string) => {
    if (!confirm('Supprimer cette routine ?')) return;

    try {
      const response = await fetch(`/api/daily-routines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting routine:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/daily-routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling routine:', error);
    }
  };

  const morningRoutines = routines.filter((r) => r.type === 'morning');
  const eveningRoutines = routines.filter((r) => r.type === 'evening');
  const customRoutines = routines.filter((r) => r.type === 'custom');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Routines quotidiennes</h1>
              <p className="text-gray-600">Organisez vos habitudes en routines</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nouvelle routine
            </button>
          </div>
        </div>

        {/* Morning Routines */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Routines du matin</h2>
          </div>
          {morningRoutines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {morningRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onDelete={deleteRoutine}
                  onToggleActive={toggleActive}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aucune routine du matin
            </div>
          )}
        </div>

        {/* Evening Routines */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="text-indigo-500" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Routines du soir</h2>
          </div>
          {eveningRoutines.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eveningRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onDelete={deleteRoutine}
                  onToggleActive={toggleActive}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Aucune routine du soir
            </div>
          )}
        </div>

        {/* Custom Routines */}
        {customRoutines.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Routines personnalisées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onDelete={deleteRoutine}
                  onToggleActive={toggleActive}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateRoutineModal
            habits={habits}
            onClose={() => setShowCreateModal(false)}
            onCreated={() => {
              setShowCreateModal(false);
              loadData();
            }}
          />
        )}
      </div>
    </div>
  );
}

function RoutineCard({
  routine,
  onDelete,
  onToggleActive,
}: {
  routine: RoutineWithHabits;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${!routine.isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{routine.name}</h3>
          {routine.description && <p className="text-sm text-gray-600 mt-1">{routine.description}</p>}
          {routine.reminderTime && (
            <p className="text-sm text-blue-600 mt-2">🔔 Rappel à {routine.reminderTime}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleActive(routine.id, routine.isActive)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title={routine.isActive ? 'Désactiver' : 'Activer'}
          >
            {routine.isActive ? <Power size={18} /> : <PowerOff size={18} />}
          </button>
          <button
            onClick={() => onDelete(routine.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          {routine.habits.length} habitude{routine.habits.length > 1 ? 's' : ''}:
        </p>
        {routine.habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-2 text-sm text-gray-600">
            {habit.iconEmoji && <span>{habit.iconEmoji}</span>}
            <span>{habit.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateRoutineModal({
  habits,
  onClose,
  onCreated,
}: {
  habits: Habit[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState<CreateRoutineDTO>({
    name: '',
    description: '',
    type: 'morning',
    habitIds: [],
    reminderTime: '07:00',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/daily-routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onCreated();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      alert('Erreur lors de la création');
    }
  };

  const toggleHabit = (habitId: string) => {
    setFormData((prev) => ({
      ...prev,
      habitIds: prev.habitIds.includes(habitId)
        ? prev.habitIds.filter((id) => id !== habitId)
        : [...prev.habitIds, habitId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nouvelle routine</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ma routine du matin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as 'morning' | 'evening' | 'custom' })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="morning">Matin</option>
              <option value="evening">Soir</option>
              <option value="custom">Personnalisée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure du rappel
            </label>
            <input
              type="time"
              value={formData.reminderTime}
              onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habitudes ({formData.habitIds.length} sélectionnée{formData.habitIds.length > 1 ? 's' : ''})
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
              {habits.map((habit) => (
                <label key={habit.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.habitIds.includes(habit.id)}
                    onChange={() => toggleHabit(habit.id)}
                    className="w-4 h-4"
                  />
                  {habit.iconEmoji && <span>{habit.iconEmoji}</span>}
                  <span>{habit.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Créer la routine
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
