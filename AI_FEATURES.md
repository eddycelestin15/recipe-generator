# AI Nutritionist & Advanced Features

Documentation complète des fonctionnalités d'intelligence artificielle implémentées.

## Vue d'ensemble

Ce module ajoute un assistant nutritionniste IA complet avec des fonctionnalités avancées d'analyse, de coaching et d'optimisation utilisant Google Gemini AI.

## Features implémentées

### 1. AI Chat Nutritionist (/ai-coach)

**Description:** Interface de chat avec un nutritionniste IA qui connaît votre profil et historique.

**Fonctionnalités:**
- Chat contextuel basé sur le profil utilisateur (poids, objectifs, diet type)
- Accès aux données en temps réel (calories du jour, protéines, workouts de la semaine)
- Historique de conversation sauvegardé
- Réponses personnalisées et encourageantes
- Rate limiting: 50 messages/jour (gratuit), illimité (premium)

**API:**
- `POST /api/ai/chat` - Envoyer un message
- `GET /api/ai/chat/history` - Récupérer l'historique

**Utilisation:**
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Comment atteindre mes objectifs protéines ?' })
});
```

### 2. Photo Food Analysis (/ai-coach/photo)

**Description:** Analyse de photos de repas avec Gemini Vision pour identifier les aliments et estimer les valeurs nutritionnelles.

**Fonctionnalités:**
- Upload de photo (base64)
- Identification des aliments avec niveau de confiance
- Estimation des calories, protéines, glucides, lipides
- Évaluation globale du repas
- Quick add au meal log
- Rate limiting: 10 analyses/jour (gratuit), illimité (premium)

**API:**
- `POST /api/ai/analyze-photo` - Analyser une photo
- `GET /api/ai/analyze-photo` - Historique des analyses

**Utilisation:**
```typescript
const response = await fetch('/api/ai/analyze-photo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageBase64: base64String })
});
```

### 3. AI Insights System (/insights)

**Description:** Système d'insights automatiques avec alertes, suggestions, achievements et tips.

**Types d'insights:**
- **Alert:** Carences nutritionnelles, dépassements d'objectifs
- **Suggestion:** Conseils pour améliorer la nutrition
- **Achievement:** Célébration des succès (streaks, conformité)
- **Tip:** Conseils nutritionnels généraux

**Priorités:**
- **High:** Nécessite une action immédiate
- **Medium:** Important mais pas urgent
- **Low:** Informatif

**API:**
- `GET /api/ai/insights` - Tous les insights
- `GET /api/ai/insights?unread=true` - Insights non lus
- `POST /api/ai/insights` - Créer un insight manuel
- `POST /api/ai/insights/[id]/read` - Marquer comme lu
- `DELETE /api/ai/insights/[id]` - Supprimer

**Insights automatiques:**
Le système génère automatiquement des insights basés sur:
- Carences en protéines (< 70% objectif pendant 3+ jours)
- Carences en fibres (< 20g/jour)
- Excès/déficit calorique (> 300 cal d'écart)
- Manque d'activité physique (≤ 1 workout/semaine)
- Succès: tracking constant, streaks d'entraînement

### 4. Weekly Review

**Description:** Analyse hebdomadaire complète avec score de conformité et recommandations.

**API:**
- `POST /api/ai/weekly-review` - Générer une analyse hebdomadaire

**Analyse générée:**
```json
{
  "complianceScore": 85,
  "positives": ["3 points positifs"],
  "improvements": [
    {"issue": "problème", "action": "action concrète"}
  ],
  "insight": "insight surprenant",
  "motivationalMessage": "message personnalisé"
}
```

**Utilisation:**
```typescript
const response = await fetch('/api/ai/weekly-review', {
  method: 'POST'
});
```

### 5. Meal Plan Optimization

**Description:** Suggestions IA pour optimiser un meal plan existant.

**API:**
- `POST /api/ai/optimize-plan` - Optimiser un meal plan

**Paramètres:**
```json
{
  "mealPlanId": "plan_id",
  "weekDate": "2024-01-15"
}
```

**Résultat:**
```json
{
  "currentPlan": {
    "avgCalories": 2100,
    "avgProtein": 140
  },
  "optimization": {
    "assessment": "évaluation globale",
    "suggestions": [
      {"issue": "...", "recommendation": "...", "priority": "high"}
    ],
    "swapIdeas": [
      {"original": "...", "replacement": "...", "benefit": "+10g protéines"}
    ]
  }
}
```

### 6. Rate Limiting

**Description:** Gestion des limites d'utilisation par tier (free/premium).

**Limites:**
- **Free:**
  - Photo analysis: 10/jour
  - Chat messages: 50/jour
- **Premium:**
  - Illimité

**API:**
- `GET /api/ai/rate-limit` - Statut actuel

**Service:**
```typescript
import { RateLimitService } from '@/app/lib/services/rate-limit-service';

// Vérifier si autorisé
const canUse = RateLimitService.canUsePhotoAnalysis();
// { allowed: true, remaining: 8, limit: 10 }

