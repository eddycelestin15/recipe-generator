# Recipe Generator Codebase - Comprehensive Overview

## Executive Summary

The Recipe Generator is a **Next.js 16 full-stack application** with React 19 frontend that provides:
- **AI-powered recipe generation** using Google Gemini AI
- **Smart fridge management** with expiration tracking
- **Weekly meal planning** with AI optimization
- **Nutrition tracking** with calorie & macro logging
- **AI Nutritionist chat** with context-aware coaching
- **Premium subscription model** with Stripe integration
- **Fitness tracking** and habit monitoring
- **Social features** (Stories carousel, Achievements/Badges)

**Database**: MongoDB Atlas with Mongoose ODM  
**Auth**: NextAuth v5 with OAuth (Google, GitHub) + Email/Password  
**Styling**: Tailwind CSS 4.1.17 with dark/light theme support

---

## 1. PROJECT STRUCTURE & TECH STACK

### Key Technologies
```
Frontend:
- Next.js 16 (App Router)
- React 19.2.0
- Tailwind CSS 4.1.17
- Framer Motion (animations)
- Recharts (charts)
- Radix UI (accessible components)

Backend:
- Next.js API Routes
- MongoDB with Mongoose
- NextAuth v5 (authentication)

AI/ML:
- Google Gemini API (2.5-flash & 1.5-flash models)
- Vision capabilities for photo analysis

Payments:
- Stripe (subscriptions)
- Resend (email delivery)
```

### Directory Structure
```
/app
├── /api                           # 100+ API route handlers
│   ├── /ai                        # Gemini AI endpoints
│   ├── /recipes                   # Recipe CRUD
│   ├── /generate-recipe           # Recipe generation
│   ├── /fridge & /fridge-items    # Smart fridge management
│   ├── /meal-planning             # AI meal planning
│   ├── /nutrition                 # Nutrition tracking
│   ├── /weight & /fitness         # Health tracking
│   ├── /auth                      # Authentication
│   └── /stripe                    # Payment processing
│
├── /components                    # Reusable UI components
│   ├── /ui                        # Base UI components (60+)
│   ├── /dashboard                 # Dashboard components
│   ├── /recipes                   # Recipe display/management
│   ├── /fridge                    # Fridge management UI
│   ├── /meal-planning             # Meal planning UI
│   ├── /nutrition                 # Nutrition tracking UI
│   ├── /stories                   # Social stories carousel
│   └── /premium                   # Subscription UI
│
├── /lib                           # Business logic
│   ├── /services                  # GeminiAIService, MealPlanService, etc.
│   ├── /repositories              # Data access layer
│   ├── /types                     # TypeScript definitions
│   └── /utils                     # Helper functions
│
├── /pages & routes
│   ├── /dashboard                 # Main dashboard
│   ├── /generator                 # Recipe generator interface
│   ├── /recipes                   # Recipe library
│   ├── /fridge                    # Smart fridge
│   ├── /meal-planning             # Meal planning
│   ├── /nutrition                 # Nutrition tracking
│   ├── /fitness                   # Fitness dashboard
│   ├── /ai-coach                  # AI coach interface
│   ├── /ai-nutritionist           # AI nutritionist chat
│   ├── /achievements              # Badges & achievements
│   ├── /progress                  # Weight & progress tracking
│   └── /auth                      # Login/signup pages
│
└── Configuration
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 2. RECIPE GENERATION IMPLEMENTATION

### How It Works

**Two API Endpoints**:

#### A. `/api/generate-recipe` (Basic)
- Simple ingredients → Gemini recipe generation
- Returns: Recipe name, description, ingredients, steps, times
- Model: `gemini-2.5-flash`

#### B. `/api/recipes/generate` (Advanced) ⭐ CURRENT
- Integrates: User preferences, dietary restrictions, allergies, zero-waste mode
- Advanced prompt building with nutritional context
- Returns: Full recipe with nutrition info, alternatives, tags, meal types
- Model: `gemini-2.5-flash`

### Key Features

```typescript
// Request payload
{
  ingredients: string[],           // Main ingredients
  filters?: {
    prepTime?: number,             // Max prep time (minutes)
    difficulty?: 'easy'|'medium'|'hard',
    cuisineType?: string,
    mealType?: string
  },
  zeroWasteMode?: boolean,         // Prioritize using ALL ingredients
  userPreferences?: {
    dietaryRestrictions: string[],  // e.g., ['vegan', 'gluten-free']
    allergies: string[],            // MUST EXCLUDE
    dislikedIngredients: string[]   // AVOID IF POSSIBLE
  }
}

