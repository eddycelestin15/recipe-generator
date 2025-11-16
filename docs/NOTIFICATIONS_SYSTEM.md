# Système de Notifications et Feedback Utilisateur

Ce document décrit le système de notifications et feedback utilisateur implémenté dans l'application Recipe Health.

## 📦 Composants et Hooks

### 1. **Toasts (Sonner)**
Position responsive : `top-center` sur mobile, `bottom-right` sur desktop

### 2. **Haptic Feedback**
Vibrations légères sur mobile pour améliorer l'UX

### 3. **Ripple Effect**
Effet visuel sur tous les boutons lors du clic

### 4. **Confirmation Dialog**
Dialog de confirmation pour les actions destructives

---

## 🎯 Utilisation

### Hook `useToast`

```tsx
import { useToast } from '@/app/hooks/use-toast'

function MyComponent() {
  const { success, error, info, warning, loading, promise } = useToast()

  // Toast de succès
  const handleSuccess = () => {
    success('Recette sauvegardée !', {
      description: 'Votre recette a été enregistrée avec succès.',
      duration: 4000,
    })
  }

  // Toast d'erreur
  const handleError = () => {
    error('Erreur lors de la sauvegarde', {
      description: 'Veuillez réessayer plus tard.',
      duration: 5000,
    })
  }

  // Toast d'information
  const handleInfo = () => {
    info('Astuce du jour', {
      description: 'Utilisez le mode sombre pour économiser la batterie.',
    })
  }

  // Toast de warning
  const handleWarning = () => {
    warning('Attention', {
      description: 'Cette action nécessite une connexion.',
    })
  }

  // Toast de chargement
  const handleLoading = () => {
    const toastId = loading('Chargement en cours...')
    // Plus tard, dismiss le toast
    // dismiss(toastId)
  }

  // Toast avec promesse
  const handlePromise = async () => {
    const myPromise = fetch('/api/recipes').then(res => res.json())

    promise(myPromise, {
      loading: 'Chargement des recettes...',
      success: 'Recettes chargées !',
      error: 'Erreur lors du chargement',
    })
  }

  // Toast avec actions
  const handleActionToast = () => {
    success('Recette supprimée', {
      action: {
        label: 'Annuler',
        onClick: () => {
          // Restore recipe
        },
      },
    })
  }

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  )
}
```

---

### Hook `useHapticFeedback`

```tsx
import { useHapticFeedback } from '@/app/hooks/use-haptic-feedback'

function MyComponent() {
  const { vibrate } = useHapticFeedback()

  const handleClick = () => {
    vibrate('light') // Types: light, medium, heavy, selection, success, warning, error
  }

  return <button onClick={handleClick}>Click me</button>
}
```

---

### Composant `Button` avec Ripple Effect

Le composant `Button` inclut automatiquement le ripple effect et haptic feedback.

```tsx
import { Button } from '@/app/components/ui/button'

function MyComponent() {
  return (
    <>
      {/* Bouton normal avec ripple et haptic */}
      <Button onClick={handleClick}>
        Cliquez-moi
      </Button>

      {/* Bouton avec loading */}
      <Button loading={isLoading} loadingText="Chargement...">
        Sauvegarder
      </Button>

      {/* Bouton destructif */}
      <Button variant="destructive" onClick={handleDelete}>
        Supprimer
      </Button>

      {/* Désactiver le ripple */}
      <Button enableRipple={false}>
        Sans ripple
      </Button>

      {/* Désactiver le haptic */}
      <Button enableHaptic={false}>
        Sans haptic
      </Button>
    </>
  )
}
```

---

### Composant `ConfirmationDialog`

Pour les actions destructives ou importantes.

```tsx
import { ConfirmationDialog, useConfirmationDialog } from '@/app/components/ui/confirmation-dialog'
import { useState } from 'react'

// Méthode 1 : Avec le hook
function MyComponent() {
  const { confirm, ConfirmationDialog } = useConfirmationDialog()

  const handleDelete = async () => {
    await confirm({
      title: 'Supprimer cette recette ?',
      description: 'Cette action est irréversible. Voulez-vous continuer ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'destructive',
      onConfirm: async () => {
        // Delete logic here
        await deleteRecipe()
      },
    })
  }

  return (
    <>
      <Button onClick={handleDelete}>Supprimer</Button>
      <ConfirmationDialog />
    </>
  )
}

// Méthode 2 : Direct component usage
function MyComponentDirect() {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = async () => {
    // Delete logic
    await deleteRecipe()
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Supprimer</Button>

      <ConfirmationDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Supprimer cette recette ?"
        description="Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  )
}
```

---

## 🎨 Variantes de Dialog

```tsx
// Destructive (rouge) - pour suppressions, etc.
<ConfirmationDialog
  variant="destructive"
  title="Supprimer ?"
  // ...
/>

// Warning (orange) - pour avertissements
<ConfirmationDialog
  variant="warning"
  title="Attention !"
  // ...
/>

// Default (bleu) - pour confirmations normales
<ConfirmationDialog
  variant="default"
  title="Confirmer ?"
  // ...
/>
```

