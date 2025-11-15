import { Achievement } from '../types/habits';

const STORAGE_KEY = 'achievements';

/**
 * Predefined achievements
 */
export const PREDEFINED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_habit',
    name: 'Premier pas',
    description: 'Complète ta première habitude',
    iconEmoji: '🎯',
    requirement: 'first_habit',
    points: 10,
    category: 'milestone',
  },
  {
    id: '7_day_streak',
    name: 'Semaine parfaite',
    description: '7 jours consécutifs sur une habitude',
    iconEmoji: '🔥',
    requirement: '7_day_streak',
    points: 50,
    category: 'streak',
  },
  {
    id: '30_day_streak',
    name: 'Marathonien',
    description: '30 jours consécutifs sur une habitude',
    iconEmoji: '🏆',
    requirement: '30_day_streak',
    points: 200,
    category: 'streak',
  },
  {
    id: '100_day_streak',
    name: 'Centenaire',
    description: '100 jours consécutifs sur une habitude',
    iconEmoji: '💎',
    requirement: '100_day_streak',
    points: 500,
    category: 'streak',
  },
  {
    id: 'morning_routine_7',
    name: 'Lève-tôt',
    description: 'Routine du matin complétée 7 jours consécutifs',
    iconEmoji: '🌅',
    requirement: 'morning_routine_7',
    points: 30,
    category: 'routine',
  },
  {
    id: 'evening_routine_7',
    name: 'Couche-tôt',
    description: 'Routine du soir complétée 7 jours consécutifs',
    iconEmoji: '🌙',
    requirement: 'evening_routine_7',
    points: 30,
    category: 'routine',
  },
  {
    id: 'perfect_week',
    name: 'Perfectionniste',
    description: '100% de compliance sur toutes les habitudes pendant 7 jours',
    iconEmoji: '⭐',
    requirement: 'perfect_week',
    points: 100,
    category: 'special',
  },
  {
    id: 'water_goal_7',
    name: 'Hydraté',
    description: 'Objectif d\'eau atteint 7 jours consécutifs',
    iconEmoji: '💧',
    requirement: 'water_goal_7',
    points: 30,
    category: 'streak',
  },
  {
    id: 'all_habits_today',
    name: 'Jour parfait',
    description: 'Toutes les habitudes complétées en un jour',
    iconEmoji: '✨',
    requirement: 'all_habits_today',
    points: 20,
    category: 'milestone',
  },
  {
    id: '10_habits_created',
    name: 'Architecte',
    description: 'Créer 10 habitudes',
    iconEmoji: '🏗️',
    requirement: '10_habits_created',
    points: 25,
    category: 'milestone',
  },
  {
    id: '100_completions',
    name: 'Centurion',
    description: 'Compléter 100 habitudes au total',
    iconEmoji: '🎖️',
    requirement: '100_completions',
    points: 75,
    category: 'milestone',
  },
  {
    id: '500_completions',
    name: 'Légendaire',
    description: 'Compléter 500 habitudes au total',
    iconEmoji: '👑',
    requirement: '500_completions',
    points: 300,
    category: 'milestone',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Compléter une habitude avant 6h du matin',
    iconEmoji: '🐦',
    requirement: 'early_bird',
    points: 15,
    category: 'special',
  },
  {
    id: 'night_owl',
    name: 'Oiseau de nuit',
    description: 'Compléter une habitude après 22h',
    iconEmoji: '🦉',
    requirement: 'night_owl',
    points: 15,
    category: 'special',
  },
  {
    id: 'comeback',
    name: 'Retour en force',
    description: 'Reprendre une habitude après une pause de 7 jours',
    iconEmoji: '💪',
    requirement: 'comeback',
    points: 40,
    category: 'special',
  },
];

export class AchievementRepository {
  /**
   * Get all predefined achievements
   */
  static getAll(): Achievement[] {
    return PREDEFINED_ACHIEVEMENTS;
  }

  /**
   * Get achievement by ID
   */
  static getById(id: string): Achievement | null {
    return PREDEFINED_ACHIEVEMENTS.find(a => a.id === id) || null;
  }

  /**
   * Get achievements by category
   */
  static getByCategory(category: Achievement['category']): Achievement[] {
    return PREDEFINED_ACHIEVEMENTS.filter(a => a.category === category);
  }

  /**
   * Get achievements by requirement
   */
  static getByRequirement(requirement: string): Achievement[] {
    return PREDEFINED_ACHIEVEMENTS.filter(a => a.requirement === requirement);
  }

  /**
   * Initialize achievements in localStorage (seed)
   */
  static seed(): void {
    if (typeof window === 'undefined') return;

    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PREDEFINED_ACHIEVEMENTS));
    }
  }
}