// Response
{
  name: string,
  description: string,
  ingredients: [{
    name: string,
    quantity: number,
    unit: string,
    optional: boolean,
    alternative?: string
  }],
  steps: string[],
  prepTime: number,
  cookTime: number,
  servings: number,
  difficulty: 'easy'|'medium'|'hard',
  nutritionInfo: {
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber?: number
  },
  alternatives: [{
    original: string,
    alternatives: string[],
    reason: string
  }]
}
```

### Gemini Integration Points

**File**: `/app/lib/services/gemini-ai-service.ts`

Used for:
1. **Recipe Generation** - Advanced prompt with user context
2. **Photo Analysis** - Identify food from images
3. **Chat Responses** - Context-aware nutritionist replies
4. **Weekly Analysis** - Compliance scoring & insights
5. **Deficiency Detection** - Nutritional alerts
6. **Meal Insights** - Pre-meal guidance

**Model Used**: `gemini-1.5-flash` for most tasks (faster, cheaper)

---

## 3. GEMINI AI INTEGRATION

### Service: GeminiAIService

**File**: `/app/lib/services/gemini-ai-service.ts` (473 lines)

#### Methods

1. **generateChatResponse()**
   - Context: User weight, goals, calories, activity
   - Conversation history (last 4 messages)
   - Response: Personalized advice in French

2. **analyzePhotoFood()**
   - Vision: Identify all foods in image
   - Estimate: Calories, protein, carbs, fat per food
   - Return: Identified foods array + total estimated + assessment

3. **generateWeeklyAnalysis()**
   - Input: Week stats (calories, protein, workouts, tracked days)
   - Output: Compliance score (0-100), positives, improvements, insights, motivation

4. **generateMealInsightBefore()**
   - Quick message before eating (max 30 words)
   - Context: Meal calories, daily goal, average meal, consumed today
   - Non-judgmental guidance

5. **detectDeficiencies()**
   - Check protein/fiber levels
   - Generate severity alerts (low/medium/high)

6. **suggestRecipesForDeficiency()**
   - Given deficiency type (protein/fiber/vegetables)
   - Return 3 concrete recipe suggestions

### API Routes Using Gemini

1. **POST /api/generate-recipe** - Recipe generation
2. **POST /api/recipes/generate** - Advanced recipe generation
3. **POST /api/ai/chat** - Nutritionist chat
4. **POST /api/ai/analyze-photo** - Food photo analysis
5. **POST /api/ai/nutritionist** - AI nutritionist endpoint
6. **POST /api/ai/insights** - Generate automated insights
7. **POST /api/ai/weekly-review** - Weekly analysis
8. **POST /api/ai/optimize-plan** - Meal plan optimization

---

## 4. FRIDGE MANAGEMENT

### Data Model

**Schema**: `/lib/db/schemas/fridge-item.schema.ts`

```typescript
FridgeItem {
  userId: string,           // Owner
  name: string,            // Item name
  quantity: number,        // Amount
  unit: string,            // 'kg', 'g', 'ml', 'l', 'pieces', etc.
  category?: string,       // 'vegetables'|'fruits'|'dairy'|'meat'|'grains'|'condiments'|'other'
  expirationDate?: Date,   // When it expires
  addedDate: Date,         // When added to fridge
  imageUrl?: string,       // Optional image
  timestamps: true         // createdAt, updatedAt
}
```

### API Endpoints

**Location**: `/app/api/fridge*` & `/app/api/fridge-items*`

```
GET    /api/fridge                 # All fridge items
POST   /api/fridge                 # Add item
GET    /api/fridge/[id]            # Get specific item
PUT    /api/fridge/[id]            # Update item
DELETE /api/fridge/[id]            # Remove item