---

## 📱 Exemples d'intégration

### Exemple : Suppression de recette

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { useToast } from '@/app/hooks/use-toast'
import { useConfirmationDialog } from '@/app/components/ui/confirmation-dialog'

export function RecipeCard({ recipe }) {
  const { success, error } = useToast()
  const { confirm, ConfirmationDialog } = useConfirmationDialog()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    await confirm({
      title: 'Supprimer cette recette ?',
      description: `Voulez-vous vraiment supprimer "${recipe.name}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      variant: 'destructive',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE' })
          success('Recette supprimée', {
            description: `"${recipe.name}" a été supprimée avec succès.`,
            action: {
              label: 'Annuler',
              onClick: () => {
                // Restore recipe
              },
            },
          })
        } catch (err) {
          error('Erreur', {
            description: 'Impossible de supprimer la recette. Réessayez.',
          })
        } finally {
          setIsDeleting(false)
        }
      },
    })
  }

  return (
    <>
      <div className="recipe-card">
        <h3>{recipe.name}</h3>
        <Button
          variant="destructive"
          onClick={handleDelete}
          loading={isDeleting}
        >
          Supprimer
        </Button>
      </div>
      <ConfirmationDialog />
    </>
  )
}
```

### Exemple : Sauvegarde avec promesse

```tsx
'use client'

import { Button } from '@/app/components/ui/button'
import { useToast } from '@/app/hooks/use-toast'

export function RecipeForm({ recipe }) {
  const { promise } = useToast()

  const handleSave = async () => {
    const savePromise = fetch('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }).then(res => res.json())

    promise(savePromise, {
      loading: 'Sauvegarde en cours...',
      success: 'Recette sauvegardée avec succès !',
      error: 'Erreur lors de la sauvegarde',
    })
  }

  return (
    <form>
      {/* Form fields */}
      <Button onClick={handleSave}>
        Sauvegarder
      </Button>
    </form>
  )
}
```

---

## 🎯 Bonnes Pratiques

### 1. **Toasts**
- Utilisez `success` pour les actions réussies
- Utilisez `error` pour les erreurs (duration plus longue)
- Utilisez `info` pour des informations non critiques
- Utilisez `warning` pour des avertissements
- Utilisez `loading` pour les opérations longues
- Utilisez `promise` pour les opérations asynchrones automatiques

### 2. **Haptic Feedback**
- `light` : Interactions légères (clics normaux)
- `medium` : Interactions importantes (sélections)
- `heavy` : Interactions très importantes
- `selection` : Changements de sélection
- `success` : Succès (pattern court)
- `warning` : Avertissements (pattern moyen)
- `error` : Erreurs (pattern long)

### 3. **Confirmation Dialog**
- Toujours utiliser pour les actions destructives (suppressions)
- Utiliser pour les actions importantes (publier, partager)
- Textes clairs et descriptifs
- Variant approprié (`destructive`, `warning`, `default`)

### 4. **Ripple Effect**
- Activé par défaut sur tous les boutons
- Désactiver si nécessaire avec `enableRipple={false}`
- Améliore le feedback visuel tactile

---

## 🔧 Configuration

### Position des toasts
La position est automatiquement responsive :
- **Mobile** : `top-center`
- **Desktop** : `bottom-right`

Configuration dans `/app/providers.tsx`.

### Durées par défaut
- Success : 4000ms
- Error : 5000ms
- Info : 4000ms
- Warning : 4000ms
- Loading : Infinity (jusqu'à dismiss)

---

## 📁 Fichiers créés

```
/app/providers.tsx                              # Toaster configuration
/app/hooks/use-toast.ts                         # Toast hook avec haptic
/app/hooks/use-haptic-feedback.ts               # Haptic feedback hook
/app/components/ui/button.tsx                   # Button avec ripple + haptic
/app/components/ui/dialog.tsx                   # Dialog base (Radix UI)
/app/components/ui/confirmation-dialog.tsx      # Confirmation dialog
/app/globals.css                                # Ripple animation
```

---

## 🚀 Migration

### Remplacer les anciens boutons

```tsx
// Avant
import { ButtonWithLoading } from '@/app/components/ui/button-with-loading'

<ButtonWithLoading loading={isLoading}>
  Save
</ButtonWithLoading>

// Après
import { Button } from '@/app/components/ui/button'

<Button loading={isLoading}>
  Save
</Button>
```

### Remplacer les anciens toasts

Si vous utilisiez un autre système de toast, remplacez-le par `useToast` :

```tsx
// Avant
toast.success('Success!')

// Après
import { useToast } from '@/app/hooks/use-toast'
const { success } = useToast()
success('Success!')
```

---

## 🎉 Résumé

Le système de notifications offre :
- ✅ Toasts responsive (Sonner)
- ✅ Haptic feedback sur mobile
- ✅ Ripple effect sur boutons
- ✅ Dialogs de confirmation
- ✅ UX smooth et satisfaisante
- ✅ API simple et intuitive
- ✅ Support dark mode
- ✅ Accessible et moderne
