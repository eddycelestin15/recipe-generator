/**
 * AI Insights Service
 *
 * Uses Gemini AI to generate personalized health insights and recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WeeklyInsights } from '../types/health-dashboard';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export class AIInsightsService {
  /**
   * Generate weekly insights using Gemini AI
   */
  static async generateWeeklyInsights(weekData: {
    period: string;
    avgCalories: number;
    avgProtein: number;
    workoutsDone: number;
    compliance: number;
    weightChange: number;
  }): Promise<WeeklyInsights> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Analyse ces données utilisateur de la semaine (${weekData.period}):

- Calories moyennes: ${weekData.avgCalories} cal/jour
- Protéines moyennes: ${weekData.avgProtein}g/jour
- Entraînements complétés: ${weekData.workoutsDone} fois
- Conformité aux objectifs: ${weekData.compliance}%
- Changement de poids: ${weekData.weightChange > 0 ? '+' : ''}${weekData.weightChange} kg

Génère une analyse JSON avec cette structure exacte:
{
  "summary": "Un résumé de la semaine en 1 phrase",
  "highlights": ["3 points positifs"],
  "concerns": ["2 points à améliorer"],
  "suggestions": ["3 suggestions concrètes"],
  "motivationalMessage": "Un message motivant personnalisé"
}

Règles:
- Ton encourageant et personnalisé
- Suggestions concrètes et actionnables
- Pas de jargon médical compliqué
- Si les données sont excellentes, félicite l'utilisateur
- Si les données sont faibles, sois encourageant et constructif
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const insights = JSON.parse(jsonMatch[0]);

      return {
        period: weekData.period,
        summary: insights.summary || 'Semaine complétée',
        highlights: insights.highlights || [],
        concerns: insights.concerns || [],
        suggestions: insights.suggestions || [],
        motivationalMessage:
          insights.motivationalMessage || 'Continue comme ça !',
      };
    } catch (error) {
      console.error('Error generating AI insights:', error);

      // Return fallback insights
      return this.getFallbackInsights(weekData);
    }
  }

  /**
   * Get fallback insights when AI is unavailable
   */
  private static getFallbackInsights(weekData: {
    period: string;
    avgCalories: number;
    avgProtein: number;
    workoutsDone: number;
    compliance: number;
    weightChange: number;
  }): WeeklyInsights {
    const highlights: string[] = [];
    const concerns: string[] = [];
    const suggestions: string[] = [];

    // Analyze compliance
    if (weekData.compliance >= 80) {
      highlights.push(`Excellente conformité de ${weekData.compliance}% cette semaine !`);
    } else if (weekData.compliance >= 60) {
      highlights.push(`Bonne conformité de ${weekData.compliance}%`);
    } else {
      concerns.push(`Conformité de ${weekData.compliance}% - il y a de la marge d'amélioration`);
      suggestions.push('Essayez de logger vos repas plus régulièrement');
    }

    // Analyze workouts
    if (weekData.workoutsDone >= 4) {
      highlights.push(`${weekData.workoutsDone} entraînements cette semaine - excellent !`);
    } else if (weekData.workoutsDone >= 2) {
      highlights.push(`${weekData.workoutsDone} entraînements complétés`);
    } else {
      concerns.push(`Seulement ${weekData.workoutsDone} entraînement(s) cette semaine`);
      suggestions.push('Visez au moins 3 sessions d\'entraînement par semaine');
    }

    // Analyze protein
    if (weekData.avgProtein >= 100) {
      highlights.push(`Apport protéique solide: ${weekData.avgProtein}g/jour en moyenne`);
    } else if (weekData.avgProtein < 80) {
      concerns.push(`Apport protéique un peu faible: ${weekData.avgProtein}g/jour`);
      suggestions.push('Augmentez votre consommation de protéines (viandes, poissons, légumineuses)');
    }

    // Analyze weight change
    if (Math.abs(weekData.weightChange) < 0.1) {
      highlights.push('Poids stable cette semaine');
    } else if (weekData.weightChange < -0.5 && weekData.weightChange > -1) {
      highlights.push(`Perte de poids saine: ${Math.abs(weekData.weightChange)}kg`);
    } else if (weekData.weightChange < -1) {
      concerns.push(`Perte de poids rapide: ${Math.abs(weekData.weightChange)}kg`);
      suggestions.push('Assurez-vous de ne pas trop restreindre vos calories');
    }

    // Add general suggestions if needed
    if (suggestions.length === 0) {
      suggestions.push('Continuez vos bonnes habitudes !');
      suggestions.push('Pensez à bien vous hydrater (2L d\'eau/jour)');
    }

    let summary = '';
    if (weekData.compliance >= 70 && weekData.workoutsDone >= 3) {
      summary = 'Excellente semaine avec une bonne conformité et de l\'activité régulière !';
    } else if (weekData.compliance >= 50) {
      summary = 'Semaine correcte avec quelques opportunités d\'amélioration';
    } else {
      summary = 'Semaine difficile, mais chaque jour est une nouvelle opportunité';
    }

    let motivationalMessage = '';
    if (weekData.compliance >= 80) {
      motivationalMessage = '🎉 Incroyable ! Vous êtes sur la bonne voie. Continuez ainsi !';
    } else if (weekData.compliance >= 60) {
      motivationalMessage = '💪 Bon travail ! Quelques ajustements et vous serez au top !';
    } else {
      motivationalMessage =
        '🌟 Ne vous découragez pas ! Chaque petit progrès compte. Vous pouvez le faire !';
    }

    return {
      period: weekData.period,
      summary,
      highlights: highlights.slice(0, 3),
      concerns: concerns.slice(0, 2),
      suggestions: suggestions.slice(0, 3),
      motivationalMessage,
    };
  }

  /**
   * Generate nutrition advice based on current stats
   */
  static async generateNutritionAdvice(data: {
    avgCalories: number;
    goalCalories: number;
    avgProtein: number;
    goalProtein: number;
  }): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
