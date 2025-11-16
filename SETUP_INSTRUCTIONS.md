# Instructions de Configuration - Fixes AI Features

## Problèmes Résolus ✅

### 1. Weekly Meal Planning - Erreur de génération
**Problème**: La clé API Gemini était mal configurée (`NEXT_PUBLIC_GEMINI_API_KEY` au lieu de `GEMINI_API_KEY`)
**Solution**: Corrigé pour utiliser la bonne variable d'environnement

### 2. AI Nutritionist Chat - Erreur d'envoi de message
**Problème**: Les repositories utilisaient `localStorage` côté serveur (n'existe pas dans Node.js)
**Solution**: Refactorisé pour utiliser MongoDB et stockage en mémoire

### 3. Error Handling Amélioré
- Logs détaillés des erreurs dans la console
- Messages d'erreur clairs pour l'utilisateur
- Vérification de la clé API avant utilisation

## Configuration Requise 🔧

### Étape 1: Obtenir une clé API Gemini (GRATUIT)

1. Allez sur: https://makersuite.google.com/app/apikey
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez la clé générée

### Étape 2: Configurer les Variables d'Environnement

Vous avez deux options:

#### Option A: Créer un fichier .env

```bash
# Créez un fichier .env à la racine du projet
cp .env.local .env

# Ensuite, ouvrez .env et remplacez:
GEMINI_API_KEY=your_gemini_api_key_here

# Par votre vraie clé:
GEMINI_API_KEY=AIzaSy...votre-clé-ici...
```

#### Option B: Utiliser .env.local (recommandé pour le développement)

Le fichier `.env.local` a déjà été créé avec un template.

**Ouvrez `.env.local` et remplacez:**
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Par votre vraie clé:**
```env
GEMINI_API_KEY=AIzaSy...votre-clé-ici...
```

### Étape 3: Redémarrer le Serveur de Développement

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm run dev
```

## Test des Features 🧪

### Weekly Meal Planning

1. Allez sur la page "Weekly Planning"
2. Cliquez sur "Generate AI Plan"
3. Vous devriez voir un plan de repas généré automatiquement

**Si ça ne fonctionne pas:**
- Vérifiez les logs dans la console du navigateur (F12)
- Vérifiez les logs du serveur dans votre terminal
- Assurez-vous que `GEMINI_API_KEY` est bien configuré dans `.env` ou `.env.local`

### AI Nutritionist Chat

1. Allez sur la page "AI Nutritionist"
2. Tapez un message comme "Comment atteindre mes objectifs protéines ?"
3. Vous devriez recevoir une réponse personnalisée

**Si ça ne fonctionne pas:**
- Assurez-vous d'être connecté (authentifié)
- Vérifiez que votre profil utilisateur est créé dans MongoDB
- Vérifiez les logs dans la console

## Variables d'Environnement Importantes

| Variable | Requis | Description |
|----------|--------|-------------|
| `GEMINI_API_KEY` | ✅ OUI | Clé API pour Gemini AI (gratuite) |
| `MONGODB_URI` | ✅ OUI | Connexion MongoDB (déjà configuré) |
| `AUTH_SECRET` | ✅ OUI | Secret pour NextAuth |
| `NEXTAUTH_URL` | ✅ OUI | URL de l'application |
| `GOOGLE_CLIENT_ID` | ❌ Non | Optionnel pour Google OAuth |
| `STRIPE_SECRET_KEY` | ❌ Non | Optionnel pour paiements |

## Debugging 🐛

### Activer les logs détaillés

Les logs détaillés sont maintenant activés automatiquement. Vérifiez:

1. **Console du navigateur (F12)**: Pour les erreurs côté client
2. **Terminal du serveur**: Pour les erreurs côté serveur

### Messages d'erreur courants

#### "AI service not configured"
➡️ Votre `GEMINI_API_KEY` n'est pas configuré ou est invalide

#### "Unauthorized"
➡️ Vous n'êtes pas connecté. Créez un compte ou connectez-vous

#### "User not found"
➡️ Votre compte existe mais le profil utilisateur n'est pas créé dans MongoDB

#### "Failed to generate meal plan"
➡️ Vérifiez les logs du serveur pour plus de détails. Peut-être un problème avec l'API Gemini.

## Changements Techniques 📝

### Fichiers Modifiés:

1. `/app/api/meal-planning/generate/route.ts`
   - Changé `NEXT_PUBLIC_GEMINI_API_KEY` → `GEMINI_API_KEY`
   - Ajout vérification clé API
   - Amélioration error handling

2. `/app/lib/services/gemini-ai-service.ts`
   - Changé `NEXT_PUBLIC_GEMINI_API_KEY` → `GEMINI_API_KEY`
   - Ajout vérification clé API
   - Logs détaillés

3. `/app/api/ai/chat/route.ts`
   - Refactorisé pour ne plus utiliser localStorage
   - Utilise MongoDB via `db.users.findByEmail()`
   - Stockage en mémoire pour l'historique de chat (temporaire)
   - Ajout authentification et error handling

4. `/app/api/ai/chat/history/route.ts`
   - Refactorisé pour ne plus utiliser localStorage
   - Ajout authentification

### Variables d'Environnement:

**AVANT (❌ Incorrect):**
```typescript
process.env.NEXT_PUBLIC_GEMINI_API_KEY
```

**APRÈS (✅ Correct):**
```typescript
process.env.GEMINI_API_KEY
```

**Pourquoi?** Les variables `NEXT_PUBLIC_*` sont exposées au client (navigateur). Pour les clés API secrètes, on ne doit PAS utiliser ce préfixe.

## Support 💬

Si vous rencontrez encore des problèmes:

1. Vérifiez que votre clé API Gemini est valide
2. Vérifiez que MongoDB est accessible
3. Vérifiez les logs du serveur et du navigateur
4. Assurez-vous d'avoir redémarré le serveur après avoir modifié .env

---

**Note**: L'historique de chat est actuellement stocké en mémoire. Il sera perdu au redémarrage du serveur. Une implémentation MongoDB pour la persistance sera ajoutée prochainement.
