"use client"

import { toast as sonnerToast, ExternalToast } from "sonner"
import { useHapticFeedback } from "./use-haptic-feedback"
import { useCallback } from "react"

type ToastOptions = ExternalToast

/**
 * Hook pour afficher des toasts avec feedback haptique intégré
 * Encapsule Sonner toast avec des patterns de feedback utilisateur
 */
export function useToast() {
  const { vibrate } = useHapticFeedback()

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      vibrate("success")
      return sonnerToast.success(message, {
        duration: 4000,
        ...options,
      })
    },
    [vibrate]
  )

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      vibrate("error")
      return sonnerToast.error(message, {
        duration: 5000, // Longer duration for errors
        ...options,
      })
    },
    [vibrate]
  )

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      vibrate("light")
      return sonnerToast.info(message, {
        duration: 4000,
        ...options,
      })
    },
    [vibrate]
  )

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      vibrate("warning")
      return sonnerToast.warning(message, {
        duration: 4000,
        ...options,
      })
    },
    [vibrate]
  )

  const loading = useCallback(
    (message: string, options?: ToastOptions) => {
      vibrate("light")
      return sonnerToast.loading(message, {
        description: options?.description,
        duration: options?.duration || Infinity, // Loading toasts should persist
      })
    },
    [vibrate]
  )

  const promise = useCallback(
    <T,>(
      promise: Promise<T>,
      {
        loading: loadingMessage,
        success: successMessage,
        error: errorMessage,
      }: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
      }
    ) => {
      vibrate("light")
      return sonnerToast.promise(promise, {
        loading: loadingMessage,
        success: (data) => {
          vibrate("success")
          return typeof successMessage === "function"
            ? successMessage(data)
            : successMessage
        },
        error: (error) => {
          vibrate("error")
          return typeof errorMessage === "function"
            ? errorMessage(error)
            : errorMessage
        },
      })
    },
    [vibrate]
  )

  const dismiss = useCallback((toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  }, [])

  return {
    success,
    error,
    info,
    warning,
    loading,
    promise,
    dismiss,
    // Expose the raw toast for custom use cases
    toast: sonnerToast,
  }
}
