'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { GripVertical, Calendar, Clock, Utensils } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export interface MealItem {
  id: string
  name: string
  image?: string
  prepTime: string
  calories: number
  slot?: string
}

export interface MealSlot {
  id: string
  name: string
  time: string
  meal: MealItem | null
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <div {...attributes} {...listeners}>
        {children}
      </div>
    </div>
  )
}

interface DraggableMealCardProps {
  meal: MealItem
  showGrip?: boolean
  compact?: boolean
}

export function DraggableMealCard({ meal, showGrip = true, compact = false }: DraggableMealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: meal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50 scale-105 shadow-2xl z-50'
      )}
    >
      <motion.div
        layout
        className={cn(
          'bg-card rounded-xl border border-border overflow-hidden',
          'hover:shadow-lg transition-all cursor-grab active:cursor-grabbing',
          compact ? 'p-3' : 'p-4'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-3">
          {showGrip && (
            <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}

          {meal.image && !compact && (
            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              <img
                src={meal.image}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {meal.name}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{meal.prepTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Utensils className="w-3 h-3" />
                <span>{meal.calories} cal</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface DroppableSlotProps {
  slot: MealSlot
  onDrop?: (mealId: string, slotId: string) => void
  children?: React.ReactNode
}

export function DroppableSlot({ slot, children }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useSortable({
    id: slot.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 rounded-xl border-2 border-dashed transition-all min-h-[120px]',
        isOver
          ? 'border-primary bg-primary/5 scale-105'
          : 'border-border bg-muted/30',
        slot.meal && 'border-solid bg-card'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{slot.name}</h3>
          <p className="text-sm text-muted-foreground">{slot.time}</p>
        </div>
        {!slot.meal && (
          <Utensils className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {slot.meal ? (
        <DraggableMealCard meal={slot.meal} showGrip={false} compact />
      ) : (
        <div className="flex items-center justify-center h-16 text-muted-foreground text-sm">
          Drop a meal here
        </div>
      )}

      {children}
    </div>
  )
}

export interface MealPlannerProps {
  meals: MealItem[]
  slots: MealSlot[]
  onMealsChange: (meals: MealItem[]) => void
  onSlotsChange: (slots: MealSlot[]) => void
}

export function MealPlanner({ meals, slots, onMealsChange, onSlotsChange }: MealPlannerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dragging meal to slot
    const isActiveAMeal = meals.some((m) => m.id === activeId)
    const isOverASlot = slots.some((s) => s.id === overId)

    if (isActiveAMeal && isOverASlot) {
      // Visual feedback handled by isOver in DroppableSlot
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if rearranging meals
    const isMealReorder = meals.some((m) => m.id === activeId) && meals.some((m) => m.id === overId)
    if (isMealReorder && activeId !== overId) {
      const oldIndex = meals.findIndex((m) => m.id === activeId)
      const newIndex = meals.findIndex((m) => m.id === overId)
      onMealsChange(arrayMove(meals, oldIndex, newIndex))
      return
    }

    // Check if assigning meal to slot
    const meal = meals.find((m) => m.id === activeId)
    const slot = slots.find((s) => s.id === overId)

    if (meal && slot) {
      // Remove meal from previous slot if exists
      const updatedSlots = slots.map((s) => {
        if (s.meal?.id === meal.id) {
          return { ...s, meal: null }
        }
        if (s.id === slot.id) {
          return { ...s, meal }
        }
        return s
      })
      onSlotsChange(updatedSlots)
    }

    // Check if moving meal between slots
    const fromSlot = slots.find((s) => s.meal?.id === activeId)
    const toSlot = slots.find((s) => s.id === overId)

    if (fromSlot && toSlot && fromSlot.id !== toSlot.id) {
      const updatedSlots = slots.map((s) => {
        if (s.id === fromSlot.id) {
          return { ...s, meal: toSlot.meal }
        }
        if (s.id === toSlot.id) {
          return { ...s, meal: fromSlot.meal }
        }
        return s
      })
      onSlotsChange(updatedSlots)
    }
  }

  const activeMeal = activeId ? meals.find((m) => m.id === activeId) || slots.find((s) => s.meal?.id === activeId)?.meal : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Meals */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Available Meals</h2>
          </div>

          <SortableContext items={meals.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {meals.map((meal) => (
                <SortableItem key={meal.id} id={meal.id}>
                  <DraggableMealCard meal={meal} />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Meal Slots */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Today's Plan</h2>
          </div>

          <SortableContext items={slots.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="space-y-3">
              {slots.map((slot) => (
                <DroppableSlot key={slot.id} slot={slot} />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeMeal ? (
          <div className="opacity-90 rotate-3 scale-105">
            <DraggableMealCard meal={activeMeal} showGrip={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Example usage component
export function MealPlannerExample() {
  const [meals, setMeals] = useState<MealItem[]>([
    {
      id: '1',
      name: 'Greek Yogurt Bowl',
      prepTime: '5 min',
      calories: 320,
      image: '/placeholder.jpg',
    },
    {
      id: '2',
      name: 'Chicken Caesar Salad',
      prepTime: '15 min',
      calories: 450,
    },
    {
      id: '3',
      name: 'Salmon with Vegetables',
      prepTime: '25 min',
      calories: 520,
    },
  ])

  const [slots, setSlots] = useState<MealSlot[]>([
    { id: 'breakfast', name: 'Breakfast', time: '8:00 AM', meal: null },
    { id: 'lunch', name: 'Lunch', time: '12:30 PM', meal: null },
    { id: 'dinner', name: 'Dinner', time: '7:00 PM', meal: null },
    { id: 'snack', name: 'Snack', time: '3:00 PM', meal: null },
  ])

  return (
    <div className="p-6">
      <MealPlanner
        meals={meals}
        slots={slots}
        onMealsChange={setMeals}
        onSlotsChange={setSlots}
      />
    </div>
  )
}
