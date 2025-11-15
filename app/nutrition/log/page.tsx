'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuickAddFood } from '@/app/components/nutrition/QuickAddFood';
import { ArrowLeft, Utensils } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { MealType } from '@/app/lib/types/nutrition';
import { MEAL_TYPE_LABELS } from '@/app/lib/types/nutrition';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';

export default function MealLogPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logMethod, setLogMethod] = useState<'quick' | 'recipe'>('quick');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load saved recipes
    const savedRecipes = RecipeRepository.getAll();
    setRecipes(savedRecipes);
  }, []);

  const handleQuickAdd = async (data: {
    mealType: MealType;
    customFood: any;
    servings: number;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: data.mealType,
          customFood: data.customFood,
          servings: data.servings,
          notes: data.notes,
        }),
      });

      if (response.ok) {
        router.push('/nutrition');
      } else {
        alert('Erreur lors de l\'ajout du repas');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Erreur lors de l\'ajout du repas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecipeAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRecipe) {
      alert('Veuillez sélectionner une recette');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          recipeId: selectedRecipe,
          servings,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        router.push('/nutrition');
      } else {
        alert('Erreur lors de l\'ajout du repas');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Erreur lors de l\'ajout du repas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/nutrition"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <Utensils className="w-8 h-8" />
            <span>Logger un repas</span>
          </h1>
          <p className="text-gray-600">Ajoutez un repas à votre journal alimentaire</p>
        </div>

        {/* Date selector */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date du repas
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Method selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Méthode d&apos;ajout</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setLogMethod('quick')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                logMethod === 'quick'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Ajout rapide</div>
                <div className="text-sm opacity-75">Rechercher un aliment</div>
              </div>
            </button>
            <button
              onClick={() => setLogMethod('recipe')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                logMethod === 'recipe'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Depuis une recette</div>
                <div className="text-sm opacity-75">Choisir une recette sauvegardée</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick add form */}
        {logMethod === 'quick' && (
          <QuickAddFood onAdd={handleQuickAdd} />
        )}

        {/* Recipe selection form */}
        {logMethod === 'recipe' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Ajouter depuis une recette</h3>
            <form onSubmit={handleRecipeAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner une recette
                </label>
                <select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choisir une recette --</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name} ({recipe.nutritionInfo.calories} cal / {recipe.servings} portions)
                    </option>
                  ))}
                </select>
                {recipes.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Aucune recette sauvegardée.{' '}
                    <Link href="/recipes" className="text-blue-600 hover:underline">
                      Créer une recette
                    </Link>
                  </p>
                )}
              </div>

              {selectedRecipe && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de repas
                    </label>
                    <select
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value as MealType)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(MEAL_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de portions
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes additionnelles..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter au journal'}
                  </button>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