GET    /api/fridge/expiring?days=2 # Items expiring within N days
GET    /api/fridge-items           # Alternative endpoint
POST   /api/fridge-items           # Create item
PUT    /api/fridge-items/[id]      # Update item
DELETE /api/fridge-items/[id]      # Delete item
```

### UI Components

**Location**: `/app/components/fridge/`

- **FridgeItemCard.tsx** - Display individual items
- **AddItemModal.tsx** - Add new item form
- **FridgeStats.tsx** - Overview stats
- **ExpirationAlerts.tsx** - Warning for expiring items

### Features

- ✅ Add/edit/delete items
- ✅ Track expiration dates
- ✅ Categorization (vegetables, fruits, dairy, meat, etc.)
- ✅ Expiration alerts (configurable days)
- ✅ Integration with recipe generation (use what's in fridge)
- ✅ Quantity tracking

---

## 5. MEAL PLANNING IMPLEMENTATION

### How It Works

**Main API**: `/api/meal-planning/generate` (POST)

```typescript
// Process
1. Fetch user's nutrition goals
2. Fetch all available recipes (or generate new ones)
3. Build Gemini prompt with goals & available recipes
4. Gemini creates 7-day plan respecting daily macro targets
5. Enrich plan with recipe details
6. Return structured weekly plan
```

### Data Models

**Recipe Model**:
```typescript
Recipe {
  userId: string,
  name: string,
  description?: string,
  ingredients: RecipeIngredient[],
  steps: string[],
  nutritionInfo?: NutritionInfo,    // Per serving
  servings: number,
  prepTime?: number,               // Minutes
  cookTime?: number,               // Minutes
  difficulty?: 'easy'|'medium'|'hard',
  cuisineType?: string,
  isFavorite: boolean,
  imageUrl?: string,
  tags?: string[]
}
```

**Meal Plan Structure**:
```typescript
{
  monday: {
    breakfast: { recipeId, recipe? },
    lunch: { recipeId, recipe? },
    dinner: { recipeId, recipe? },
    snack: { recipeId, recipe? }
  },
  tuesday: { ... },
  // ... through sunday
}
```

### API Endpoints

```
POST   /api/meal-planning/generate           # AI-generated 7-day plan
GET    /api/meal-planning/week               # Get current week plan
POST   /api/meal-planning/shopping-list      # Generate shopping list

GET    /api/meal-plans                       # All meal plans
POST   /api/meal-plans                       # Create plan
PUT    /api/meal-plans/[id]                  # Update plan
PUT    /api/meal-plans/[id]/slot             # Update specific meal slot
DELETE /api/meal-plans/[id]                  # Delete plan
```

### Services

**File**: `/app/lib/services/meal-plan-service.ts` (500+ lines)

Key functions:
- `generateOptimizedPlan()` - AI-based weekly planning
- `optimizePlanForNutrition()` - Adjust macros
- `findSimilarRecipes()` - Variety in planning
- `calculatePlanNutrition()` - Weekly nutrition totals
- `generateShoppingList()` - Convert plan to shopping list

### UI Components

**Location**: `/app/components/meal-planning/`

- **GenerateMealPlan.tsx** - Plan generation form
- **WeeklyCalendar.tsx** - Display 7-day plan
- **RecipeSelector.tsx** - Choose recipes for slots
- **ShoppingListView.tsx** - Shopping list generation

---

## 6. UI COMPONENTS ORGANIZATION

### Component Hierarchy

```
Root Layout
├── Navigation.tsx                 # Main navigation bar
├── MobileHeader.tsx              # Mobile-specific header
├── BottomNavigation.tsx          # Mobile bottom nav
│
├── Dashboard Page
│   ├── dashboard/StatsCard.tsx
│   ├── dashboard/MacroCircle.tsx
│   ├── dashboard/ProgressChart.tsx
│   ├── dashboard/QuickActions.tsx
│   └── dashboard/skeletons/
│
├── Recipe Generator
│   └── components/recipes/
│       ├── RecipeCard.tsx
│       ├── RecipeDisplay.tsx
│       └── skeletons/
│
├── Meal Planning
│   ├── components/meal-planning/
│   │   ├── GenerateMealPlan.tsx
│   │   ├── WeeklyCalendar.tsx
│   │   ├── RecipeSelector.tsx
│   │   └── ShoppingListView.tsx
│
├── Nutrition
│   ├── components/nutrition/
│   │   ├── NutritionCircle.tsx
│   │   ├── MealTimeline.tsx
│   │   ├── WaterIntake.tsx
│   │   ├── QuickAddFood.tsx
│   │   └── skeletons/
│
├── Fridge
│   ├── components/fridge/
│   │   ├── FridgeItemCard.tsx
│   │   ├── AddItemModal.tsx
│   │   ├── FridgeStats.tsx
│   │   └── ExpirationAlerts.tsx
│
├── Fitness
│   ├── components/fitness/
│   │   └── skeletons/
│
├── Stories (Social)
│   ├── components/stories/
│   │   ├── StoriesCarousel.tsx    # Instagram-style stories
│   │   └── PullToRefreshWrapper.tsx
│
├── Premium
│   ├── components/premium/
│   │   ├── PricingCard.tsx
│   │   ├── PremiumBadge.tsx
│   │   └── FeatureCard.tsx
│
└── Shared UI
    └── components/ui/
        ├── button.tsx
        ├── card.tsx
        ├── textarea.tsx
        ├── input.tsx
        └── ... (Radix UI components)
