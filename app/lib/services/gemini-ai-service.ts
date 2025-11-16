/**
 * Gemini AI Service
 *
 * Advanced AI service for nutritionist chat, photo analysis, and insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  ChatContext,
  IdentifiedFood,
  TotalEstimated,
  WeeklyAnalysisData,
  WeeklyAnalysisResult,
  MealInsight,
} from '../types/ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiAIService {
  /**
   * Generate context-aware nutritionist chat response
   */
  static async generateChatResponse(
    userMessage: string,
    context: ChatContext,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const contextPrompt = `Tu es un nutritionniste expert IA. Voici le profil de l'utilisateur:

${context.currentWeight ? `Poids actuel: ${context.currentWeight} kg` : ''}
${context.goalWeight ? `Objectif de poids: ${context.goalWeight} kg` : ''}
${context.goalCalories ? `Objectif calorique: ${context.goalCalories} cal/jour` : ''}
${context.todayCalories !== undefined ? `Calories aujourd'hui: ${context.todayCalories} cal` : ''}
${context.goalProtein ? `Objectif protéines: ${context.goalProtein}g/jour` : ''}
${context.todayProtein !== undefined ? `Protéines aujourd'hui: ${context.todayProtein}g` : ''}
${context.weeklyWorkouts !== undefined ? `Entraînements cette semaine: ${context.weeklyWorkouts}` : ''}
${context.dietType ? `Type de diète: ${context.dietType}` : ''}
${context.goalType ? `Objectif: ${context.goalType}` : ''}

Historique récent de conversation:
${conversationHistory.slice(-4).map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

L'utilisateur demande: "${userMessage}"

Réponds de manière personnalisée, encourageante et basée sur ses données.
Sois concis (max 150 mots) et actionnable.
Si la question concerne la nutrition, donne des conseils spécifiques.
Si l'utilisateur partage un succès, félicite-le chaleureusement.
Si l'utilisateur rencontre des difficultés, sois empathique et constructif.`;

      const result = await model.generateContent(contextPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating chat response:', error);

      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      // Check if it's an API key error
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Service de chat IA non configuré. Veuillez contacter l\'administrateur.');
      }

      return "Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?";
    }
  }

  /**
   * Analyze food photo using Gemini Vision
   */
  static async analyzePhotoFood(imageBase64: string): Promise<{
    identifiedFoods: IdentifiedFood[];
    totalEstimated: TotalEstimated;
    overallAssessment: string;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyse cette photo de repas.
Identifie chaque aliment visible avec:
- Nom de l'aliment
- Portion estimée (ex: "150g", "1 tasse", "1 unité")
- Calories approximatives
- Protéines approximatives (en grammes)
- Glucides approximatifs (en grammes)
- Lipides approximatifs (en grammes)
- Niveau de confiance (0.0 à 1.0)

Ensuite, donne une évaluation globale du repas (équilibré, trop riche, etc.)

Format ta réponse UNIQUEMENT en JSON avec cette structure exacte:
{
  "foods": [
    {
      "name": "nom de l'aliment",
      "portion": "quantité estimée",
      "confidence": 0.8,
      "estimatedCalories": 200,
      "estimatedProtein": 15,
      "estimatedCarbs": 25,
      "estimatedFat": 8
    }
  ],
  "totalEstimated": {
    "calories": 500,
    "protein": 30,
    "carbs": 60,
    "fat": 20
  },
  "overallAssessment": "phrase courte sur l'équilibre du repas"
}

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        identifiedFoods: analysis.foods || [],
        totalEstimated: analysis.totalEstimated || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        overallAssessment: analysis.overallAssessment || 'Repas analysé',
      };
    } catch (error) {
      console.error('Error analyzing photo:', error);

      // Fallback response
      return {
        identifiedFoods: [],
        totalEstimated: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
        overallAssessment: 'Impossible d\'analyser cette image pour le moment.',
      };
    }
  }

  /**
   * Generate weekly analysis report
   */
  static async generateWeeklyAnalysis(data: WeeklyAnalysisData): Promise<WeeklyAnalysisResult> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyse la semaine nutritionnelle de cet utilisateur:

Période: ${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}

Objectifs quotidiens:
- Calories: ${data.goalCalories} cal/jour
- Protéines: ${data.goalProtein}g/jour
- Glucides: ${data.goalCarbs}g/jour
- Lipides: ${data.goalFat}g/jour

