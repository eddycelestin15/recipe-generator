'use client'

import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  description?: string
  showHandle?: boolean
  snapPoints?: number[]
  dismissible?: boolean
  modal?: boolean
  nested?: boolean
  className?: string
}

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  description,
  showHandle = true,
  snapPoints,
  dismissible = true,
  modal = true,
  nested = false,
  className,
}: BottomSheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      dismissible={dismissible}
      modal={modal}
      nested={nested}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-background border-t border-border',
            'max-h-[96vh]',
            className
          )}
        >
          {/* Handle */}
          {showHandle && (
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
          )}

          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {title && (
                    <Drawer.Title className="text-xl font-bold text-foreground mb-1">
                      {title}
                    </Drawer.Title>
                  )}
                  {description && (
                    <Drawer.Description className="text-sm text-muted-foreground">
                      {description}
                    </Drawer.Description>
                  )}
                </div>
                {dismissible && (
                  <button
                    onClick={() => onOpenChange(false)}
                    className="ml-4 p-3 hover:bg-muted rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export interface BottomSheetTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function BottomSheetTrigger({ children, asChild }: BottomSheetTriggerProps) {
  return <Drawer.Trigger asChild={asChild}>{children}</Drawer.Trigger>
}

// Example usage components

export interface QuickActionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actions: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
  }[]
}

export function QuickActionSheet({ open, onOpenChange, actions }: QuickActionSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Quick Actions"
    >
      <div className="p-4 space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick()
              onOpenChange(false)
            }}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl transition-colors min-h-[44px]',
              action.variant === 'destructive'
                ? 'hover:bg-red-500/10 text-red-500'
                : 'hover:bg-muted text-foreground'
            )}
            aria-label={action.label}
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              action.variant === 'destructive'
                ? 'bg-red-500/10'
                : 'bg-muted'
            )}>
              {action.icon}
            </div>
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}

export interface FilterBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: {
    id: string
    label: string
    options: {
      value: string
      label: string
    }[]
    value: string[]
    onChange: (value: string[]) => void
  }[]
  onApply: () => void
  onReset: () => void
}

export function FilterBottomSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  onReset,
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      description="Refine your search"
    >
      <div className="p-6 space-y-6">
        {filters.map((filter) => (
          <div key={filter.id} className="space-y-3">
            <h3 className="font-semibold text-foreground">{filter.label}</h3>
            <div className="flex flex-wrap gap-2">
              {filter.options.map((option) => {
                const isSelected = filter.value.includes(option.value)
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newValue = isSelected
                        ? filter.value.filter((v) => v !== option.value)
                        : [...filter.value, option.value]
                      filter.onChange(newValue)
                    }}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px]',
                      isSelected
                        ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-md scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    )}
                    aria-pressed={isSelected}
                    aria-label={option.label}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={() => {
              onReset()
              onOpenChange(false)
            }}
            className="flex-1 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors min-h-[44px]"
            aria-label="Reset filters"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            aria-label="Apply filters"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}
