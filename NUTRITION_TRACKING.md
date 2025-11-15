# Système de Tracking Nutritionnel

## Vue d'ensemble

Le système de tracking nutritionnel permet aux utilisateurs de :
- Calculer leurs objectifs nutritionnels quotidiens basés sur leur profil
- Logger leurs repas (depuis des recettes ou ajout manuel)
- Suivre leur progression quotidienne (calories, macros, hydratation)
- Visualiser leurs statistiques nutritionnelles

## Architecture

### Types et Modèles (`/app/lib/types/nutrition.ts`)

- **MealLog** : Journal des repas consommés
- **DailyNutrition** : Statistiques nutritionnelles quotidiennes
- **UserProfile** : Profil utilisateur (poids, taille, âge, etc.)
- **NutritionGoals** : Objectifs nutritionnels calculés (BMR, TDEE, macros)

### Repositories (`/app/lib/repositories/`)

- **MealLogRepository** : Gestion des logs de repas
- **DailyNutritionRepository** : Gestion des statistiques quotidiennes
- **UserProfileRepository** : Gestion du profil utilisateur
- **NutritionGoalsRepository** : Gestion des objectifs nutritionnels

### Utilitaires (`/app/lib/utils/`)

- **nutrition-calculator.ts** : Calculs BMR, TDEE, et distribution des macros

### Services (`/app/lib/services/`)

- **nutritionix-service.ts** : Intégration avec l'API Nutritionix pour obtenir les données nutritionnelles

## Calculs Nutritionnels

### BMR (Base Metabolic Rate) - Formule Mifflin-St Jeor

**Homme :**
```
BMR = 10 × poids(kg) + 6.25 × taille(cm) - 5 × âge(ans) + 5
```

**Femme :**
```
BMR = 10 × poids(kg) + 6.25 × taille(cm) - 5 × âge(ans) - 161
```

### TDEE (Total Daily Energy Expenditure)

```
TDEE = BMR × Multiplicateur d'activité
```

Multiplicateurs :
- Sédentaire : 1.2
- Légère activité : 1.375
- Activité modérée : 1.55
- Actif : 1.725
- Très actif : 1.9

### Ajustement selon l'objectif

- **Perte de poids** : TDEE - 500 cal (≈ 0.5kg/semaine)
- **Maintien** : TDEE
- **Prise de poids** : TDEE + 300 cal (≈ 0.25kg/semaine)

### Distribution des macros

**Équilibré :**
- Glucides : 40% (4 cal/g)
- Protéines : 30% (4 cal/g)
- Lipides : 30% (9 cal/g)

**Keto :**
- Glucides : 5% (4 cal/g)
- Protéines : 25% (4 cal/g)
- Lipides : 70% (9 cal/g)

**Riche en protéines :**
- Glucides : 30% (4 cal/g)
- Protéines : 40% (4 cal/g)
- Lipides : 30% (9 cal/g)

## API Routes

### Profil et Objectifs

**GET /api/nutrition/profile**
- Récupère le profil utilisateur

**POST /api/nutrition/profile**
- Crée ou met à jour le profil utilisateur
- Recalcule automatiquement les objectifs nutritionnels

**GET /api/nutrition/goals**
- Récupère les objectifs nutritionnels actuels

**POST /api/nutrition/goals**
- Recalcule les objectifs basés sur le profil actuel

### Statistiques Quotidiennes

**GET /api/nutrition/daily/[date]**
- Récupère les statistiques nutritionnelles pour une date donnée
- Format date : YYYY-MM-DD

**PATCH /api/nutrition/water**
- Met à jour l'hydratation quotidienne
- Body : `{ date: string, waterIntake: number }`

### Meal Logging

**POST /api/meals**
- Crée un nouveau log de repas
- Body : `CreateMealLogDTO`

**GET /api/meals?date=YYYY-MM-DD**
- Récupère les repas pour une date donnée

**GET /api/meals/[id]**
- Récupère un repas spécifique

**PATCH /api/meals/[id]**
- Met à jour un repas
- Body : `UpdateMealLogDTO`

**DELETE /api/meals/[id]**
- Supprime un repas

### Recherche Nutritionnelle

**POST /api/nutrition/search**
- Recherche les données nutritionnelles d'un aliment
- Body : `{ query: string }`
- Exemple : `{ query: "1 pomme" }`

## Pages

### `/nutrition` - Dashboard Nutrition

Affiche :
- Sélecteur de date
- Cercles de progression (calories, protéines, glucides, lipides)
- Timeline des repas du jour
- Widget d'hydratation
- Actions rapides

### `/nutrition/log` - Logger un Repas

Deux méthodes d'ajout :
1. **Ajout rapide** : Recherche d'aliments avec données nutritionnelles automatiques
2. **Depuis une recette** : Sélection d'une recette sauvegardée

### `/nutrition/goals` - Objectifs Nutritionnels

Formulaire pour :
- Informations personnelles (poids, taille, âge, sexe)
- Niveau d'activité
- Objectif (perte/maintien/prise de poids)
- Type de régime

Affiche :
- BMR calculé
- TDEE calculé
- Objectifs quotidiens (calories et macros)

## Composants UI

### `NutritionCircle`
Cercle de progression pour visualiser la consommation vs objectif

### `MealTimeline`
Timeline affichant les repas du jour avec possibilité de suppression

### `QuickAddFood`
Formulaire de recherche et ajout rapide d'aliments

### `WaterIntake`
Widget pour tracker l'hydratation quotidienne

## Configuration API Nutritionix (Optionnel)

Pour utiliser l'API Nutritionix pour des données nutritionnelles précises :

1. S'inscrire sur https://www.nutritionix.com/business/api
2. Obtenir APP_ID et APP_KEY
3. Créer un fichier `.env.local` :
```env
NUTRITIONIX_APP_ID=your_app_id
NUTRITIONIX_APP_KEY=your_app_key
```

**Note :** Le système fonctionne sans API grâce à une base de données d'aliments courante en fallback.

## Stockage des Données

Toutes les données sont stockées dans `localStorage` :
- `user_profile_[userId]` : Profil utilisateur
- `nutrition_goals_[userId]` : Objectifs nutritionnels
- `meal_logs_[userId]` : Logs des repas
- `daily_nutrition_[userId]` : Statistiques quotidiennes

## Exemple d'Utilisation

### 1. Configuration initiale

```typescript
// Créer un profil
const profile = {
  weight: 75,
  height: 175,
  age: 30,
  sex: 'male',
  activityLevel: 'moderate',
  goalType: 'lose_weight',
  dietType: 'balanced'
};

// Le système calcule automatiquement :
// BMR ≈ 1750 cal
// TDEE ≈ 2713 cal
// Objectif quotidien ≈ 2213 cal (déficit de 500 cal)
```

### 2. Logger un repas

```typescript
// Depuis une recette
const mealLog = {
  date: '2025-01-15',
  mealType: 'lunch',
  recipeId: 'recipe_123',
  servings: 1.5,
  notes: 'Délicieux!'
};

// Ajout rapide
const quickMeal = {
  date: '2025-01-15',
  mealType: 'snack',
  customFood: {
    name: 'Pomme',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4
  },
  servings: 1
};
```

### 3. Consulter les statistiques

```typescript
// Récupérer les stats du jour
const stats = await fetch('/api/nutrition/daily/2025-01-15');

// Retourne :
// {
//   calories: { consumed: 1850, goal: 2213, remaining: 363, percentage: 84 },
//   protein: { consumed: 120, goal: 166, remaining: 46, percentage: 72 },
//   carbs: { consumed: 220, goal: 221, remaining: 1, percentage: 100 },
//   fat: { consumed: 62, goal: 74, remaining: 12, percentage: 84 },
//   waterIntake: 1500,
//   mealsLogged: [...]
// }
```

## Fonctionnalités Futures (Phase 2)

- [ ] Scan de code-barre avec OpenFoodFacts API
- [ ] Graphiques de progression hebdomadaire/mensuelle
- [ ] Export des données (CSV, PDF)
- [ ] Objectifs d'hydratation personnalisés
- [ ] Photos de repas
- [ ] Partage de recettes avec infos nutritionnelles
