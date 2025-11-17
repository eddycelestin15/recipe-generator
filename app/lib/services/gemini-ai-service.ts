/**
 * Gemini AI Service
 *
 * Advanced AI service for nutritionist chat, photo analysis, insights, and recipe generation
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
import type { FridgeItem } from '../types/fridge';
import type { GeminiRecipeResponse, RecipeFilters } from '../types/recipe';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use the latest and most capable model for recipe generation
const RECIPE_MODEL = 'gemini-2.0-flash-exp';
const CHAT_MODEL = 'gemini-1.5-flash';
const VISION_MODEL = 'gemini-1.5-flash';

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

      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

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
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

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
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

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
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

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
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

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

  /**
   * SMART RECIPE GENERATION - Generate recipe with exact fridge ingredients or smart suggestions
   */
  static async generateSmartRecipe(params: {
    ingredients: string[];
    fridgeItems?: FridgeItem[];
    mode: 'exact' | 'smart' | 'flexible';
    filters?: RecipeFilters;
    userPreferences?: {
      dietaryRestrictions?: string[];
      allergies?: string[];
      dislikedIngredients?: string[];
      servings?: number;
    };
  }): Promise<GeminiRecipeResponse> {
    try {
      const model = genAI.getGenerativeModel({ model: RECIPE_MODEL });

      // Build context based on mode
      let modeInstruction = '';
      if (params.mode === 'exact') {
        modeInstruction = `MODE STRICT: Utilise UNIQUEMENT les ingrédients fournis. Ne suggère AUCUN ingrédient supplémentaire.`;
      } else if (params.mode === 'smart') {
        const expiringItems = params.fridgeItems?.filter(item => {
          if (!item.expirationDate) return false;
          const daysUntil = Math.ceil((new Date(item.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return daysUntil >= 0 && daysUntil <= 3;
        }) || [];
        modeInstruction = `MODE SMART: PRIORISE ces ingrédients qui expirent bientôt: ${expiringItems.map(i => i.name).join(', ')}.
        Utilise-les en premier lieu. Tu peux suggérer 1-2 ingrédients de base communs si vraiment nécessaire.`;
      } else {
        modeInstruction = `MODE FLEXIBLE: Utilise principalement les ingrédients fournis mais tu peux suggérer quelques alternatives ou compléments.`;
      }

      const filtersText = params.filters ? `
Contraintes:
${params.filters.prepTime ? `- Temps de préparation maximum: ${params.filters.prepTime} minutes` : ''}
${params.filters.difficulty ? `- Difficulté: ${params.filters.difficulty}` : ''}
${params.filters.cuisineType ? `- Type de cuisine: ${params.filters.cuisineType}` : ''}
${params.filters.mealType ? `- Type de repas: ${params.filters.mealType}` : ''}
${params.filters.equipment ? `- Équipement disponible: ${params.filters.equipment.join(', ')}` : ''}
${params.filters.batchCooking ? '- IMPORTANT: Génère une recette en GRANDE QUANTITÉ (6-8 portions minimum) adaptée au meal prep' : ''}
` : '';

      const preferencesText = params.userPreferences ? `
Préférences utilisateur:
${params.userPreferences.dietaryRestrictions?.length ? `- Restrictions alimentaires: ${params.userPreferences.dietaryRestrictions.join(', ')}` : ''}
${params.userPreferences.allergies?.length ? `- Allergies: ${params.userPreferences.allergies.join(', ')}` : ''}
${params.userPreferences.dislikedIngredients?.length ? `- Ingrédients non aimés: ${params.userPreferences.dislikedIngredients.join(', ')}` : ''}
${params.userPreferences.servings ? `- Portions souhaitées: ${params.userPreferences.servings}` : ''}
` : '';

      const prompt = `Tu es un chef cuisinier expert. Génère une recette délicieuse et équilibrée.

${modeInstruction}

Ingrédients disponibles: ${params.ingredients.join(', ')}

${filtersText}
${preferencesText}

IMPORTANT: Retourne UNIQUEMENT un JSON valide avec cette structure EXACTE:
{
  "name": "Nom de la recette",
  "description": "Description courte et appétissante (max 100 caractères)",
  "prepTime": 20,
  "cookTime": 30,
  "totalTime": 50,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "cuisineType": "French|Italian|Asian|Mexican|Mediterranean|etc",
  "mealType": "breakfast|lunch|dinner|snack|dessert",
  "ingredients": [
    {"name": "tomate", "quantity": 3, "unit": "pièces", "optional": false},
    {"name": "sel", "quantity": 1, "unit": "pincée", "optional": true}
  ],
  "steps": [
    "Étape 1 détaillée",
    "Étape 2 détaillée"
  ],
  "nutritionInfo": {
    "calories": 450,
    "protein": 25,
    "carbs": 45,
    "fat": 15,
    "fiber": 8
  },
  "tags": ["quick", "healthy", "high-protein", "budget-friendly"],
  "alternatives": [
    {"original": "poulet", "alternatives": ["tofu", "seitan"], "reason": "Pour une version végétarienne"}
  ],
  "tips": ["Astuce 1", "Astuce 2"]
}

Règles strictes:
- Le JSON doit être VALIDE et PARSABLE
- Les quantités doivent être précises et réalistes
- Les informations nutritionnelles doivent être calculées avec précision
- Les tags doivent être en anglais (quick, healthy, high-protein, budget-friendly, low-carb, vegetarian, vegan, gluten-free, etc.)
- Minimum 3 tags, maximum 6 tags
- Les alternatives sont OBLIGATOIRES (au moins 2)
- Retourne UNIQUEMENT le JSON, sans markdown, sans texte avant ou après`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract and parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in response');
      }

      const recipe = JSON.parse(jsonMatch[0]);
      return recipe as GeminiRecipeResponse;
    } catch (error) {
      console.error('Error generating smart recipe:', error);
      throw new Error('Failed to generate recipe. Please try again.');
    }
  }

  /**
   * RECIPE VARIATIONS - Generate 3 variations of a recipe
   */
  static async generateRecipeVariations(baseRecipe: GeminiRecipeResponse): Promise<{
    healthier: GeminiRecipeResponse;
    faster: GeminiRecipeResponse;
    alternative: GeminiRecipeResponse;
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: RECIPE_MODEL });

      const prompt = `Tu es un chef cuisinier expert. Génère 3 variations de cette recette de base:

Recette de base:
Nom: ${baseRecipe.name}
Ingrédients: ${baseRecipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
Temps: ${baseRecipe.prepTime + baseRecipe.cookTime} minutes
Calories: ${baseRecipe.nutritionInfo.calories}

Génère 3 variations:
1. VERSION PLUS SAINE: Moins de calories (−20-30%), plus de protéines/fibres, ingrédients plus sains
2. VERSION PLUS RAPIDE: Temps réduit de 30-50%, techniques simplifiées, mais garde le goût
3. VERSION ALTERNATIVE: Adaptation végétarienne/végane OU différent type de cuisine OU technique différente

Retourne UNIQUEMENT un JSON valide:
{
  "healthier": { /* structure complète de recette comme l'exemple */ },
  "faster": { /* structure complète de recette */ },
  "alternative": { /* structure complète de recette */ }
}

Chaque variation doit avoir la MÊME structure JSON que la recette de base avec tous les champs (name, description, prepTime, cookTime, servings, difficulty, ingredients, steps, nutritionInfo, tags, alternatives, tips).

IMPORTANT: Retourne UNIQUEMENT le JSON, sans markdown, sans texte.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating recipe variations:', error);
      throw new Error('Failed to generate variations');
    }
  }

  /**
   * GENERATE AUTO TAGS - Generate smart tags for a recipe
   */
  static async generateRecipeTags(recipe: {
    name: string;
    ingredients: Array<{ name: string }>;
    prepTime: number;
    cookTime: number;
    nutritionInfo: { calories: number; protein: number; carbs: number; fat: number };
  }): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

      const prompt = `Analyse cette recette et génère des tags pertinents:

Recette: ${recipe.name}
Ingrédients: ${recipe.ingredients.map(i => i.name).join(', ')}
Temps total: ${recipe.prepTime + recipe.cookTime} minutes
Calories: ${recipe.nutritionInfo.calories}
Protéines: ${recipe.nutritionInfo.protein}g

Génère 4-6 tags en anglais parmi:
- Temps: quick (< 30min), medium-time (30-60min)
- Nutrition: high-protein (>25g), low-carb (<30g), low-fat, high-fiber
- Budget: budget-friendly, expensive
- Difficulté: easy, intermediate, advanced
- Régime: vegetarian, vegan, gluten-free, dairy-free, keto, paleo
- Occasion: meal-prep, weeknight-dinner, date-night, family-friendly, party-food
- Santé: healthy, light, comfort-food

Format JSON:
{"tags": ["tag1", "tag2", "tag3"]}

Retourne UNIQUEMENT le JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.tags || [];
    } catch (error) {
      console.error('Error generating tags:', error);
      // Fallback: basic tags based on recipe data
      const tags = [];
      const totalTime = recipe.prepTime + recipe.cookTime;
      if (totalTime < 30) tags.push('quick');
      if (recipe.nutritionInfo.protein > 25) tags.push('high-protein');
      if (recipe.nutritionInfo.calories < 400) tags.push('light');
      tags.push('healthy');
      return tags;
    }
  }

  /**
   * SHOPPING ASSISTANT - Generate shopping list by comparing fridge vs meal plan
   */
  static async generateShoppingList(params: {
    fridgeItems: FridgeItem[];
    mealPlanRecipes: Array<{ ingredients: Array<{ name: string; quantity: number; unit: string }> }>;
    servings?: number;
  }): Promise<{
    missingItems: Array<{ name: string; quantity: number; unit: string; estimatedPrice?: number }>;
    totalEstimatedCost: number;
    suggestions: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

      const fridgeList = params.fridgeItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
      const recipeIngredients = params.mealPlanRecipes
        .flatMap(r => r.ingredients)
        .map(i => `${i.quantity} ${i.unit} ${i.name}`)
        .join(', ');

      const prompt = `Tu es un assistant courses intelligent.

Frigo actuel: ${fridgeList}
Ingrédients nécessaires pour le meal plan: ${recipeIngredients}

Analyse et génère une liste de courses optimale:
1. Compare ce qui est dans le frigo vs ce qui est nécessaire
2. Liste UNIQUEMENT les ingrédients manquants ou insuffisants
3. Estime les prix approximatifs (en euros)
4. Donne 2-3 suggestions pour optimiser (produits de saison, alternatives moins chères, etc.)

Format JSON:
{
  "missingItems": [
    {"name": "tomates", "quantity": 500, "unit": "g", "estimatedPrice": 2.5},
    {"name": "poulet", "quantity": 1, "unit": "kg", "estimatedPrice": 8.0}
  ],
  "totalEstimatedCost": 10.5,
  "suggestions": [
    "Les tomates sont de saison, profitez-en !",
    "Remplacez le poulet par des cuisses (moins cher)"
  ]
}

Retourne UNIQUEMENT le JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      return {
        missingItems: [],
        totalEstimatedCost: 0,
        suggestions: ['Impossible de générer la liste pour le moment'],
      };
    }
  }

  /**
   * SMART MEAL PLAN - Generate advanced weekly meal plan
   */
  static async generateSmartMealPlan(params: {
    nutritionGoals: { calories: number; protein: number; carbs: number; fat: number };
    preferences?: {
      theme?: 'mediterranean' | 'asian' | 'mexican' | 'french' | 'mixed';
      budget?: 'low' | 'medium' | 'high';
      householdSize?: number;
      dayPreferences?: Record<string, string>; // e.g., { "monday": "meal-prep", "friday": "quick" }
    };
    fridgeItems?: FridgeItem[];
  }): Promise<{
    days: Array<{
      day: string;
      breakfast: GeminiRecipeResponse;
      lunch: GeminiRecipeResponse;
      dinner: GeminiRecipeResponse;
      totalNutrition: { calories: number; protein: number; carbs: number; fat: number };
      prepTime: number;
    }>;
    weeklyBalance: { avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number };
    leftovers: Array<{ recipe: string; day: string; useOn: string }>;
    shoppingList: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: RECIPE_MODEL });

      const themeDescription = params.preferences?.theme ?
        `Thème de la semaine: ${params.preferences.theme} (adapte les recettes à ce style de cuisine)` : '';

      const budgetConstraint = params.preferences?.budget === 'low' ?
        'IMPORTANT: Budget serré - privilégie les ingrédients économiques et de saison' : '';

      const prompt = `Tu es un nutritionniste et meal planner expert. Génère un plan alimentaire sur 7 jours.

Objectifs nutritionnels quotidiens:
- Calories: ${params.nutritionGoals.calories} cal/jour
- Protéines: ${params.nutritionGoals.protein}g/jour
- Glucides: ${params.nutritionGoals.carbs}g/jour
- Lipides: ${params.nutritionGoals.fat}g/jour

${themeDescription}
${budgetConstraint}
Personnes: ${params.preferences?.householdSize || 2}

RÈGLES IMPORTANTES:
1. Équilibre nutritionnel sur LA SEMAINE (pas jour par jour)
2. Optimise les restes: si une recette du lundi fait 4 portions, utilise les restes le mercredi
3. Varie les sources de protéines (viande, poisson, légumineuses, œufs)
4. Prends en compte les préférences par jour si spécifiées
5. Les portions doivent correspondre au nombre de personnes

Format JSON (OBLIGATOIRE):
{
  "days": [
    {
      "day": "Lundi",
      "breakfast": { /* recette complète */ },
      "lunch": { /* recette complète */ },
      "dinner": { /* recette complète */ },
      "totalNutrition": {"calories": 2100, "protein": 140, "carbs": 210, "fat": 70},
      "prepTime": 90
    }
  ],
  "weeklyBalance": {"avgCalories": 2000, "avgProtein": 140, "avgCarbs": 200, "avgFat": 65},
  "leftovers": [
    {"recipe": "Poulet rôti", "day": "Lundi", "useOn": "Mercredi"}
  ],
  "shoppingList": ["2kg poulet", "1kg riz", "500g tomates"]
}

Retourne UNIQUEMENT le JSON valide et complet.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating smart meal plan:', error);
      throw new Error('Failed to generate meal plan');
    }
  }

  /**
   * MEAL SCORE - Score a meal from 0-10 based on nutrition goals
   */
  static async scoreMeal(params: {
    meal: { calories: number; protein: number; carbs: number; fat: number; fiber?: number };
    goals: { calories: number; protein: number; carbs: number; fat: number };
    userGoalType?: 'weight-loss' | 'muscle-gain' | 'maintenance';
  }): Promise<{
    score: number;
    feedback: string;
    improvements: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

      const prompt = `Tu es un nutritionniste expert. Note ce repas de 0 à 10.

Repas:
- Calories: ${params.meal.calories} cal
- Protéines: ${params.meal.protein}g
- Glucides: ${params.meal.carbs}g
- Lipides: ${params.meal.fat}g
${params.meal.fiber ? `- Fibres: ${params.meal.fiber}g` : ''}

Objectifs de l'utilisateur (quotidien):
- Calories: ${params.goals.calories} cal/jour
- Protéines: ${params.goals.protein}g/jour
- Glucides: ${params.goals.carbs}g/jour
- Lipides: ${params.goals.fat}g/jour
${params.userGoalType ? `- Objectif: ${params.userGoalType}` : ''}

Critères de notation:
- Adéquation avec les objectifs (40%)
- Équilibre macronutriments (30%)
- Qualité nutritionnelle (20%)
- Satiété et timing (10%)

Format JSON:
{
  "score": 7.5,
  "feedback": "Bon repas équilibré avec une légère surconsommation de glucides",
  "improvements": [
    "Réduire les glucides de 20g",
    "Ajouter 10g de protéines"
  ]
}

Retourne UNIQUEMENT le JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error scoring meal:', error);
      // Fallback simple score
      const calorieDiff = Math.abs(params.meal.calories - params.goals.calories / 3);
      const score = Math.max(0, 10 - (calorieDiff / 50));
      return {
        score: Math.round(score * 10) / 10,
        feedback: 'Score basé sur les calories uniquement',
        improvements: [],
      };
    }
  }

  /**
   * PREDICT GOAL ACHIEVEMENT - Predict when user will reach their goal
   */
  static async predictGoalAchievement(params: {
    currentWeight: number;
    goalWeight: number;
    weeklyWeightChange: number;
    adherenceRate: number; // 0-100
    avgCaloriesPerDay: number;
    goalCaloriesPerDay: number;
  }): Promise<{
    estimatedWeeks: number;
    estimatedDate: Date;
    confidence: 'low' | 'medium' | 'high';
    message: string;
    adjustments?: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

      const prompt = `Tu es un expert en nutrition et prédiction de perte/prise de poids.

Données actuelles:
- Poids actuel: ${params.currentWeight} kg
- Poids objectif: ${params.goalWeight} kg
- Différence: ${Math.abs(params.goalWeight - params.currentWeight)} kg
- Changement hebdomadaire moyen: ${params.weeklyWeightChange} kg/semaine
- Taux d'adhérence: ${params.adherenceRate}%
- Calories moyennes: ${params.avgCaloriesPerDay} cal/jour
- Calories objectif: ${params.goalCaloriesPerDay} cal/jour

Calcule:
1. Estimation réaliste du nombre de semaines pour atteindre l'objectif
2. Date estimée
3. Niveau de confiance (low/medium/high) basé sur l'adhérence et la régularité
4. Message personnalisé et motivant
5. Ajustements recommandés si nécessaire

Format JSON:
{
  "estimatedWeeks": 12,
  "estimatedDate": "2025-03-15",
  "confidence": "medium",
  "message": "À ce rythme, vous atteindrez votre objectif dans environ 3 mois !",
  "adjustments": ["Augmentez votre déficit calorique de 100 cal/jour"]
}

Retourne UNIQUEMENT le JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      parsed.estimatedDate = new Date(parsed.estimatedDate);
      return parsed;
    } catch (error) {
      console.error('Error predicting goal:', error);
      // Fallback simple calculation
      const weightDiff = Math.abs(params.goalWeight - params.currentWeight);
      const weeksEstimated = Math.ceil(weightDiff / Math.max(Math.abs(params.weeklyWeightChange), 0.3));
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + weeksEstimated * 7);

      return {
        estimatedWeeks: weeksEstimated,
        estimatedDate,
        confidence: 'low',
        message: `Estimation: ${weeksEstimated} semaines pour atteindre votre objectif`,
      };
    }
  }

  /**
   * FRIDGE SUGGESTIONS - Generate suggestions for expiring items
   */
  static async generateFridgeSuggestions(params: {
    expiringItems: FridgeItem[];
    daysUntilExpiration: number;
  }): Promise<{
    urgentRecipes: string[];
    storageТips: string[];
    freezeOptions: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

      const itemsList = params.expiringItems
        .map(item => `${item.name} (expire dans ${Math.ceil((new Date(item.expirationDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jours)`)
        .join(', ');

      const prompt = `Ces aliments expirent bientôt: ${itemsList}

Génère:
1. 3 recettes rapides utilisant ces ingrédients (noms simples)
2. 2 astuces de conservation pour prolonger leur durée
3. Quels ingrédients peuvent être congelés et comment

Format JSON:
{
  "urgentRecipes": ["Soupe de légumes", "Omelette au fromage", "Salade composée"],
  "storageTips": ["Astuce 1", "Astuce 2"],
  "freezeOptions": ["Le fromage peut être congelé râpé", "Les légumes peuvent être blanchis puis congelés"]
}

Retourne UNIQUEMENT le JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating fridge suggestions:', error);
      return {
        urgentRecipes: ['Soupe de légumes', 'Omelette', 'Salade'],
        storageTips: ['Conservez au frais', 'Utilisez rapidement'],
        freezeOptions: [],
      };
    }
  }
}
