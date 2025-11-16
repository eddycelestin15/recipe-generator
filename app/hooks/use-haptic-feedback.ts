"use client"

import { useCallback } from "react"

type HapticType = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error"

/**
 * Hook pour fournir un feedback haptique (vibrations) sur mobile
 * Supporte les vibrations légères pour améliorer l'UX
 */
export function useHapticFeedback() {
  const vibrate = useCallback((type: HapticType = "light") => {
    // Vérifier si l'API Vibration est supportée
    if (!("vibrate" in navigator)) {
      return
    }

    // Définir les patterns de vibration selon le type
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 5,
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    }

    const pattern = patterns[type]

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      // Ignorer les erreurs de vibration (peut échouer sur certains navigateurs)
      console.debug("Haptic feedback not supported:", error)
    }
  }, [])

  return { vibrate }
}
