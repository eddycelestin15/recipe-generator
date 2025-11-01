'use client';

import { useState } from 'react';
import RecipeDisplay from './components/RecipeDisplay';

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
  difficulty: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState<string>('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe(null);
    setImagePrompt('');

    try {
      // Step 1: Generate recipe with ChatGPT
      const ingredientList = ingredients
        .split(',')
        .map((ing) => ing.trim())
        .filter((ing) => ing.length > 0);

      const recipeResponse = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientList }),
      });

      if (!recipeResponse.ok) {
        throw new Error('Failed to generate recipe');
      }

      const recipeData = await recipeResponse.json();
      setRecipe(recipeData.recipe);

      // Step 2: Generate image prompt with Gemini AI
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeTitle: recipeData.recipe.title,
          recipeDescription: recipeData.recipe.description,
        }),
      });

      if (!imageResponse.ok) {
        console.error('Failed to generate image prompt');
      } else {
        const imageData = await imageResponse.json();
        setImagePrompt(imageData.imagePrompt);
      }
    } catch (err) {
      setError('An error occurred while generating the recipe. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            AI Recipe Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your ingredients and let AI create a delicious recipe for you!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label
              htmlFor="ingredients"
              className="block text-gray-700 font-semibold mb-3 text-lg"
            >
              Enter Ingredients (comma-separated)
            </label>
            <textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken, tomatoes, garlic, pasta, olive oil"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors resize-none h-32 text-gray-800"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerateRecipe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating Recipe...
              </span>
            ) : (
              'Generate Recipe'
            )}
          </button>
        </div>

        {recipe && (
          <RecipeDisplay recipe={recipe} imagePrompt={imagePrompt} />
        )}
      </div>
    </main>
  );
}
