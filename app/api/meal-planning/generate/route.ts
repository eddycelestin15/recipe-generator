import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's nutrition goals and recipes
    const [goalsRes, recipesRes] = await Promise.allSettled([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/nutrition/goals`, {
        headers: { cookie: request.headers.get('cookie') || '' },
      }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recipes`, {
        headers: { cookie: request.headers.get('cookie') || '' },
      }),
    ]);

    let goals = { calories: 2000, protein: 150, carbs: 200, fat: 65 };
    let recipes: any[] = [];

    if (goalsRes.status === 'fulfilled' && goalsRes.value.ok) {
      const data = await goalsRes.value.json();
      goals = data;
    }

    if (recipesRes.status === 'fulfilled' && recipesRes.value.ok) {
      const data = await recipesRes.value.json();
      recipes = data.recipes || [];
    }

    // If no recipes, return a simple plan
    if (recipes.length === 0) {
      return NextResponse.json({
        plan: {
          monday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
          tuesday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
          wednesday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
          thursday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
          friday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
          saturday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
          sunday: { breakfast: { recipeId: null }, lunch: { recipeId: null }, dinner: { recipeId: null }, snack: { recipeId: null } },
        },
      });
    }

    // Generate AI-based meal plan
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Tu es un nutritionniste expert. Génère un plan de repas pour la semaine basé sur ces objectifs:
- Calories quotidiennes: ${goals.calories}
- Protéines: ${goals.protein}g
- Glucides: ${goals.carbs}g
- Lipides: ${goals.fat}g

Recettes disponibles:
${recipes.map((r, i) => `${i + 1}. ${r.name} - ${r.calories} cal, ${r.protein}g protein`).join('\n')}

Crée un plan équilibré pour 7 jours (lundi à dimanche) avec 4 repas par jour (breakfast, lunch, dinner, snack).
Assure-toi que les repas quotidiens respectent les objectifs nutritionnels.
Varie les recettes pour éviter la monotonie.

Retourne UNIQUEMENT un JSON avec cette structure:
{
  "monday": {
    "breakfast": { "recipeId": "id_de_la_recette" },
    "lunch": { "recipeId": "id_de_la_recette" },
    "dinner": { "recipeId": "id_de_la_recette" },
    "snack": { "recipeId": "id_de_la_recette" }
  },
  ... (même structure pour tuesday, wednesday, thursday, friday, saturday, sunday)
}

Si une recette n'est pas adaptée à un type de repas, utilise null pour recipeId.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const plan = JSON.parse(jsonMatch[0]);

    // Enrich plan with recipe details
    const enrichedPlan: any = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    days.forEach((day) => {
      enrichedPlan[day] = {};
      mealTypes.forEach((mealType) => {
        const slot = plan[day][mealType];
        if (slot && slot.recipeId) {
          const recipe = recipes.find((r) => r.id === slot.recipeId);
          enrichedPlan[day][mealType] = {
            recipeId: slot.recipeId,
            recipe,
          };
        } else {
          enrichedPlan[day][mealType] = { recipeId: null };
        }
      });
    });

    return NextResponse.json({ plan: enrichedPlan });
  } catch (error) {
    console.error('Error generating meal plan:', error);

    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to generate meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
