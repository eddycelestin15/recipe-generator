# AI Recipe Generator

A Next.js web application that generates recipes and image descriptions using Google's Gemini AI.

## Features

- Generate custom recipes based on your available ingredients
- AI-powered recipe creation using Google's Gemini AI
- AI-generated image descriptions for recipes
- Beautiful, responsive UI built with Tailwind CSS
- TypeScript for type safety

## Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Google Gemini API key (get one at https://makersuite.google.com/app/apikey)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Add your API key:**

   Open `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. Enter your available ingredients in the text area (comma-separated)
   - Example: `chicken, tomatoes, garlic, pasta, olive oil`

2. Click the "Generate Recipe" button

3. Wait for the AI to generate:
   - A complete recipe with ingredients and instructions
   - Cooking time and servings information
   - Difficulty level
   - An image description for visualization

4. Use the generated image description with image generation services like:
   - DALL-E
   - Midjourney
   - Stable Diffusion

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google Gemini AI** - Recipe and image prompt generation

## Project Structure

```
recipe-generator/
├── app/
│   ├── api/
│   │   ├── generate-recipe/
│   │   │   └── route.ts          # Gemini recipe generation endpoint
│   │   └── generate-image/
│   │       └── route.ts          # Gemini image prompt endpoint
│   ├── components/
│   │   └── RecipeDisplay.tsx    # Recipe display component
│   ├── page.tsx                  # Main page with ingredient form
│   └── layout.tsx
├── .env.local                    # Your API keys (not committed)
├── .env.example                  # Example environment variables
└── package.json
```

## API Routes

### POST /api/generate-recipe
Generates a recipe based on provided ingredients using ChatGPT.

**Request Body:**
```json
{
  "ingredients": ["chicken", "tomatoes", "garlic"]
}
```

**Response:**
```json
{
  "recipe": {
    "title": "Recipe Name",
    "description": "Recipe description",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "cookingTime": "30 minutes",
    "servings": "4 servings",
    "difficulty": "medium"
  }
}
```

### POST /api/generate-image
Generates an image description using Gemini AI.

**Request Body:**
```json
{
  "recipeTitle": "Recipe Name",
  "recipeDescription": "Recipe description"
}
```

**Response:**
```json
{
  "imagePrompt": "Detailed image description...",
  "message": "Image prompt generated successfully"
}
```

## Notes

- The Gemini AI integration generates image prompts/descriptions rather than actual images, as Gemini's current API focuses on text generation
- For actual image generation, you can use the generated prompt with services like DALL-E 3, Midjourney, or Stable Diffusion
- Make sure to keep your API keys secure and never commit them to version control

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT
