'use client';

import { useState } from 'react';
import { Recipe } from '@/app/lib/types/recipe';
import { Heart, MessageCircle, Send, Bookmark, Flame, Clock, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RecipeCard({ recipe, onToggleFavorite, onDelete }: RecipeCardProps) {
  const router = useRouter();
  const t = useTranslations();
  // Optimistic UI state for favorite
  const [isFavoriteOptimistic, setIsFavoriteOptimistic] = useState(recipe.isFavorite);

  // Calculate time ago from createdDate
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } else if (diffDays > 0) {
      return t('time.daysAgo', { days: diffDays });
    } else if (diffHours > 0) {
      return t('time.hoursAgo', { hours: diffHours });
    } else if (diffMins > 0) {
      return t('time.minutesAgo', { minutes: diffMins });
    } else {
      return t('time.justNow');
    }
  };

  // Get username/chef name based on recipe
  const getChefName = () => {
    if (recipe.isGenerated) {
      return t('recipes.aiChef');
    }
    return t('recipes.chef', { cuisine: recipe.cuisineType });
  };

  // Get avatar color based on cuisine type
  const getAvatarColor = () => {
    const colors: Record<string, string> = {
      'Française': 'bg-blue-500',
      'Italienne': 'bg-green-500',
      'Japonaise': 'bg-red-500',
      'Mexicaine': 'bg-yellow-500',
      'Indienne': 'bg-orange-500',
      'Chinoise': 'bg-purple-500',
      'Thaïlandaise': 'bg-pink-500',
      'Méditerranéenne': 'bg-teal-500',
    };
    return colors[recipe.cuisineType] || 'bg-gradient-to-br from-orange-500 to-red-500';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a[data-action]')) {
      return;
    }
    router.push(`/recipes/${recipe.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI update - update immediately for smooth UX
    setIsFavoriteOptimistic(!isFavoriteOptimistic);
    // Then call the actual update
    onToggleFavorite(recipe.id);
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <article
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
      onClick={handleCardClick}
    >
      {/* Header - Instagram style */}
      <div className="flex items-center gap-3 p-3 pb-2">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full ${getAvatarColor()} flex items-center justify-center flex-shrink-0`}>
          <ChefHat className="w-5 h-5 text-white" />
        </div>

        {/* Username and time */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">{getChefName()}</div>
          <div className="text-xs text-gray-500">{getTimeAgo(recipe.createdDate)}</div>
        </div>

        {/* More options (delete) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(t('recipes.deleteConfirm'))) {
              onDelete(recipe.id);
            }
          }}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label={t('common.options')}
        >
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Image - Square aspect ratio like Instagram */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flame className="w-24 h-24 text-white opacity-50" />
          </div>
        )}

        {/* Difficulty badge overlay */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            recipe.difficulty === 'easy'
              ? 'bg-green-500/90 text-white'
              : recipe.difficulty === 'medium'
              ? 'bg-yellow-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {recipe.difficulty === 'easy' ? t('recipes.difficultyEasy') : recipe.difficulty === 'medium' ? t('recipes.difficultyMedium') : t('recipes.difficultyHard')}
          </span>
        </div>
      </div>

      {/* Action buttons - Instagram style */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          {/* Left actions */}
          <div className="flex items-center gap-4">
            {/* Like/Favorite */}
            <button
              onClick={handleFavoriteClick}
              className="group/heart hover:scale-110 transition-transform duration-200 active:scale-95"
              aria-label={isFavoriteOptimistic ? t('recipes.removeFromFavorites') : t('recipes.addToFavorites')}
            >
              <Heart
                className={`w-7 h-7 transition-all duration-200 ${
                  isFavoriteOptimistic
                    ? 'fill-red-500 text-red-500 animate-pulse'
                    : 'text-gray-800 group-hover/heart:text-gray-500'
                }`}
              />
            </button>

            {/* Comment (shows number of steps) */}
            <button
              className="hover:scale-110 transition-transform duration-200 relative"
              aria-label={t('recipes.recipeSteps')}
            >
              <MessageCircle className="w-7 h-7 text-gray-800 hover:text-gray-500 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {recipe.steps.length}
              </span>
            </button>

            {/* Share */}
            <button
              className="hover:scale-110 transition-transform duration-200"
              aria-label={t('recipes.shareRecipe')}
            >
              <Send className="w-7 h-7 text-gray-800 hover:text-gray-500 transition-colors" />
            </button>
          </div>

          {/* Right action - Bookmark/Save */}
          <button
            onClick={handleFavoriteClick}
            className="hover:scale-110 transition-transform duration-200 active:scale-95"
            aria-label={t('recipes.saveRecipe')}
          >
            <Bookmark
              className={`w-7 h-7 transition-all duration-200 ${
                isFavoriteOptimistic
                  ? 'fill-gray-800 text-gray-800'
                  : 'text-gray-800 hover:text-gray-500'
              }`}
            />
          </button>
        </div>

        {/* Nutrition Pills - Colorful and prominent */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{recipe.nutritionInfo.calories} {t('nutrition.cal')}</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
            <span className="text-xs font-semibold">{recipe.nutritionInfo.protein}g {t('nutrition.protein')}</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
            <span className="text-xs font-semibold">{recipe.nutritionInfo.carbs}g {t('nutrition.carbs')}</span>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm">
            <span className="text-xs font-semibold">{recipe.nutritionInfo.fat}g {t('nutrition.fat')}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{totalTime} {t('time.min')}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-base">
          {recipe.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
          {recipe.description}
        </p>

        {/* Tags - Hashtag style */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 4 && (
              <span className="text-xs font-medium text-gray-500">
                +{recipe.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
