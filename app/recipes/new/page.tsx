'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';
import {
  RecipeIngredient,
  RecipeDifficulty,
  MealType,
  CUISINE_TYPES,
} from '@/app/lib/types/recipe';
import { Plus, X, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering - this page uses localStorage
export const dynamic = 'force-dynamic';

export default function NewRecipePage() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState(30);
  const [cookTime, setCookTime] = useState(20);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('medium');
  const [cuisineType, setCuisineType] = useState('french');
  const [mealTypes, setMealTypes] = useState<MealType[]>(['lunch']);
  const [tags, setTags] = useState<string[]>([]);
  const [personalNotes, setPersonalNotes] = useState('');

  // Ingredients
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: '', quantity: 0, unit: 'g' },
  ]);

  // Steps
  const [steps, setSteps] = useState<string[]>(['']);

  // Nutrition
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [fiber, setFiber] = useState<number | undefined>(undefined);

  // UI state
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: 'g' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleToggleMealType = (mealType: MealType) => {
    setMealTypes((prev) =>
      prev.includes(mealType)
        ? prev.filter((t) => t !== mealType)
        : [...prev, mealType]
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Le nom de la recette est requis');
      return false;
    }
    if (!description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (ingredients.filter((ing) => ing.name.trim()).length === 0) {
      setError('Au moins un ingrédient est requis');
      return false;
    }
    if (steps.filter((step) => step.trim()).length === 0) {
      setError('Au moins une étape est requise');
      return false;
    }
    if (mealTypes.length === 0) {
      setError('Sélectionnez au moins un type de repas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const savedRecipe = RecipeRepository.create({
        name: name.trim(),
        description: description.trim(),
        ingredients: ingredients.filter((ing) => ing.name.trim()),
        steps: steps.filter((step) => step.trim()),
        prepTime,
        cookTime,
        servings,
        difficulty,
        cuisineType,
        mealType: mealTypes,
        tags,
        nutritionInfo: {
          calories,
          protein,
          carbs,
          fat,
          fiber,
        },
        personalNotes: personalNotes.trim() || undefined,
        isGenerated: false,
      });

      router.push(`/recipes/${savedRecipe.id}`);
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la recette');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux recettes</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Nouvelle Recette</h1>
          <p className="text-gray-600">Ajoutez votre recette personnelle</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de base</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la recette *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de préparation (min) *
                  </label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de cuisson (min) *
                  </label>
                  <input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portions *
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de cuisine *
                  </label>
                  <select
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    {CUISINE_TYPES.map((cuisine) => (
                      <option key={cuisine.value} value={cuisine.value}>
                        {cuisine.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de repas * (sélectionnez au moins un)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack', 'dessert'] as MealType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleToggleMealType(type)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        mealTypes.includes(type)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'breakfast' && 'Petit-déjeuner'}
                      {type === 'lunch' && 'Déjeuner'}
                      {type === 'dinner' && 'Dîner'}
                      {type === 'snack' && 'Snack'}
                      {type === 'dessert' && 'Dessert'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Ingrédients</h2>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nom de l'ingrédient"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={ingredient.quantity || ''}
                    onChange={(e) =>
                      handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)
                    }
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="pcs">pcs</option>
                    <option value="cup">tasse</option>
                    <option value="tbsp">c. à soupe</option>
                  </select>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Instructions</h2>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold mt-2">
                    {index + 1}
                  </div>
                  <textarea
                    placeholder="Décrivez cette étape..."
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations nutritionnelles (optionnel)</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                <input
                  type="number"
                  value={calories || ''}
                  onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protéines (g)</label>
                <input
                  type="number"
                  value={protein || ''}
                  onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Glucides (g)</label>
                <input
                  type="number"
                  value={carbs || ''}
                  onChange={(e) => setCarbs(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lipides (g)</label>
                <input
                  type="number"
                  value={fat || ''}
                  onChange={(e) => setFat(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fibres (g)</label>
                <input
                  type="number"
                  value={fiber || ''}
                  onChange={(e) => setFiber(e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Tags and Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tags et notes</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        type="button"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes personnelles
                </label>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  rows={4}
                  placeholder="Ajoutez vos propres notes, astuces ou modifications..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/recipes"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder la recette'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