Réalité cette semaine:
- Calories moyennes: ${data.avgCalories} cal/jour
- Protéines moyennes: ${data.avgProtein}g/jour
- Glucides moyens: ${data.avgCarbs}g/jour
- Lipides moyens: ${data.avgFat}g/jour
- Entraînements: ${data.workoutsDone} fois
- Jours trackés: ${data.daysTracked}/7

Génère une analyse JSON avec cette structure exacte:
{
  "complianceScore": 85,
  "positives": ["point positif 1", "point positif 2", "point positif 3"],
  "improvements": [
    {"issue": "problème identifié", "action": "action concrète à prendre"},
    {"issue": "problème identifié 2", "action": "action concrète à prendre 2"}
  ],
  "insight": "un insight nutritionnel surprenant ou intéressant basé sur les données",
  "motivationalMessage": "message motivant personnalisé"
}

Règles:
- Le complianceScore doit être entre 0 et 100
- Exactement 3 points positifs
- Exactement 2 axes d'amélioration avec actions concrètes
- 1 insight intéressant ou surprenant
- Message motivationnel adapté aux résultats
- Ton encourageant et constructif
- Retourne UNIQUEMENT le JSON`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        complianceScore: analysis.complianceScore || 0,
        positives: analysis.positives || [],
        improvements: analysis.improvements || [],
        insight: analysis.insight || '',
        motivationalMessage: analysis.motivationalMessage || 'Continuez vos efforts !',
      };
    } catch (error) {
      console.error('Error generating weekly analysis:', error);
      return this.getFallbackWeeklyAnalysis(data);
    }
  }

  /**
   * Fallback weekly analysis when AI fails
   */
  private static getFallbackWeeklyAnalysis(data: WeeklyAnalysisData): WeeklyAnalysisResult {
    const calorieDiff = data.avgCalories - data.goalCalories;
    const proteinDiff = data.avgProtein - data.goalProtein;

    const positives: string[] = [];
    const improvements: Array<{ issue: string; action: string }> = [];

    // Analyze compliance
    if (data.daysTracked >= 6) {
      positives.push(`Excellent suivi: ${data.daysTracked} jours sur 7 trackés !`);
    }

    if (Math.abs(calorieDiff) < 100) {
      positives.push('Calories parfaitement maîtrisées cette semaine');
    }

    if (data.workoutsDone >= 3) {
      positives.push(`${data.workoutsDone} entraînements complétés - super !`);
    }

    // Calculate compliance score
    let score = 50;
    score += data.daysTracked * 5;
    score += Math.min(data.workoutsDone * 5, 15);
    if (Math.abs(calorieDiff) < 200) score += 10;
    if (Math.abs(proteinDiff) < 20) score += 10;

    if (calorieDiff > 200) {
      improvements.push({
        issue: 'Calories au-dessus de l\'objectif',
        action: 'Réduisez les portions ou limitez les snacks',
      });
    } else if (calorieDiff < -200) {
      improvements.push({
        issue: 'Calories en-dessous de l\'objectif',
        action: 'Ajoutez une collation saine dans la journée',
      });
    }

    if (proteinDiff < -10) {
      improvements.push({
        issue: 'Apport protéique insuffisant',
        action: 'Incluez une source de protéines à chaque repas',
      });
    }

    // Fill in positives if needed
    if (positives.length < 3) {
      positives.push('Vous continuez à tracker vos repas régulièrement');
    }

    // Fill in improvements if needed
    if (improvements.length < 2) {
      improvements.push({
        issue: 'Continuez sur cette lancée',
        action: 'Maintenez vos bonnes habitudes alimentaires',
      });
    }

    return {
      complianceScore: Math.min(Math.max(score, 0), 100),
      positives: positives.slice(0, 3),
      improvements: improvements.slice(0, 2),
      insight: `Votre apport calorique moyen est ${calorieDiff > 0 ? 'supérieur' : 'inférieur'} de ${Math.abs(Math.round(calorieDiff))} calories par jour à votre objectif`,
      motivationalMessage:
        score >= 80
          ? '🎉 Excellente semaine ! Vous êtes sur la bonne voie !'
          : score >= 60
          ? '💪 Bon travail ! Quelques ajustements et ce sera parfait !'
          : '🌟 Chaque jour est une opportunité de progression !',
    };
  }

  /**
   * Generate meal insight before eating
   */
  static async generateMealInsightBefore(
    mealCalories: number,
    mealProtein: number,
    dailyGoalCalories: number,
    currentCaloriesToday: number,
    avgMealCalories: number
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const percentageOfDaily = ((mealCalories / dailyGoalCalories) * 100).toFixed(0);
      const comparisonNum = ((mealCalories - avgMealCalories) / avgMealCalories * 100);
      const comparisonToAvg = comparisonNum.toFixed(0);

      const prompt = `Ce repas:
- ${mealCalories} calories
- ${mealProtein}g de protéines

Contexte utilisateur:
- Objectif quotidien: ${dailyGoalCalories} cal
- Consommé aujourd'hui: ${currentCaloriesToday} cal
- Moyenne par repas: ${avgMealCalories} cal

Ce repas représente ${percentageOfDaily}% de l'objectif quotidien.
Il est ${comparisonNum > 0 ? '+' : ''}${comparisonToAvg}% par rapport à la moyenne.

Génère UN message court (max 30 mots) pour informer l'utilisateur AVANT qu'il mange.
Le message doit être:
- Informatif et utile
- Ni moralisateur ni négatif
- Adapté au contexte (si proche de l'objectif, si le repas est plus/moins calorique que d'habitude)

Réponds UNIQUEMENT avec le message, sans guillemets.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating meal insight:', error);
      const percentage = ((mealCalories / dailyGoalCalories) * 100).toFixed(0);
      return `Ce repas représente ${percentage}% de votre objectif quotidien.`;
    }
  }

  /**
   * Detect deficiencies and generate alerts
   */
  static async detectDeficiencies(data: {
    avgProtein: number;
    goalProtein: number;
    avgFiber: number;
    goalFiber: number;
    daysLow: number;
  }): Promise<Array<{ title: string; message: string; severity: 'low' | 'medium' | 'high' }>> {
    const alerts: Array<{ title: string; message: string; severity: 'low' | 'medium' | 'high' }> = [];

    // Protein deficiency
    if (data.avgProtein < data.goalProtein * 0.7 && data.daysLow >= 3) {
      alerts.push({
        title: 'Alerte: Protéines insuffisantes',
        message: `Vos protéines sont en-dessous de ${data.goalProtein}g depuis ${data.daysLow} jours. Augmentez votre consommation de viandes, poissons, œufs ou légumineuses.`,
        severity: 'high',
      });
    } else if (data.avgProtein < data.goalProtein * 0.85 && data.daysLow >= 5) {
      alerts.push({
        title: 'Protéines un peu faibles',
        message: `Essayez d'atteindre votre objectif de ${data.goalProtein}g de protéines par jour.`,
        severity: 'medium',
      });
    }

    // Fiber deficiency
    if (data.avgFiber < data.goalFiber * 0.5 && data.daysLow >= 5) {
      alerts.push({
        title: 'Alerte: Fibres insuffisantes',
        message: `Vos fibres sont très faibles. Ajoutez plus de légumes, fruits et céréales complètes à vos repas.`,
        severity: 'high',
      });
    }

    return alerts;
  }

  /**
   * Generate recipe suggestions to compensate deficiencies
   */
  static async suggestRecipesForDeficiency(
    deficiencyType: 'protein' | 'fiber' | 'vegetables',
    currentAvg: number,
    goal: number
  ): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const deficiencyMap = {
        protein: 'protéines',
        fiber: 'fibres',
        vegetables: 'légumes',
      };

      const prompt = `L'utilisateur manque de ${deficiencyMap[deficiencyType]}.
Moyenne actuelle: ${currentAvg}g/jour
Objectif: ${goal}g/jour

Suggère 3 recettes ou aliments simples pour combler cette carence.
Format JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Chaque suggestion doit être:
- Concrète et facile à intégrer
- Riche en ${deficiencyMap[deficiencyType]}
- Variée (pas 3x la même chose)
- Max 10 mots

Retourne UNIQUEMENT le JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.suggestions || [];
    } catch (error) {
      console.error('Error suggesting recipes:', error);

      // Fallback suggestions
      if (deficiencyType === 'protein') {
        return [
          'Poulet grillé avec quinoa',
          'Omelette aux légumes',
          'Salade de thon et haricots',
        ];
      } else if (deficiencyType === 'fiber') {
        return [
          'Salade de lentilles',
          'Bowl de légumes rôtis',
          'Smoothie aux fruits et graines de chia',
        ];
      }
      return [];
    }
  }
}
