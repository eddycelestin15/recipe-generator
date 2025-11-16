import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weekPlan } = await request.json();

    if (!weekPlan) {
      return NextResponse.json({ error: 'Week plan is required' }, { status: 400 });
    }

    // Extract all recipe IDs from the plan
    const recipeIds: Set<string> = new Set();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    days.forEach((day) => {
      mealTypes.forEach((mealType) => {
        const slot = weekPlan[day]?.[mealType];
        if (slot?.recipeId) {
          recipeIds.add(slot.recipeId);
        }
      });
    });

    // Fetch all recipes
    const recipesResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/recipes`,
      {
        headers: { cookie: request.headers.get('cookie') || '' },
      }
    );

    if (!recipesResponse.ok) {
      throw new Error('Failed to fetch recipes');
    }

    const { recipes } = await recipesResponse.json();

    // Collect all ingredients
    const ingredientsMap = new Map<string, number>();

    recipes.forEach((recipe: any) => {
      if (recipeIds.has(recipe.id) && recipe.ingredients) {
        recipe.ingredients.forEach((ingredient: string) => {
          // Simple ingredient extraction (you'd want to parse quantities properly in production)
          const count = ingredientsMap.get(ingredient) || 0;
          ingredientsMap.set(ingredient, count + 1);
        });
      }
    });

    // Fetch fridge items to subtract what's already available
    try {
      const fridgeResponse = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/fridge`,
        {
          headers: { cookie: request.headers.get('cookie') || '' },
        }
      );

      if (fridgeResponse.ok) {
        const fridgeData = await fridgeResponse.json();
        const fridgeItems = fridgeData.items || [];

        fridgeItems.forEach((item: any) => {
          const ingredient = item.name.toLowerCase();
          // Remove items that are already in the fridge
          for (const [key, value] of ingredientsMap.entries()) {
            if (key.toLowerCase().includes(ingredient) || ingredient.includes(key.toLowerCase())) {
              ingredientsMap.delete(key);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching fridge items:', error);
      // Continue without fridge subtraction
    }

    // Convert to array
    const shoppingList = Array.from(ingredientsMap.entries()).map(([ingredient, count]) => {
      if (count > 1) {
        return `${ingredient} (x${count})`;
      }
      return ingredient;
    });

    return NextResponse.json({ items: shoppingList });
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    );
  }
}
