# Recipe Generator Codebase - Comprehensive Analysis

## 1. PROJECT OVERVIEW

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19.2.0
- **UI Library**: Radix UI (core components)
- **Styling**: Tailwind CSS 4.1.17 with custom CSS variables
- **Charts**: Recharts 3.4.1
- **Icons**: Lucide React 0.553.0
- **Forms**: Native HTML + Radix UI components
- **Animations**: Framer Motion 12.23.24
- **Theme**: Dark/Light mode support with next-themes

### CSS Architecture
- Tailwind CSS 4.1.17 with @tailwindcss/postcss
- Custom CSS variables for theming (light/dark mode)
- Color palette: Primary (red #ff4538), Secondary (orange #f97316)
- No CSS modules - pure Tailwind utilities
- Custom keyframes: `animate-spin` for loading indicators

---

## 2. PROJECT STRUCTURE

### Directory Organization
```
/app
├── /api                          # Backend API routes
│   ├── /dashboard               # Dashboard stats endpoints
│   ├── /recipes                 # Recipe CRUD operations
│   ├── /nutrition               # Nutrition tracking APIs
│   ├── /workouts                # Fitness tracking APIs
│   ├── /weight                  # Weight logging APIs
│   ├── /meal-plans              # Meal planning APIs
│   └── ...other endpoints
├── /components                   # Reusable React components
│   ├── /ui                      # Base UI components (Card, Button, Input, etc.)
│   ├── /dashboard               # Dashboard-specific components
│   ├── /recipes                 # Recipe-related components
│   ├── /nutrition               # Nutrition components
│   ├── /meal-planning          # Meal planning components
│   ├── /fitness                 # Fitness tracking components
│   ├── /fridge                  # Smart fridge components
│   ├── /stories                 # Stories carousel components
│   ├── /premium                 # Premium/subscription components
│   └── ...other component folders
├── /hooks                        # Custom React hooks
├── /lib                         # Utilities and services
│   ├── /hooks                  # Library hooks
│   ├── /repositories            # Data management (LocalStorage-based)
│   ├── /services                # Business logic services
│   ├── /types                  # TypeScript type definitions
│   └── /utils                  # Utility functions
├── /(dashboard)                 # Dashboard layout group
│   ├── /profile                # User profile page
│   ├── /settings               # Settings page
│   └── layout.tsx              # Dashboard layout wrapper
├── /dashboard                   # Dashboard page
├── /recipes                     # Recipe browsing & management
├── /nutrition                   # Nutrition tracking dashboard
├── /fitness                     # Fitness tracking dashboard
├── /meal-planning              # Meal planning interface
├── /progress                    # Progress tracking & weight logs
├── /goals                       # Goals management
├── /habits                      # Habit tracking
├── /fridge                      # Smart fridge management
├── /analytics                   # Analytics & insights
├── /auth                        # Authentication pages
└── /account                     # Account management

### Key Configuration Files
- `package.json` - Dependencies (45 components, Next.js 16, Tailwind 4.1.17)
- `tailwind.config.ts` - Tailwind configuration (if exists)
- `globals.css` - Global styles with CSS variables
- `postcss.config.mjs` - PostCSS configuration
- `layout.tsx` - Root layout with Providers, MobileHeader, BottomNavigation
```

---

## 3. RECIPE CARDS - DISPLAY LOCATIONS

### Primary Locations

#### 1. **Recipe Gallery Page** (`/app/recipes/page.tsx`)
- **Component**: `RecipeCard` (`/app/components/recipes/RecipeCard.tsx`)
- **Data Source**: RecipeRepository (localStorage-based)
- **Display Modes**: Grid (3 columns) or List view
- **Features**:
  - Instagram-style card design
  - Circular avatar with cuisine-type colors
  - Recipe image with fallback gradient background
  - Difficulty badge (Easy/Medium/Hard)
  - Nutrition info pills (Calories, Protein, Carbs, Fat, Time)
  - Like/favorite button, comment count, share button
  - Chef name and timestamp (relative time)
  - Tags display (up to 4, with "+X more")
  - Hover effects and smooth transitions
- **Loading State**: Simple spinner loading screen (no skeleton)
- **Stats Display**: 4 stat cards showing Total, Favorites, AI-generated, Manual

#### 2. **Dashboard Page** (`/app/dashboard/page.tsx`)
- **Section**: "Recettes Favorites (Cette Semaine)"
- **Display**: Simple list, not cards
- **Shows**: Recipe name and times cooked
- **Fallback**: "No recipes this week" message

#### 3. **Recipe Detail Page** (`/app/recipes/[id]/page.tsx`)
- Single recipe expanded view
- Component: `RecipeDetail` (`/app/components/recipes/RecipeDetail.tsx`)

#### 4. **Meal Planning Page** (`/app/meal-planning/page.tsx`)
- **Component**: `WeeklyCalendar` for meal slot display
- **Component**: `RecipeSelector` modal for selecting recipes
- Uses recipe cards in a modal context
- Shows recipe information in meal slots

---

## 4. USER PROFILE DISPLAY

### Profile Page Location
- **Route**: `/(dashboard)/profile` (`/app/(dashboard)/profile/page.tsx`)
- **Layout**: Uses dashboard layout (`/(dashboard)/layout.tsx`)
- **Current Implementation**: Simple form-based profile editing
- **Form Sections**:
  1. **Basic Information**: Name, Age, Gender, Height, Weight, Activity Level
  2. **Health Goals**: Primary Goal, Target Weight, Daily Calorie Target
  3. **Diet Preferences**: Diet Type selection
- **Loading State**: Simple "Loading..." text (no skeleton)
- **Uses**: Radix UI Select components for dropdowns
- **Uses**: Custom Input and Button components from `/app/components/ui/`

### Profile Data Sources
- `useUser()` hook from `@/lib/hooks/useUser`
- API endpoint: `/api/users/{id}` for updates
- Displays user information fetched from backend

---

## 5. DASHBOARD STATS DISPLAY

### Main Dashboard Page (`/app/dashboard/page.tsx`)

#### Stats Cards Grid (4 columns)
- **Component**: `StatsCard` (`/app/components/dashboard/StatsCard.tsx`)
- **Cards Displayed**:
  1. Current Weight (Scale icon, blue color)
  2. Calories Today (Flame icon, orange color)
  3. Workout of the Day (Dumbbell icon, purple color)
  4. Streak (Award icon, green color)
- **Features**: Icon badges, trend indicators (↑↓), color-coded
- **Data Source**: `/api/dashboard/summary` endpoint

#### Macros Section
- **Component**: `MacroCircle` (`/app/components/dashboard/MacroCircle.tsx`)
- **Uses**: react-circular-progressbar library
- **Macros Displayed**: Protein, Carbs, Fat (3 circles)
- **Shows**: Percentage + current/goal values

#### Hydration Section
- **Display**: Progress bar (blue)
- **Shows**: ml / goal ml and percentage
- **Simple progress bar implementation**

#### Favorite Recipes Section
- **Display**: Simple bullet list
- **Shows**: Recipe name and times cooked

#### Quick Links (3 cards)
- **Links to**: Analytics, Progress, Goals pages
- **Style**: Hover effects, icon buttons

### Other Dashboard Pages with Stats

#### Nutrition Dashboard (`/app/nutrition/page.tsx`)
- **Stats Cards**: 4 nutrition circles (Calories, Protein, Carbs, Fat)
- **Data Source**: `/api/nutrition/daily/{date}` endpoint
- **Uses**: `NutritionCircle` component

#### Fitness Dashboard (`/app/fitness/page.tsx`)
- **Stats Cards**: 4 cards (Total Workouts, Duration, Calories, Streak)
- **Data**: `/api/workouts/stats` endpoint
- **Charts**: Category breakdown with progress bars
- **Recent Workouts**: List of past workouts with mood indicators

#### Progress Tracking (`/app/progress/page.tsx`)
- **Stats Cards**: 4 cards (Current Weight, Average Weight, Change, Total Entries)
- **Chart**: LineChart from Recharts showing 90-day weight progression
- **Table**: Weight history with date, weight, BMI, body fat, notes

---

## 6. UI LIBRARY & COMPONENT PATTERNS

### Radix UI Components Used
- `@radix-ui/react-avatar` - Avatars
- `@radix-ui/react-dialog` - Modals/Dialogs
- `@radix-ui/react-dropdown-menu` - Menus
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-select` - Select dropdowns
- `@radix-ui/react-slot` - Slot composition
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-tabs` - Tab navigation

### Custom UI Components (`/app/components/ui/`)
- `button.tsx` - Button component (via `class-variance-authority`)
- `card.tsx` - Card wrapper with Header, Title, Description, Content, Footer
- `input.tsx` - Input field
- `label.tsx` - Form label
- `select.tsx` - Select dropdown (Radix-based)
- `switch.tsx` - Toggle switch (Radix-based)

### Component Design Patterns
1. **Client Components**: `'use client'` at top for interactivity
2. **Compound Components**: Card uses CardHeader, CardTitle, CardContent, etc.
3. **Icon Components**: Lucide React icons integrated into UI
4. **Tailwind Utilities**: All styling via Tailwind classes, no CSS modules
5. **Color System**: CSS variables for theming (--primary, --secondary, --muted, etc.)

---

## 7. CURRENT STYLING APPROACH

### Tailwind CSS Configuration
- **Version**: 4.1.17 with `@tailwindcss/postcss`
- **Approach**: Utility-first CSS
- **No CSS Modules**: Pure Tailwind utilities throughout
- **PostCSS**: Minimal config using only @tailwindcss/postcss plugin

### Custom CSS Variables (in globals.css)
```css
Light Mode Variables:
--background: #ffffff
--foreground: #171717
--border: #e5e5e5
--card: #ffffff
--muted: #f5f5f5
--primary: #ff4538 (red)
--secondary: #f97316 (orange)
--accent: #f5f5f5
--ring: #ff4538

Dark Mode Variables:
--background: #0a0a0a
--foreground: #fafafa
--border: #262626
--card: #171717
--primary: #ff4538 (red)
--secondary: #f97316 (orange)
--ring: #ff6b63
```

### Tailwind Theme Extension
- Color palettes for primary (red), secondary (orange), neutral (gray)
- Shadow definitions (sm, md, lg, xl, 2xl)
- Border radius scale (sm, md, lg, xl, 2xl)
- Transition utilities (fast, normal, slow)
- Custom animations (smooth scrolling, tap highlight)

### Custom CSS Classes
- `.content-with-nav` - Padding for mobile layout with nav
- `.scrollbar-hide` - Hide scrollbars for carousels
- `.pt-safe, .pb-safe, .pl-safe, .pr-safe` - iOS safe area insets
- Focus rings with `outline-2` and `outline-offset-2`

### Animation & Transitions
- **Framer Motion**: Used for complex animations (already imported)
- **Tailwind Animations**: `animate-spin` for loading spinners
- **Hover Effects**: Scale transforms, shadow transitions
- **Transition Durations**: Inline styles with CSS variables

---

## 8. CURRENT LOADING STATES

### Existing Loading Implementations

#### 1. **Dashboard Page** (`/app/dashboard/page.tsx`)
```jsx
if (loading) {
  return (
    <div className="bg-background min-h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground-secondary">Chargement du dashboard...</p>
      </div>
    </div>
  );
}
```
**Type**: Full page spinner, no skeleton loaders

#### 2. **Recipes Page** (`/app/recipes/page.tsx`)
- No explicit loading state (uses localStorage, instant load)
- **Issue**: No skeleton while fetching initial data

#### 3. **Nutrition Dashboard** (`/app/nutrition/page.tsx`)
```jsx
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
```
**Type**: Full page spinner (similar pattern)

#### 4. **Fitness Dashboard** (`/app/fitness/page.tsx`)
```jsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600">Loading fitness stats...</p>
      </div>
    </div>
  );
}
```
**Type**: Full page spinner with icon

#### 5. **Progress Page** (`/app/progress/page.tsx`)
```jsx
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
```
**Type**: Full page spinner

#### 6. **Meal Planning Page** (`/app/meal-planning/page.tsx`)
```jsx
if (isLoading && !mealPlan) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
```
**Type**: Full page spinner

#### 7. **Profile Page** (`/(dashboard)/profile/page.tsx`)
```jsx
if (isLoading) {
  return <div className="flex min-h-screen items-center justify-center">Loading...</div>
}
```
**Type**: Simple text loading (no styling)

### Issues with Current Loading States
1. ❌ No skeleton loaders - all full-page spinners
2. ❌ No partial content loading
3. ❌ UX is jarring - entire page blank while loading
4. ❌ No skeleton matching actual content layout
5. ❌ Profile page has minimal loading feedback

---

## 9. SKELETON LOADER REQUIREMENTS - COMPREHENSIVE MAP

### High Priority: Pages with Data Fetching

#### 1. **Dashboard Page** (`/app/dashboard/page.tsx`)
**Current Load**: `/api/dashboard/summary`

**Skeleton Components Needed**:
```
- StatsCard Skeleton (4 cards in grid)
- MacroCircle Skeleton (3 circles)
- Progress Bar Skeleton (Hydration section)
- Recipe List Skeleton (5 items)
- Quick Links Skeleton (3 cards)
```

**Component Structure**:
- StatsCardSkeleton - matches StatsCard layout
- MacroCircleSkeleton - circular progress placeholder
- ProgressBarSkeleton - animated bar
- QuickActionsSkeleton - 3 tall cards

#### 2. **Recipes Gallery Page** (`/app/recipes/page.tsx`)
**Current Load**: LocalStorage (instant, but could be API)

**Skeleton Components Needed**:
```
- RecipeCard Skeleton (12 cards in grid, 3 columns)
- Stats Cards Skeleton (4 cards)
- Filter Bar Skeleton
```

**Component Structure**:
- RecipeCardSkeleton - Instagram-style card placeholder
- RecipeStatsCardSkeleton - stat card placeholder

#### 3. **Nutrition Dashboard** (`/app/nutrition/page.tsx`)
**Current Load**: `/api/nutrition/daily/{date}`

**Skeleton Components Needed**:
```
- NutritionCircle Skeleton (4 circles)
- Meal Timeline Skeleton (6-8 meal items)
- Water Intake Skeleton
- CaloriesBurned Widget Skeleton
- Quick Links Skeleton (3 buttons)
```

#### 4. **Fitness Dashboard** (`/app/fitness/page.tsx`)
**Current Load**: `/api/workouts/stats`

**Skeleton Components Needed**:
```
- Quick Action Cards Skeleton (4 cards)
- Stats Cards Skeleton (4 cards)
- Recent Workouts Skeleton (5 items)
- Category Breakdown Skeleton (chart area)
- Average Stats Skeleton (2 stat boxes)
```

#### 5. **Progress Tracking** (`/app/progress/page.tsx`)
**Current Load**: `/api/weight/history?days=90`

**Skeleton Components Needed**:
```
- Stats Cards Skeleton (4 cards)
- Chart Skeleton (line chart area)
- Weight History Table Skeleton (15 rows)
```

#### 6. **Meal Planning Page** (`/app/meal-planning/page.tsx`)
**Current Load**: Repositories + `/api/meal-plans/generate`

**Skeleton Components Needed**:
```
- Weekly Calendar Skeleton (7 days × 4 meals)
- Date Selector Skeleton
- Action Buttons Skeleton
- Shopping List Skeleton (if toggled)
```

#### 7. **User Profile Page** (`/(dashboard)/profile/page.tsx`)
**Current Load**: `useUser()` hook

**Skeleton Components Needed**:
```
- Form Card Skeletons (3 cards - Basic, Goals, Preferences)
- Input Field Skeletons (multiple per card)
- Submit Button Skeleton
```

#### 8. **Nutrition Log Page** (`/app/nutrition/log/page.tsx`)
**Skeleton Components Needed**:
```
- Food Search Results Skeleton
- Meal List Skeleton
- Nutrition Info Display Skeleton
```

#### 9. **Fitness Pages**
- **Exercise List** (`/app/fitness/exercises/page.tsx`): Exercise card skeletons
- **Routines** (`/app/fitness/routines/page.tsx`): Routine card skeletons
- **Workout History** (`/app/fitness/history/page.tsx`): Workout item skeletons

#### 10. **Fridge Management** (`/app/fridge/page.tsx`)
**Skeleton Components Needed**:
```
- Fridge Stats Skeleton (3-4 cards)
- Fridge Items Grid Skeleton (12 items)
- Expiration Alerts Skeleton
```

#### 11. **Goals Page** (`/app/goals/page.tsx`)
**Skeleton Components Needed**:
```
- Goal Card Skeletons (multiple)
- Progress Charts Skeletons
- Action Buttons Skeleton
```

#### 12. **Habits Page** (`/app/habits/page.tsx`)
**Skeleton Components Needed**:
```
- Habit Item Skeletons (8-10 items)
- Calendar Heatmap Skeleton
- Statistics Skeleton
```

#### 13. **Meal Planner Modal** (`RecipeSelector` component)
**Skeleton Components Needed**:
```
- Recipe Search Results Skeleton
- Recipe Item Skeletons (grid or list)
```

#### 14. **Analytics & Insights**
- **Analytics Page** (`/app/analytics/page.tsx`): Chart skeletons, stat skeletons
- **AI Coach** (`/app/ai-coach/page.tsx`): Content skeletons

---

## 10. COMPONENT INVENTORY FOR SKELETON CREATION

### Components to Create Skeleton Versions For

| Component | Location | Usage | Priority |
|-----------|----------|-------|----------|
| StatsCard | `/components/dashboard/StatsCard.tsx` | Dashboard, Fitness, Progress | HIGH |
| RecipeCard | `/components/recipes/RecipeCard.tsx` | Recipes page, meal planning | HIGH |
| MacroCircle | `/components/dashboard/MacroCircle.tsx` | Dashboard, Nutrition | HIGH |
| NutritionCircle | `/components/nutrition/NutritionCircle.tsx` | Nutrition page | HIGH |
| MealTimeline | `/components/nutrition/MealTimeline.tsx` | Nutrition page | HIGH |
| WeeklyCalendar | `/components/meal-planning/WeeklyCalendar.tsx` | Meal planning page | MEDIUM |
| QuickActions | `/components/dashboard/QuickActions.tsx` | Dashboard | MEDIUM |
| FridgeItemCard | `/components/fridge/FridgeItemCard.tsx` | Fridge page | MEDIUM |
| ExpirationAlerts | `/components/fridge/ExpirationAlerts.tsx` | Fridge page | MEDIUM |
| Card | `/components/ui/card.tsx` | Base for all card skeletons | HIGH |
| Button | `/components/ui/button.tsx` | Button skeletons | MEDIUM |

---

## 11. RECOMMENDATIONS FOR SKELETON LOADER IMPLEMENTATION

### Best Practices to Implement

1. **Create Centralized Skeleton Library**
   ```
   /app/components/ui/skeletons/
   ├── CardSkeleton.tsx
   ├── InputSkeleton.tsx
   ├── ButtonSkeleton.tsx
   ├── CircleSkeleton.tsx
   ├── LineSkeleton.tsx
   └── shimmer.css (or Tailwind class for animation)
   ```

2. **Shimmer Animation Approach**
   - Use Tailwind `animate-pulse` for simple shimmer
   - Or create custom CSS animation for gradient shimmer
   - Keep consistent with existing `animate-spin` pattern

3. **Component-Level Skeleton States**
   - Create `{ComponentName}Skeleton` variants
   - Pass `isLoading` prop to components
   - Render skeleton layout when loading
   - Smooth transition from skeleton to content

4. **Page-Level Skeleton States**
   - Replace full-page spinners with skeleton screens
   - Use `React.Suspense` for better code splitting
   - Maintain layout stability (prevent CLS - Cumulative Layout Shift)

5. **Tailwind Utilities for Skeletons**
   - Use `bg-muted` or `bg-muted/50` for skeleton color
   - Use `rounded-lg` matching component borders
   - Use `animate-pulse` for shimmer effect
   - Add `h-[height]` constraints for proper proportions

---

## 12. TECHNOLOGY SUMMARY

| Aspect | Technology | Notes |
|--------|-----------|-------|
| Framework | Next.js 16 | App Router, SSR capable |
| React | 19.2.0 | Latest stable with concurrent features |
| UI Components | Radix UI | Headless, accessible |
| Styling | Tailwind CSS 4.1.17 | Utility-first, no CSS modules |
| Icons | Lucide React | 553+ icons available |
| Charts | Recharts | React charting library |
| Forms | Radix UI + HTML | Custom Input, Select, Button |
| Animations | Framer Motion | Complex animations support |
| Theming | next-themes | Light/Dark mode |
| Database | MongoDB + Mongoose | Via API |
| Auth | NextAuth 5.0 beta | OAuth support |

---

## 13. KEY FILES SUMMARY

### Core Files
- `app/layout.tsx` - Root layout with providers
- `app/globals.css` - CSS variables, theme definitions
- `app/page.tsx` - Landing/home page
- `app/providers.tsx` - Context providers

### Critical Components
- `app/components/ui/card.tsx` - Base card component
- `app/components/dashboard/StatsCard.tsx` - Stats display
- `app/components/recipes/RecipeCard.tsx` - Recipe display
- `app/components/dashboard/MacroCircle.tsx` - Circular progress

### Dashboard Pages
- `app/dashboard/page.tsx` - Main dashboard
- `app/recipes/page.tsx` - Recipe gallery
- `app/nutrition/page.tsx` - Nutrition tracking
- `app/fitness/page.tsx` - Fitness dashboard
- `app/progress/page.tsx` - Progress tracking
- `app/(dashboard)/profile/page.tsx` - User profile

---

## 14. NEXT STEPS FOR SKELETON LOADER IMPLEMENTATION

1. Create skeleton component library
2. Add shimmer animation utilities
3. Convert page loading states (12+ pages identified)
4. Create component-level skeleton variants
5. Test for layout stability and UX improvement
6. Consider Suspense boundaries for better code structure

