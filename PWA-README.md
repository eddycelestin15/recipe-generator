# Recipe Health App - PWA Setup

L'application a été transformée en PWA (Progressive Web App) installable avec support offline complet.

## ✨ Fonctionnalités PWA

### 🎯 Installation
- **Prompt d'installation automatique** : Modal élégante qui apparaît après 3-5 secondes
- **Support multi-plateformes** : iOS, Android, Desktop (Chrome, Edge, Safari)
- **Icônes adaptatives** : Icônes maskables pour Android avec safe zone
- **Raccourcis d'application** :
  - 📝 Log Meal - Accès rapide à l'enregistrement de repas
  - 💪 Start Workout - Démarrage rapide d'un workout

### 📴 Mode Offline
- **Cache intelligent** avec stratégies optimisées :
  - `NetworkFirst` pour les pages et API (avec fallback cache)
  - `StaleWhileRevalidate` pour les images et assets statiques
  - `CacheFirst` pour les polices et médias
- **Page offline dédiée** : `/offline.html` avec design moderne
- **Détection automatique** de la connexion internet
- **Synchronisation automatique** une fois reconnecté

### 🎨 Design
- **Modal d'installation élégante** avec animations fluides
- **Support dark mode** complet
- **Design responsive** pour tous les appareils
- **Icônes de 72x72 à 512x512** pixels

## 🚀 Test de l'installation PWA

### Sur Desktop (Chrome/Edge)

1. **Lancez l'application** :
   ```bash
   npm run dev
   # ou
   npm run build && npm start
   ```

2. **Ouvrez Chrome/Edge** et naviguez vers `http://localhost:3000`

3. **Vérifiez que la PWA est installable** :
   - Ouvrez DevTools (F12)
   - Allez dans l'onglet "Application" (ou "Manifest")
   - Vérifiez que le manifest.json est chargé correctement
   - Vérifiez que le Service Worker est enregistré

4. **Installez l'application** :
   - Attendez l'apparition de la modal d'installation (3-5 secondes)
   - OU cliquez sur l'icône d'installation dans la barre d'adresse
   - OU via le menu : Plus d'outils → Installer Recipe Health App

5. **Testez le mode offline** :
   - Ouvrez DevTools → Network
   - Cochez "Offline"
   - Rechargez la page
   - Vous devriez voir la page offline ou les pages en cache

### Sur iOS (iPhone/iPad)

1. **Ouvrez Safari** et naviguez vers votre app

2. **Installez via le menu de partage** :
   - Appuyez sur le bouton de partage (icône avec flèche vers le haut)
   - Faites défiler et sélectionnez "Sur l'écran d'accueil"
   - Donnez un nom à l'app
   - Appuyez sur "Ajouter"

3. **Lancez depuis l'écran d'accueil** :
   - L'app s'ouvre en mode plein écran sans barre Safari
   - Fonctionne comme une app native

### Sur Android

1. **Ouvrez Chrome** et naviguez vers votre app

2. **Installez l'application** :
   - Une bannière d'installation apparaît automatiquement
   - OU utilisez la modal personnalisée qui apparaît après quelques secondes
   - OU via le menu : Plus → Installer l'application

3. **Lancez depuis l'écran d'accueil ou le tiroir d'applications**

## 🛠️ Configuration technique

### Fichiers PWA créés

```
public/
├── manifest.json              # Manifest de l'app
├── icon-*.png                 # Icônes (72x72 à 512x512)
├── icon-maskable-*.png        # Icônes maskables pour Android
├── shortcut-*.png             # Icônes pour les raccourcis
├── screenshot-*.png           # Screenshots pour l'installeur
├── offline.html               # Page de fallback offline
└── sw.js                      # Service Worker (généré au build)

app/
└── components/
    └── InstallPrompt.tsx      # Modal d'installation

scripts/
└── generate-icons.js          # Script de génération d'icônes
```

### Stratégies de cache

