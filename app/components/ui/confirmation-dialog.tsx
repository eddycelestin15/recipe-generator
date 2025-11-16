"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { AlertTriangle, Trash2, AlertCircle } from "lucide-react"
import { useHapticFeedback } from "@/app/hooks/use-haptic-feedback"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "default"
  loading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Êtes-vous sûr ?",
  description = "Cette action est irréversible.",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "destructive",
  loading = false,
}: ConfirmationDialogProps) {
  const { vibrate } = useHapticFeedback()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    vibrate(variant === "destructive" ? "warning" : "medium")
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Confirmation action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    vibrate("light")
    onOpenChange(false)
  }

  const Icon = variant === "destructive" ? Trash2 : variant === "warning" ? AlertTriangle : AlertCircle

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-full ${
                variant === "destructive"
                  ? "bg-red-100 dark:bg-red-950"
                  : variant === "warning"
                  ? "bg-orange-100 dark:bg-orange-950"
                  : "bg-blue-100 dark:bg-blue-950"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  variant === "destructive"
                    ? "text-red-600 dark:text-red-400"
                    : variant === "warning"
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading || loading}
            loading={isLoading || loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook pour utiliser facilement le ConfirmationDialog
 */
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmationDialogProps, "open" | "onOpenChange">>({
    onConfirm: () => {},
  })

  const confirm = React.useCallback(
    (options: Omit<ConfirmationDialogProps, "open" | "onOpenChange">) => {
      return new Promise<boolean>((resolve) => {
        setConfig({
          ...options,
          onConfirm: async () => {
            try {
              await options.onConfirm()
              resolve(true)
            } catch (error) {
              resolve(false)
              throw error
            }
          },
        })
        setIsOpen(true)
      })
    },
    []
  )

  const ConfirmationDialogComponent = React.useCallback(
    () => <ConfirmationDialog open={isOpen} onOpenChange={setIsOpen} {...config} />,
    [isOpen, config]
  )

  return { confirm, ConfirmationDialog: ConfirmationDialogComponent }
}
