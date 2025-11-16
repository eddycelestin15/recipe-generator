# Skeleton Loaders & Loading States Guide

## Overview
Cette mise à jour ajoute des skeleton loaders modernes et fluides partout dans l'application pour améliorer l'expérience utilisateur pendant le chargement des données.

## Composants Ajoutés

### 1. Composants Skeleton de Base (`app/components/ui/skeletons/`)
- **Skeleton.tsx** - Composant de base avec 3 variantes (default, shimmer, wave)
- **SkeletonCircle** - Pour les avatars et indicateurs circulaires
- **SkeletonText** - Pour les lignes de texte
- **CardSkeleton.tsx** - Skeleton pour les cartes
- **InputSkeleton.tsx** - Skeleton pour les champs de formulaire
- **ButtonSkeleton.tsx** - Skeleton pour les boutons
- **CircleSkeleton.tsx** - Skeleton pour les cercles de progression
- **TableRowSkeleton.tsx** - Skeleton pour les tableaux
- **ChartSkeleton.tsx** - Skeleton pour les graphiques

### 2. Composants Spinner (`app/components/ui/`)
- **spinner.tsx** - Composants de chargement réutilisables
  - `Spinner` - Spinner simple avec 3 tailles (sm, md, lg)
  - `LoadingOverlay` - Overlay plein écran avec spinner
  - `LoadingState` - État de chargement avec message
- **button-with-loading.tsx** - Bouton avec état de chargement intégré

### 3. Skeletons Spécifiques par Feature

#### Dashboard (`app/components/dashboard/skeletons/`)
- **StatsCardSkeleton** - Pour les cartes de statistiques
- **MacroCircleSkeleton** - Pour les cercles de macronutriments
- **QuickActionsSkeleton** - Pour les actions rapides
- **DashboardSkeleton** - Page complète du dashboard

#### Recipes (`app/components/recipes/skeletons/`)
- **RecipeCardSkeleton** - Pour les cartes de recettes (Instagram-style)
- **RecipeGridSkeleton** - Grille de cartes de recettes
- **RecipesPageSkeleton** - Page complète des recettes

#### Profile (`app/components/profile/skeletons/`)
- **ProfileFormCardSkeleton** - Pour les cartes de formulaire
- **ProfileSkeleton** - Page complète du profil

#### Nutrition (`app/components/nutrition/skeletons/`)
- **NutritionPageSkeleton** - Page complète de nutrition

#### Fitness (`app/components/fitness/skeletons/`)
- **FitnessPageSkeleton** - Page complète de fitness

## Animations CSS Ajoutées

Dans `app/globals.css`, les animations suivantes ont été ajoutées :

```css
@keyframes shimmer - Effet de shimmer pour les skeletons
@keyframes wave - Effet de vague (pulse alternatif)
@keyframes fadeIn - Apparition en fondu
@keyframes slideIn - Glissement vers le haut avec fondu
@keyframes spin - Rotation pour les spinners
```

Classes utilitaires :
- `.animate-shimmer` - Animation shimmer
- `.animate-wave` - Animation wave
- `.animate-fade-in` - Fade in smooth
- `.animate-slide-in` - Slide in from bottom
- `.spinner` - Style de base pour les spinners

## Optimistic UI Updates

### RecipeCard
Le composant `RecipeCard` implémente maintenant des optimistic UI updates pour les actions like/favorite :
- L'UI se met à jour immédiatement au clic
- Les animations de transition sont fluides (scale, pulse)
- `active:scale-95` pour le feedback tactile

## Pages Mises à Jour

### Avec Skeletons
1. **Dashboard** (`/app/dashboard/page.tsx`) - Utilise `DashboardSkeleton`
2. **Recipes** (`/app/recipes/page.tsx`) - Utilise `RecipesPageSkeleton`
3. **Profile** (`/app/(dashboard)/profile/page.tsx`) - Utilise `ProfileSkeleton`
4. **Nutrition** (`/app/nutrition/page.tsx`) - Utilise `NutritionPageSkeleton`
5. **Fitness** (`/app/fitness/page.tsx`) - Utilise `FitnessPageSkeleton`

### Avec Loading Spinners
- **Profile** - Bouton submit avec spinner pendant le save
- Tous les composants peuvent utiliser `ButtonWithLoading` ou `Spinner`

## Usage

### Skeleton de base
```tsx
import { Skeleton } from "@/app/components/ui/skeletons/Skeleton";

<Skeleton className="h-4 w-full" variant="shimmer" />
```

### Skeleton Circle
```tsx
import { SkeletonCircle } from "@/app/components/ui/skeletons/Skeleton";

<SkeletonCircle className="w-12 h-12" />
```

### Spinner
```tsx
import { Spinner } from "@/app/components/ui/spinner";

<Spinner size="md" />
```

### Button avec Loading
```tsx
import { ButtonWithLoading } from "@/app/components/ui/button-with-loading";

<ButtonWithLoading loading={isLoading} loadingText="Saving...">
  Save Changes
</ButtonWithLoading>
```

### Page Skeleton
```tsx
import { DashboardSkeleton } from "@/app/components/dashboard/skeletons/DashboardSkeleton";

if (loading) {
  return <DashboardSkeleton />;
}
```

## Transitions Smooth

Toutes les pages principales utilisent maintenant `animate-fade-in` pour une apparition fluide après le chargement :
- Durée : 300ms
- Easing : ease-in
- Définie dans `globals.css`

## Performance

Les skeletons améliorent la perception de performance :
- Évite les écrans blancs pendant le chargement
- Donne une indication visuelle du contenu à venir
- Réduit le layout shift (CLS)
- Améliore le ressenti utilisateur

## Prochaines Étapes Possibles

1. Ajouter React Suspense pour le code-splitting
2. Implémenter des error boundaries avec états de fallback
3. Ajouter plus d'optimistic updates pour d'autres actions
4. Créer des variants de skeletons pour dark mode
5. Ajouter des micro-interactions (haptic feedback sur mobile)