| Type de ressource | Stratégie | Durée de cache |
|-------------------|-----------|----------------|
| Pages HTML | NetworkFirst | 24h |
| API calls | NetworkFirst (10s timeout) | 24h |
| Images | StaleWhileRevalidate | 24h |
| Fonts Google | CacheFirst | 1 an |
| CSS/JS | StaleWhileRevalidate | 24h |
| Audio/Video | CacheFirst | 24h |

### Configuration next-pwa

```typescript
// next.config.ts
export default withPWA({
  dest: "public",           // Destination du service worker
  register: true,           // Auto-registration
  skipWaiting: true,        // Activation immédiate
  disable: NODE_ENV === "development", // Désactivé en dev
  runtimeCaching: [...]     // Stratégies de cache
})(nextConfig);
```

## 📝 Scripts disponibles

```bash
# Générer les icônes PWA
npm run generate:icons

# Build l'app avec PWA
npm run build

# Démarrer en production
npm start

# Dev mode (PWA désactivée)
npm run dev
```

## ✅ Checklist de vérification PWA

Utilisez Lighthouse dans Chrome DevTools pour vérifier :

- [ ] ✅ Installable (score PWA 100%)
- [ ] ✅ Manifest valide
- [ ] ✅ Service Worker enregistré
- [ ] ✅ HTTPS (en production)
- [ ] ✅ Icônes de toutes tailles présentes
- [ ] ✅ Meta tags appropriés
- [ ] ✅ Viewport configuré
- [ ] ✅ Theme color définie
- [ ] ✅ Page offline fonctionne
- [ ] ✅ Cache stratégies fonctionnent

## 🎨 Personnalisation

### Changer les couleurs du thème

Modifiez dans `public/manifest.json` :
```json
{
  "theme_color": "#10b981",      // Couleur de la barre d'état
  "background_color": "#ffffff"  // Couleur de fond au lancement
}
```

### Régénérer les icônes

1. Modifiez `public/icon.svg`
2. Lancez `npm run generate:icons`
3. Les icônes PNG seront régénérées

### Modifier le comportement d'installation

Éditez `app/components/InstallPrompt.tsx` :
- Délai d'apparition (ligne 35 : `setTimeout`)
- Fréquence de ré-affichage (ligne 27 : `daysSinceDismissed < 7`)
- Contenu de la modal

## 🌐 Déploiement

### Vercel / Netlify

1. **Assurez-vous que HTTPS est activé** (obligatoire pour PWA)
2. **Vérifiez les headers** de sécurité
3. **Testez l'installation** depuis l'URL de production

### Variables d'environnement

Aucune variable spéciale requise pour la PWA.

## 🐛 Dépannage

### La modal d'installation n'apparaît pas

- Vérifiez que vous êtes en production (`npm run build && npm start`)
- Vérifiez que le service worker est enregistré (DevTools → Application)
- Vérifiez que l'app n'est pas déjà installée
- Vérifiez que vous n'avez pas déjà refusé l'installation (localStorage)

### Le mode offline ne fonctionne pas

- Vérifiez que le service worker est actif (DevTools → Application → Service Workers)
- Videz le cache et rechargez
- Vérifiez les stratégies de cache dans `next.config.ts`

### Erreurs de build

- Si problème avec Turbopack : utilisez `npm run build -- --webpack`
- Si problème avec les polices : vérifiez votre connexion internet
- Vérifiez que next-pwa est bien installé : `npm list next-pwa`

## 📚 Ressources

- [Next.js PWA Documentation](https://www.npmjs.com/package/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## 🎉 Résultat

Votre app est maintenant :
- ✅ **Installable** sur tous les appareils
- ✅ **Fonctionnelle offline** pour les pages visitées
- ✅ **Optimisée** avec cache intelligent
- ✅ **Prête pour le store** (avec quelques ajustements)
- ✅ **Conforme PWA** aux standards modernes

Profitez de votre Progressive Web App ! 🚀
