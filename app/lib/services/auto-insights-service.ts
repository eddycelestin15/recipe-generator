/**
 * Auto Insights Service
 *
 * Automatically generates insights based on user data
 * Runs periodically to detect deficiencies, patterns, and achievements
 */

import { DailyNutritionRepository } from '../repositories/daily-nutrition-repository';
import { NutritionGoalsRepository } from '../repositories/nutrition-goals-repository';
import { WorkoutLogRepository } from '../repositories/workout-log-repository';
import { AIInsightRepository } from '../repositories/ai-insight-repository';
import type { CreateInsightDTO } from '../types/ai';

const LAST_CHECK_KEY = 'auto_insights_last_check';
const CHECK_INTERVAL_HOURS = 24; // Run once per day

export class AutoInsightsService {
  /**
   * Check if we should run auto insights
   */
  static shouldRun(): boolean {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    if (!lastCheck) return true;

    const lastCheckDate = new Date(lastCheck);
    const now = new Date();
    const hoursSinceLastCheck =
      (now.getTime() - lastCheckDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastCheck >= CHECK_INTERVAL_HOURS;
  }

  /**
   * Mark that we ran auto insights
   */
  private static markAsRun(): void {
    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  }

  /**
   * Run all automatic insight checks
   */
  static async runAutoInsights(): Promise<number> {
    if (!this.shouldRun()) {
      return 0;
    }

    let insightsCreated = 0;

    try {
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const dailyNutrition = DailyNutritionRepository.getByDateRange(
        startDate,
        endDate
      );

      if (dailyNutrition.length < 3) {
        // Not enough data
        return 0;
      }

      const goals = NutritionGoalsRepository.get();
      if (!goals) return 0;

      // Calculate averages
      const avgCalories =
        dailyNutrition.reduce((sum, d) => sum + d.totalCalories, 0) /
        dailyNutrition.length;
      const avgProtein =
        dailyNutrition.reduce((sum, d) => sum + d.totalProtein, 0) /
        dailyNutrition.length;
      const avgFiber =
        dailyNutrition.reduce((sum, d) => sum + d.totalFiber, 0) /
        dailyNutrition.length;

      // Check for protein deficiency
      if (avgProtein < goals.dailyProtein * 0.7) {
        const daysLow = dailyNutrition.filter(
          (d) => d.totalProtein < goals.dailyProtein * 0.7
        ).length;

        if (daysLow >= 3) {
          const insight: CreateInsightDTO = {
            type: 'alert',
            priority: 'high',
            title: 'Protéines insuffisantes',
            message: `Votre apport protéique moyen est de ${Math.round(avgProtein)}g/jour, en-dessous de votre objectif de ${goals.dailyProtein}g. Augmentez votre consommation de viandes, poissons, œufs ou légumineuses.`,
            actionable: 'Voir des recettes riches en protéines',
            actionLink: '/recipes?filter=high-protein',
          };

          AIInsightRepository.create(insight);
          insightsCreated++;
        }
      }

      // Check for fiber deficiency
      if (avgFiber < 20) {
        const insight: CreateInsightDTO = {
          type: 'suggestion',
          priority: 'medium',
          title: 'Augmentez vos fibres',
          message: `Votre apport en fibres est faible (${Math.round(avgFiber)}g/jour). Visez au moins 25g par jour en ajoutant plus de légumes, fruits et céréales complètes.`,
          actionable: 'Recettes riches en fibres',
          actionLink: '/recipes',
        };

        AIInsightRepository.create(insight);
        insightsCreated++;
      }

      // Check for calorie excess/deficit
      const calorieDeviation = avgCalories - goals.dailyCalories;
      if (Math.abs(calorieDeviation) > 300) {
        const insight: CreateInsightDTO = {
          type: calorieDeviation > 0 ? 'alert' : 'suggestion',
          priority: Math.abs(calorieDeviation) > 500 ? 'high' : 'medium',
          title:
            calorieDeviation > 0
              ? 'Calories au-dessus de l\'objectif'
              : 'Calories en-dessous de l\'objectif',
          message:
            calorieDeviation > 0
              ? `Vous consommez en moyenne ${Math.round(Math.abs(calorieDeviation))} calories de plus que votre objectif quotidien.`
              : `Vous consommez en moyenne ${Math.round(Math.abs(calorieDeviation))} calories de moins que votre objectif quotidien.`,
          actionable: 'Voir mes objectifs',
          actionLink: '/nutrition',
        };

        AIInsightRepository.create(insight);
        insightsCreated++;
      }

      // Check workout streak
      const workouts = WorkoutLogRepository.getByDateRange(startDate, endDate);
      if (workouts.length >= 5) {
        const insight: CreateInsightDTO = {
          type: 'achievement',
          priority: 'low',
          title: 'Streak d\'entraînement !',
          message: `Incroyable ! Vous avez fait ${workouts.length} entraînements cette semaine. Continuez comme ça !`,
        };

        AIInsightRepository.create(insight);
        insightsCreated++;
      } else if (workouts.length <= 1 && dailyNutrition.length >= 5) {
        const insight: CreateInsightDTO = {
          type: 'suggestion',
          priority: 'medium',
          title: 'Manque d\'activité physique',
          message: `Vous n'avez fait que ${workouts.length} entraînement(s) cette semaine. L'exercice régulier est important pour atteindre vos objectifs.`,
          actionable: 'Voir les entraînements',
          actionLink: '/fitness',
        };

        AIInsightRepository.create(insight);
        insightsCreated++;
      }

      // Check tracking consistency
      if (dailyNutrition.length >= 6) {
        const insight: CreateInsightDTO = {
          type: 'achievement',
          priority: 'low',
          title: 'Excellent suivi !',
          message: `Bravo ! Vous avez tracké vos repas ${dailyNutrition.length} jours sur 7 cette semaine. La constance est la clé du succès !`,
        };

        AIInsightRepository.create(insight);
        insightsCreated++;
      }

      // Nutrition balance tip
      const proteinPercentage = (avgProtein * 4) / avgCalories;
      const carbsPercentage =
        (dailyNutrition.reduce((sum, d) => sum + d.totalCarbs, 0) /
          dailyNutrition.length) *
        4 /
        avgCalories;

      if (proteinPercentage < 0.2) {
        const insight: CreateInsightDTO = {
          type: 'tip',
          priority: 'low',
          title: 'Conseil nutritionnel',
          message:
            'Vos protéines représentent moins de 20% de vos calories. Essayez d\'inclure une source de protéines à chaque repas pour plus de satiété et de récupération musculaire.',
          actionable: 'En savoir plus',
          actionLink: '/nutrition',
        };

        AIInsightRepository.create(insight);
        insightsCreated++;
      }

      this.markAsRun();
    } catch (error) {
      console.error('Error running auto insights:', error);
    }

    return insightsCreated;
  }

  /**
   * Initialize auto insights on app load
   */
  static initialize(): void {
    // Run immediately if needed
    this.runAutoInsights();

    // Set up periodic check (every hour)
    setInterval(() => {
      this.runAutoInsights();
    }, 60 * 60 * 1000); // 1 hour
  }
}