```

### Key UI Libraries

- **Radix UI** - Accessible components (Avatar, Dialog, Dropdown, Tabs, etc.)
- **Framer Motion** - Animations
- **Lucide React** - Icons (550+ icons)
- **Recharts** - Charts (LineChart, PieChart, etc.)
- **Next.js next-intl** - Internationalization (French/English)
- **next-themes** - Dark/light mode

---

## 7. SOCIAL FEATURES TO BE REMOVED

### 1. Stories Carousel (Instagram-style)

**Files**:
- `/app/components/stories/StoriesCarousel.tsx` (127 lines)
- `/app/components/stories/PullToRefreshWrapper.tsx`
- `/app/hooks/useStories.ts` (134 lines)

**Data**:
- LocalStorage-based (not in MongoDB)
- Demo stories with user avatars, images, timestamps
- Mark as viewed functionality

**Features**:
- Stories carousel with gradient borders for unviewed
- Click to view story
- Add story button
- Pull-to-refresh capability

### 2. Achievements/Badges System

**Files**:
- `/app/achievements/page.tsx` - Full achievements page
- `/app/api/achievements/` - Achievement endpoints
- `/app/api/achievements/available/route.ts`
- `/app/lib/services/achievement-service.ts` (300+ lines)
- `/app/lib/repositories/user-achievement-repository.ts`

**Data Models**:
```typescript
Achievement {
  id: string,
  name: string,
  description: string,
  iconEmoji: string,
  points: number,
  category: string,
  unlockedDate?: Date
}

