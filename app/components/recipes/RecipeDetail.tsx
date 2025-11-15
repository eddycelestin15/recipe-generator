'use client';

import { Recipe } from '@/app/lib/types/recipe';
import { Clock, Users, Flame, Star, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RecipeDetailProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function RecipeDetail({ recipe, onToggleFavorite, onDelete, onEdit }: RecipeDetailProps) {
  const router = useRouter();

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  const difficultyLabels = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  };

  const handleDelete = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      onDelete(recipe.id);
      router.push('/recipes');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour aux recettes</span>
      </Link>

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* Hero Image */}
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-64 md:h-96 object-cover"
          />
        ) : (
          <div className="w-full h-64 md:h-96 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Flame className="w-24 h-24 text-white opacity-50" />
          </div>
        )}

        {/* Title and Actions */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
              <p className="text-gray-600">{recipe.description}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onToggleFavorite(recipe.id)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-6 h-6 ${
                    recipe.isFavorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-400'
                  }`}
                />
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(recipe.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Edit recipe"
                >
                  <Edit className="w-6 h-6 text-gray-600" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-50 rounded-lg"
                aria-label="Delete recipe"
              >
                <Trash2 className="w-6 h-6 text-red-600" />
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-500">Préparation</div>
                <div className="font-semibold">{recipe.prepTime} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-500">Cuisson</div>
                <div className="font-semibold">{recipe.cookTime} min</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-500">Portions</div>
                <div className="font-semibold">{recipe.servings}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-sm text-gray-500">Calories</div>
                <div className="font-semibold">{recipe.nutritionInfo.calories}</div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[recipe.difficulty]}`}>
              {difficultyLabels[recipe.difficulty]}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {recipe.cuisineType}
            </span>
            {recipe.mealType.map((type) => (
              <span key={type} className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {type}
              </span>
            ))}
            {recipe.isGenerated && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                IA Générée
              </span>
            )}
            {recipe.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Ingredients */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ingrédients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-900">
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </span>
                    {ingredient.optional && (
                      <span className="text-sm text-gray-500 ml-1">(optionnel)</span>
                    )}
                    {ingredient.alternative && (
                      <div className="text-sm text-gray-500 mt-1">
                        Alternative: {ingredient.alternative}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Nutrition Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Informations nutritionnelles</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{recipe.nutritionInfo.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protéines</span>
                  <span className="font-medium">{recipe.nutritionInfo.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Glucides</span>
                  <span className="font-medium">{recipe.nutritionInfo.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lipides</span>
                  <span className="font-medium">{recipe.nutritionInfo.fat}g</span>
                </div>
                {recipe.nutritionInfo.fiber !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fibres</span>
                    <span className="font-medium">{recipe.nutritionInfo.fiber}g</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-700 pt-1">{step}</p>
                </li>
              ))}
            </ol>

            {/* Personal Notes */}
            {recipe.personalNotes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Notes personnelles</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{recipe.personalNotes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <div className="flex flex-wrap gap-4">
                {recipe.generatedDate && (
                  <div>
                    Générée le {new Date(recipe.generatedDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
                <div>
                  Créée le {new Date(recipe.createdDate).toLocaleDateString('fr-FR')}
                </div>
                {recipe.lastModifiedDate && (
                  <div>
                    Modifiée le {new Date(recipe.lastModifiedDate).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