Données nutritionnelles:
- Calories actuelles: ${data.avgCalories} cal/jour (objectif: ${data.goalCalories})
- Protéines actuelles: ${data.avgProtein}g/jour (objectif: ${data.goalProtein}g)

Génère 3 conseils nutritionnels concrets et actionnables en format JSON:
{
  "advice": ["conseil 1", "conseil 2", "conseil 3"]
}

Les conseils doivent être:
- Spécifiques et actionnables
- Adaptés aux écarts constatés
- Positifs et encourageants
- Courts (max 15 mots par conseil)

Retourne UNIQUEMENT le JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.advice || [];
    } catch (error) {
      console.error('Error generating nutrition advice:', error);

      // Fallback advice
      const advice: string[] = [];

      if (data.avgCalories < data.goalCalories * 0.9) {
        advice.push('Ajoutez une collation saine entre les repas');
      } else if (data.avgCalories > data.goalCalories * 1.1) {
        advice.push('Contrôlez vos portions et limitez les snacks');
      }

      if (data.avgProtein < data.goalProtein * 0.9) {
        advice.push('Incluez une source de protéine à chaque repas');
      }

      advice.push('Variez votre alimentation pour plus de nutriments');

      return advice;
    }
  }

  /**
   * Generate workout motivation message
   */
  static async generateWorkoutMotivation(workoutsThisWeek: number): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
L'utilisateur a fait ${workoutsThisWeek} entraînement(s) cette semaine.

Génère UN message motivationnel court (max 20 mots) pour l'encourager à continuer ou à se dépasser.
Le message doit être:
- Positif et énergique
- Adapté au nombre d'entraînements
- Avec un emoji pertinent au début

Réponds UNIQUEMENT avec le message, sans guillemets ni formatage JSON.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating workout motivation:', error);

      // Fallback messages
      if (workoutsThisWeek >= 4) {
        return '🔥 Incroyable ! Vous écrasez vos objectifs cette semaine !';
      } else if (workoutsThisWeek >= 2) {
        return '💪 Bon rythme ! Encore un effort et la semaine est parfaite !';
      } else {
        return '🌟 Il n\'est jamais trop tard ! Planifiez votre prochain workout !';
      }
    }
  }
}
