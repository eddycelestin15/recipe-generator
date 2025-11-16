// Dynamic imports for code splitting
import dynamic from 'next/dynamic'
import React from 'react'

// Export types synchronously
export type {
  SwipeableCardProps,
  MealSuggestion,
  SwipeableCardsProps
} from './SwipeableCard'

export type {
  SwipeToDeleteProps,
  PullToRefreshProps,
  PinchToZoomProps,
  SwipeableListItem,
  SwipeableListProps,
  EnhancedPullToRefreshProps
} from './Gestures'

export type {
  MealItem,
  MealSlot,
  MealPlannerProps
} from './DragAndDrop'

export type {
  BottomSheetProps,
  QuickActionSheetProps,
  FilterBottomSheetProps
} from './BottomSheet'

export type {
  CameraCaptureProps
} from './CameraCapture'

// Dynamic imports with loading states
export const SwipeableCard = dynamic(
  () => import('./SwipeableCard').then(mod => ({ default: mod.SwipeableCard })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl" /> }
)

export const SwipeableCards = dynamic(
  () => import('./SwipeableCard').then(mod => ({ default: mod.SwipeableCards })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl" /> }
)

export const SwipeToDelete = dynamic(
  () => import('./Gestures').then(mod => ({ default: mod.SwipeToDelete })),
  { ssr: false }
)

export const PullToRefresh = dynamic(
  () => import('./Gestures').then(mod => ({ default: mod.PullToRefresh })),
  { ssr: false }
)

export const PinchToZoom = dynamic(
  () => import('./Gestures').then(mod => ({ default: mod.PinchToZoom })),
  { ssr: false }
)

export const SwipeableList = dynamic(
  () => import('./Gestures').then(mod => ({ default: mod.SwipeableList })),
  { ssr: false }
)

export const EnhancedPullToRefresh = dynamic(
  () => import('./Gestures').then(mod => ({ default: mod.EnhancedPullToRefresh })),
  { ssr: false }
)

export const MealPlanner = dynamic(
  () => import('./DragAndDrop').then(mod => ({ default: mod.MealPlanner })),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-muted rounded-2xl" /> }
)

export const DraggableMealCard = dynamic(
  () => import('./DragAndDrop').then(mod => ({ default: mod.DraggableMealCard })),
  { ssr: false }
)

export const DroppableSlot = dynamic(
  () => import('./DragAndDrop').then(mod => ({ default: mod.DroppableSlot })),
  { ssr: false }
)

export const BottomSheet = dynamic(
  () => import('./BottomSheet').then(mod => ({ default: mod.BottomSheet })),
  { ssr: false }
)

export const QuickActionSheet = dynamic(
  () => import('./BottomSheet').then(mod => ({ default: mod.QuickActionSheet })),
  { ssr: false }
)

export const FilterBottomSheet = dynamic(
  () => import('./BottomSheet').then(mod => ({ default: mod.FilterBottomSheet })),
  { ssr: false }
)

export const CameraCapture = dynamic(
  () => import('./CameraCapture'),
  { ssr: false }
)
