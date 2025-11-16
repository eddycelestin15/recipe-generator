'use client';


import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RecipeRepository } from '@/app/lib/repositories/recipe-repository';
import { Recipe } from '@/app/lib/types/recipe';
import RecipeDetail from '@/app/components/recipes/RecipeDetail';

// Force dynamic rendering - this page uses localStorage
export const dynamic = 'force-dynamic';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  const loadRecipe = () => {
    if (typeof params.id === 'string') {
      const foundRecipe = RecipeRepository.getById(params.id);
      setRecipe(foundRecipe);
      setLoading(false);

      if (!foundRecipe) {
        // Recipe not found, redirect to recipes page after a short delay
        setTimeout(() => {
          router.push('/recipes');
        }, 2000);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    RecipeRepository.toggleFavorite(id);
    loadRecipe();
  };

  const handleDelete = (id: string) => {
    RecipeRepository.delete(id);
    router.push('/recipes');
  };

  const handleEdit = (id: string) => {
    // For now, just navigate to edit page (we'll implement this if needed)
    router.push(`/recipes/${id}/edit`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la recette...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recette introuvable</h2>
            <p className="text-gray-600 mb-6">
              La recette que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <p className="text-sm text-gray-500">Redirection vers la bibliothèque...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <RecipeDetail
        recipe={recipe}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </main>
  );
}