AchievementProgress {
  achievement: Achievement,
  unlocked: boolean,
  progress: number,        // 0-100
  progressDetails: string,
  unlockedDate?: Date
}
```

**Features**:
- Badge/trophy system with emoji icons
- Progress tracking for locked achievements
- Points system and leveling
- Compliance-based unlocking (habits, streaks, etc.)
- Categories (nutrition, fitness, consistency, etc.)

**Navigation Entry**:
- Achievements page at `/achievements`
- Menu item in Navigation.tsx

### 3. Summary of Social Removals

**Delete**:
1. `/app/components/stories/` (entire directory)
2. `/app/hooks/useStories.ts`
3. `/app/achievements/page.tsx`
4. `/app/api/achievements/` (entire directory)
5. Achievement service calls & repository
6. Stories references in dashboard/main pages

**Update**:
1. `/app/components/Navigation.tsx` - Remove achievements link
2. `/app/dashboard/page.tsx` - Remove stories carousel display
3. Any achievement badges/progress indicators

---

## 8. AI NUTRITIONIST FEATURES

### Location & Access

**Page**: `/app/ai-nutritionist/page.tsx` (251 lines)  
**API**: `/app/api/ai/nutritionist/route.ts`  
**Service**: `GeminiAIService.generateChatResponse()`

### Features Implemented

#### A. AI Chat Interface
- **Type**: Context-aware chat with nutritionist
- **Context Awareness**: 
  - Current weight, target weight
  - Daily calorie goals
  - Today's consumed calories/protein
  - Weekly workouts
  - Diet type (vegan, keto, etc.)
  - Goal type (lose weight, build muscle, etc.)

- **Quick Suggestions** (5 pre-built):
  - "Analyze this week"
  - "Weight loss tips"
  - "Muscle gain tips"
  - "Meal ideas"
  - "Deficiency help"

- **Chat History**:
  - Stored in localStorage
  - Persists between sessions
  - Last 4 messages sent as context to AI

- **Rate Limiting**:
  - Free: 50 messages/day
  - Premium: Unlimited

#### B. Conversation Context

```typescript
ChatContext {
  currentWeight?: number,
  goalWeight?: number,
  goalCalories?: number,
  todayCalories?: number,
  goalProtein?: number,
  todayProtein?: number,
  weeklyWorkouts?: number,
  dietType?: string,
  goalType?: string
}
```

#### C. Prompt Strategy

The AI is instructed to be:
- Personalized & encouraging
- Concise (max 150 words)
- Actionable with specific advice
- Empathetic for challenges
- Celebratory for successes

Language: French

#### D. Integration with Other Features

1. **Photo Food Analysis** (`/ai-coach/photo`)
   - Upload meal photo
   - Gemini Vision identifies foods
   - Returns calories, macros, assessment
   - Can quick-add to meal log

2. **Weekly Review**
   - Automated analysis every week
   - Compliance score (0-100)
   - Positives, improvements, insights
   - Motivational message

3. **AI Insights System**
   - Auto-generated alerts for deficiencies
   - Suggestions for improvement
   - Achievement celebrations
   - Nutritional tips

4. **Recipe Generation**
   - Can request recipes for deficiencies
   - Integrate user goals into generation
   - Suggest alternatives for allergies

---

## 9. CURRENT API ROUTES (100+ endpoints)

### Organization by Feature

**Authentication** (5 routes)
- `/api/auth/[...nextauth]` - NextAuth handler
- `/api/auth/signup` - Registration
- `/api/auth/forgot-password` - Password reset
- `/api/auth/reset-password`
- `/api/users` - User CRUD

**Recipes** (6 routes)
- `/api/generate-recipe` - Basic generation
- `/api/recipes/generate` - Advanced generation
- `/api/recipes` - Recipe CRUD
- `/api/recipes/[id]`
- `/api/generate-image` - Generate recipe image

**Fridge Management** (6 routes)
- `/api/fridge` - Items list, add
- `/api/fridge/[id]` - Update, delete
- `/api/fridge/expiring` - Expiring items
- `/api/fridge-items` - Alternative CRUD
- `/api/fridge-items/[id]`

**Meal Planning** (5 routes)
- `/api/meal-planning/generate` - AI generation
- `/api/meal-planning/week` - Get week plan
- `/api/meal-planning/shopping-list` - Shopping list
- `/api/meal-plans` - CRUD
- `/api/meal-plans/[id]/slot` - Update meal slot

**Nutrition Tracking** (6 routes)
- `/api/nutrition/daily` - Daily summary
- `/api/nutrition/daily/[date]` - Specific day
- `/api/nutrition/goals` - Nutrition goals
- `/api/nutrition/profile` - User nutrition profile
- `/api/nutrition/search` - Food search
- `/api/nutrition/water` - Water intake tracking

**AI Features** (10+ routes)
- `/api/ai/chat` - Nutritionist chat
- `/api/ai/chat/history` - Chat history
- `/api/ai/nutritionist` - AI nutritionist
- `/api/ai/analyze-photo` - Food photo analysis
- `/api/ai/insights` - AI insights
- `/api/ai/weekly-review` - Weekly analysis
- `/api/ai/optimize-plan` - Meal plan optimization
- `/api/ai/rate-limit` - Rate limit checking

**Fitness & Health** (15+ routes)
- `/api/weight/log` - Log weight
- `/api/weight/history` - Weight history
- `/api/workouts` - Workout CRUD
- `/api/workouts/[id]`
- `/api/workouts/history` - Workout history
- `/api/workouts/progress` - Progress stats
- `/api/fitness/stats` - Fitness stats
- `/api/exercises` - Exercise library
- `/api/exercises/[id]`
- `/api/habits` - Habit CRUD
- `/api/habits/[id]`
- `/api/habits/log` - Log habit
- `/api/habits/today` - Today's habits
- `/api/goals` - Goals CRUD
- `/api/measurements/log` - Body measurements

**Dashboard & Analytics** (8 routes)
- `/api/dashboard/stats` - Dashboard stats
- `/api/dashboard/summary` - Quick summary
- `/api/analytics/trends` - Analytics trends
- `/api/analytics/compliance` - Compliance tracking
- `/api/reports/weekly` - Weekly reports
- `/api/reports/insights` - Report insights

**Social & Gamification** (5 routes)
- `/api/achievements` - Get achievements
- `/api/achievements/available` - Available badges
- `/api/user-stats` - User statistics
- `/api/checkin` - Daily check-in

**Payments** (4 routes)
- `/api/stripe/create-checkout` - Checkout session
- `/api/stripe/create-portal` - Customer portal
- `/api/stripe/webhook` - Webhook handler
- `/api/subscription/status` - Subscription status

**Others** (5+ routes)
- `/api/progress-photos/upload` - Upload progress photo
- `/api/daily-routines` - Daily routines
- `/api/routines` - Routine CRUD
- `/api/meals` - Meal history
- `/api/shopping-lists` - Shopping lists

---

## 10. DATABASE MODELS & SCHEMAS

### MongoDB Collections

**Location**: `/lib/db/schemas/`

#### 1. User Schema
```typescript
User {
  email: string (unique, indexed),
  name: string,
  password?: string (hashed),
  emailVerified?: Date,
  image?: string,
  provider: 'credentials' | 'google' | 'github',
  
  profile: {
    age?: number,
    gender?: string,
    height?: number,
    weight?: number,
    activityLevel?: string,
    dietaryRestrictions: string[],
    allergies: string[],
    avatar?: URL
  },
  
  preferences: {
    preferredCuisines: string[],
    dislikedIngredients: string[],
    cookingSkillLevel?: string,
    maxCookingTime?: number,
    dietType?: string
  },
  
  goals: {
    targetWeight?: number,
    targetDate?: Date,
    dailyCalorieTarget?: number,
    macroTargets?: { protein, carbs, fat },
    goalType?: string
  },
  
  settings: {
    units: 'metric' | 'imperial',
    language: string,
    notifications: {
      email: boolean,
      mealReminders: boolean,
      expirationAlerts: boolean
    }
  },
  
  onboardingCompleted: boolean,
  timestamps: true
}
```

#### 2. Recipe Schema
```typescript
Recipe {
  userId: string (indexed),
  name: string,
  description?: string,
  ingredients: RecipeIngredient[],
  steps: string[],
  nutritionInfo?: NutritionInfo,
  tags: string[],
  cuisineType?: string,
  servings: number,
  prepTime?: number,
  cookTime?: number,
  difficulty?: string,
  isFavorite: boolean,
  imageUrl?: string,
  indexes: [userId+isFavorite, userId+tags, text search]
}
```

#### 3. FridgeItem Schema
```typescript
FridgeItem {
  userId: string (indexed),
  name: string,
  quantity: number,
  unit: string,
  category?: string,
  expirationDate?: Date,
  addedDate: Date,
  imageUrl?: string
}
```

#### 4. MealLog Schema
```typescript
MealLog {
  userId: string (indexed),
  date: Date,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  recipeId?: string,
  recipeName?: string,
  servings?: number,
  customNutrition?: { calories, protein, carbs, fat },
  notes?: string
}
```

#### 5. Other Schemas
- **subscription.schema.ts** - Stripe subscription tracking
- **usage-limits.schema.ts** - API rate limits per user
- **password-reset.schema.ts** - Password reset tokens

---

## 11. AUTHENTICATION & AUTHORIZATION

### NextAuth v5 Setup

**Files**:
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `/lib/auth.ts` - Auth helper functions
- `/lib/auth.config.ts` - Auth configuration

### Providers

1. **Email/Password**
   - Signup validation
   - Password hashing with bcryptjs
   - Email verification (optional)

2. **Google OAuth**
   - Client ID/Secret from Google Cloud Console
   - Automatic user creation

3. **GitHub OAuth**
   - Client ID/Secret from GitHub Developer Settings
   - Automatic user creation

### Session Management

- **Storage**: MongoDB (via @auth/mongodb-adapter)
- **Duration**: Configurable (default 30 days)
- **Type**: JWT + Session (hybrid)

### Protected Routes

- Middleware-based route protection
- API endpoint authentication via `auth()` function
- User context available via `useUser()` hook

---

## 12. SUBSCRIPTION & PREMIUM FEATURES

### Implementation

**File**: `/app/lib/services/subscription-service.ts` (300+ lines)

### Pricing Plans

1. **Free Plan**
   - Limited recipes/day: 3
   - AI chat: 50 messages/day
   - Photo analysis: 10/day
   - No meal planning

2. **Premium Plan**
   - Unlimited recipes
   - Unlimited AI chat
   - Unlimited photo analysis
   - Advanced meal planning
   - Priority support

### Payment Integration

- **Provider**: Stripe
- **Endpoints**:
  - `/api/stripe/create-checkout` - Start checkout session
  - `/api/stripe/create-portal` - Manage subscription
  - `/api/stripe/webhook` - Handle events (invoice, subscription, etc.)

### Rate Limiting

**File**: `/app/lib/services/rate-limit-service.ts`

- Tracks usage per user
- Resets daily for free tier
- Unlimited for premium
- Stored in `usage-limits` collection

---

## 13. KEY TECHNOLOGIES & PATTERNS

### Design Patterns Used

1. **Service Layer Pattern**
   - Business logic in `/lib/services/`
   - API routes call services
   - Services call repositories

2. **Repository Pattern**
   - Data access in `/lib/repositories/`
   - Consistent CRUD operations
   - Abstraction from database

3. **Type-First Development**
   - Strong TypeScript typing
   - Types in `/lib/types/`
   - Shared between API & frontend

4. **React Hooks**
   - Custom hooks in `/hooks/`
   - useUser, useSubscription, useStories, etc.
   - State management via hooks & localStorage

### State Management

- **Client State**: React hooks + localStorage
- **Server State**: API calls with fetch/SWR
- **Auth State**: NextAuth sessions

### Performance Optimizations

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Skeleton loaders
- **Caching**: API response caching
- **Database Indexing**: Strategic indexes on hot fields

---

## 14. DEVELOPMENT SETUP

### Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# AI
GEMINI_API_KEY=...

# Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# Email
RESEND_API_KEY=re_...

# App
NODE_ENV=development
DB_NAME=recipe-health-app
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

---

## 15. KEY INSIGHTS FOR IMPROVEMENT

### Strengths

✅ Well-organized modular architecture  
✅ Type-safe with TypeScript  
✅ MongoDB for flexibility  
✅ Excellent AI integration with Gemini  
✅ Comprehensive API coverage (100+ endpoints)  
✅ Multi-language support (i18n)  
✅ Dark/light theme support  
✅ Responsive design with Tailwind  
✅ Premium subscription model  

### Areas for Enhancement

🎯 **Nutrition Tracking**:
- Expand food database
- Better barcode scanning
- Meal plan customization

🎯 **AI Features**:
- Meal plan optimization algorithms
- Better recipe recommendations
- Workout plan generation

🎯 **Social Features** (TO BE REMOVED):
- Stories carousel (demo implementation)
- Achievements (not deeply integrated)
- Leaderboards (not implemented)

🎯 **Performance**:
- Database query optimization
- API response caching
- Image optimization
- Lazy loading

---

## 16. FILE SIZE & COMPLEXITY

- **Total API Routes**: 100+
- **Total Components**: 60+
- **Lines of Service Code**: 2000+
- **Lines of Component Code**: 5000+
- **Database Collections**: 7+ schemas
- **TypeScript Types**: 100+ type definitions

---

## CONCLUSION

The Recipe Generator is a **comprehensive, production-ready** full-stack application with:

- ✅ Modern tech stack (Next.js 16, React 19, Tailwind CSS 4)
- ✅ Powerful AI capabilities (Gemini integration)
- ✅ Complete feature set (recipes, nutrition, fitness, planning)
- ✅ Scalable architecture (modular, type-safe)
- ✅ Revenue model (Stripe subscriptions)
- ✅ Professional UX (dark theme, responsive, animations)

**Status**: Feature-complete for MVP with room for deeper AI integrations and advanced analytics.