// Enregistrer utilisation
RateLimitService.recordPhotoAnalysis();

// Changer de tier
RateLimitService.setUserTier('premium');
```

## Architecture

### Repositories (localStorage)

```
app/lib/repositories/
├── chat-message-repository.ts      # Messages de chat
├── food-photo-repository.ts        # Analyses de photos
└── ai-insight-repository.ts        # Insights IA
```

### Services

```
app/lib/services/
├── gemini-ai-service.ts           # Intégration Gemini AI
├── rate-limit-service.ts          # Gestion rate limiting
└── auto-insights-service.ts       # Génération automatique d'insights
```

### API Routes

```
app/api/ai/
├── chat/
│   ├── route.ts                   # POST/GET chat
│   └── history/route.ts           # GET/DELETE historique
├── analyze-photo/
│   └── route.ts                   # POST/GET analyses
├── insights/
│   ├── route.ts                   # GET/POST insights
│   └── [id]/
│       ├── route.ts               # PATCH/DELETE insight
│       └── read/route.ts          # POST mark as read
├── weekly-review/
│   └── route.ts                   # POST générer analyse
├── optimize-plan/
│   └── route.ts                   # POST optimiser plan
└── rate-limit/
    └── route.ts                   # GET statut
```

### Components

```
app/components/
├── ChatInterface.tsx              # Interface de chat
├── PhotoUploader.tsx              # Upload et analyse photo
├── InsightCard.tsx                # Carte d'insight
└── AIInsightsInitializer.tsx      # Initialisation auto-insights
```

### Pages

```
app/
├── ai-coach/
│   ├── page.tsx                   # Chat nutritionniste
│   └── photo/
│       └── page.tsx               # Analyse photo
└── insights/
    └── page.tsx                   # Dashboard insights
```

## Types

```typescript
// Chat
interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: ChatContext;
}

// Photo Analysis
interface FoodPhotoAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  analyzedDate: Date;
  identifiedFoods: IdentifiedFood[];
  totalEstimated: TotalEstimated;
  overallAssessment: string;
  wasLoggedAsMeal: boolean;
}

// Insights
interface AIInsight {
  id: string;
  userId: string;
  type: 'alert' | 'suggestion' | 'achievement' | 'tip';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionable?: string;
  actionLink?: string;
  createdDate: Date;
  read: boolean;
}
```

## Configuration

### Variables d'environnement requises

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Navigation

Les nouvelles pages sont automatiquement ajoutées à la navigation:
- **Coach IA** (`/ai-coach`) - Avec icône Brain
- **Insights** (`/insights`) - Avec icône Sparkles et badge pour insights non lus

## Auto Insights

Le service `AutoInsightsService` s'exécute automatiquement:
- À l'initialisation de l'app
- Toutes les heures
- Génère des insights si 24h se sont écoulées depuis la dernière génération

**Insights générés automatiquement:**
1. Alerte protéines insuffisantes
2. Suggestion augmenter fibres
3. Alerte/suggestion calories (excès/déficit)
4. Achievement streak d'entraînement (5+ workouts/semaine)
5. Suggestion manque d'activité (≤1 workout/semaine)
6. Achievement excellent suivi (6+ jours/semaine)
7. Tip balance nutritionnelle

## Prompts Gemini optimisés

### Chat Nutritionist
- Contexte complet du profil utilisateur
- Historique de conversation (4 derniers messages)
- Réponses concises (max 150 mots)
- Ton encourageant et personnalisé

### Photo Analysis
- Identification précise des aliments
- Estimation des portions
- Niveau de confiance par aliment
- Format JSON structuré

### Weekly Analysis
- Score de conformité 0-100
- 3 points positifs
- 2 axes d'amélioration avec actions
- 1 insight surprenant
- Message motivationnel adapté

## Testing

Pour tester les fonctionnalités:

```typescript
// Générer des insights de test
await fetch('/api/ai/weekly-review', { method: 'POST' });

// Chat
await fetch('/api/ai/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Test message' })
});

// Vérifier rate limits
const limits = await fetch('/api/ai/rate-limit').then(r => r.json());
console.log(limits);
```

## Limitations connues

1. **Photo Analysis:** Nécessite base64, pas encore de support URL directe
2. **Rate Limiting:** Basé sur localStorage, pas synchronisé entre onglets
3. **Cron Jobs:** Simulés avec setInterval, pas de vrais cron jobs
4. **Offline:** Nécessite connexion internet pour Gemini AI

## Améliorations futures

- [ ] Support upload direct d'images (pas seulement base64)
- [ ] Synchronisation rate limits multi-onglets
- [ ] Streaming responses pour le chat
- [ ] Export de conversation
- [ ] Suggestions de recettes basées sur carences détectées
- [ ] Analyse de tendances sur plusieurs semaines
- [ ] Comparaison avec d'autres utilisateurs (anonymisée)
- [ ] Intégration calendrier pour planification repas IA
