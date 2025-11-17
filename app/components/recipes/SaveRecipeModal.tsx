'use client';

import { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { GeminiRecipeResponse } from '@/app/lib/types/recipe';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';
import { useRouter } from 'next/navigation';

interface SaveRecipeModalProps {
  recipe: GeminiRecipeResponse;
  fridgeItemIds?: string[];
  onClose: () => void;
}

export default function SaveRecipeModal({ recipe, fridgeItemIds, onClose }: SaveRecipeModalProps) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>(recipe.tags || []);
  const [newTag, setNewTag] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Normalize mealType to always be an array
      const mealTypeArray = Array.isArray(recipe.mealType)
        ? recipe.mealType
        : [recipe.mealType];

      const savedRecipe = RecipeRepository.create({
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        cuisineType: recipe.cuisineType,
        mealType: mealTypeArray,
        tags,
        nutritionInfo: recipe.nutritionInfo,
        personalNotes: personalNotes || undefined,
        isGenerated: true,
        usedFridgeItems: fridgeItemIds,
      });

      // Redirect to the saved recipe
      router.push(`/recipes/${savedRecipe.id}`);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Erreur lors de la sauvegarde de la recette');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sauvegarder la recette</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Recipe Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{recipe.name}</h3>
            <p className="text-gray-600 text-sm">{recipe.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 bg-white rounded text-gray-600">
                ⏱️ {recipe.prepTime + recipe.cookTime} min
              </span>
              <span className="px-2 py-1 bg-white rounded text-gray-600">
                🔥 {recipe.nutritionInfo.calories} cal
              </span>
              <span className="px-2 py-1 bg-white rounded text-gray-600">
                👥 {recipe.servings} portions
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optionnel)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ajouter un tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Exemples: rapide, healthy, végétarien, budget, etc.
            </p>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes personnelles (optionnel)
            </label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Ajoutez vos propres notes, modifications ou conseils..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Cette recette sera sauvegardée dans votre bibliothèque personnelle. Vous pourrez la modifier ou la supprimer à tout moment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isSaving}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
