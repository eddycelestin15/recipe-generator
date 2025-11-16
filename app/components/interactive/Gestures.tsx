'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useSpring, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Trash2, RefreshCw, ZoomOut } from 'lucide-react'
import { cn } from '@/app/lib/utils'

// Swipe to Delete Component
export interface SwipeToDeleteProps {
  children: React.ReactNode
  onDelete: () => void
  deleteThreshold?: number
  className?: string
}

export function SwipeToDelete({
  children,
  onDelete,
  deleteThreshold = 150,
  className,
}: SwipeToDeleteProps) {
  const x = useMotionValue(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteOpacity = useTransform(
    x,
    [-deleteThreshold, 0],
    [1, 0]
  )

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const mx = info.offset.x
    const vx = Math.abs(info.velocity.x)

    // Only allow left swipe
    if (mx > 0) {
      x.set(0)
      return
    }

    // Check if should delete
    if (mx < -deleteThreshold || (vx > 500 && mx < 0)) {
      setIsDeleting(true)
      setTimeout(() => {
        onDelete()
      }, 300)
    } else {
      x.set(0)
    }
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const mx = info.offset.x
    // Only allow left swipe
    if (mx > 0) {
      x.set(0)
      return
    }
    x.set(mx)
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Delete background */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 bg-gradient-to-l from-red-500 to-red-600 flex items-center justify-end px-6"
      >
        <Trash2 className="w-6 h-6 text-white" />
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -1000, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isDeleting ? { x: -1000, opacity: 0 } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="touch-none relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Pull to Refresh Component
export interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  pullThreshold?: number
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  pullThreshold = 100,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const y = useSpring(0, { stiffness: 300, damping: 30 })
  const containerRef = useRef<HTMLDivElement>(null)

  const rotation = useTransform(y, [0, pullThreshold], [0, 360])
  const iconOpacity = useTransform(y, [0, pullThreshold / 2, pullThreshold], [0, 0.5, 1])
  const iconScale = useTransform(y, [0, pullThreshold], [0.5, 1])

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const container = containerRef.current
    if (!container || isRefreshing) return

    // Only trigger when at top of scroll
    if (container.scrollTop > 0) {
      y.set(0)
      return
    }

    const my = info.offset.y

    // Only allow downward pull
    if (my < 0) {
      y.set(0)
      return
    }

    // Apply rubber band effect
    const rubberBand = Math.min(my * 0.5, pullThreshold * 1.5)
    y.set(rubberBand)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const rubberBand = Math.min(info.offset.y * 0.5, pullThreshold * 1.5)
    const vy = Math.abs(info.velocity.y)

    // Trigger refresh
    if (rubberBand >= pullThreshold && info.offset.y > 0) {
      setIsRefreshing(true)
      y.set(pullThreshold)

      onRefresh().finally(() => {
        setIsRefreshing(false)
        y.set(0)
      })
    } else if (!isRefreshing) {
      y.set(0)
    }
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <motion.div
        style={{ opacity: iconOpacity }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
      >
        <motion.div
          style={{ rotate: rotation, scale: iconScale }}
          className="mt-4"
        >
          <RefreshCw
            className={cn(
              'w-8 h-8 text-primary',
              isRefreshing && 'animate-spin'
            )}
          />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-none overflow-y-auto h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Pinch to Zoom Image Component
export interface PinchToZoomProps {
  src: string
  alt?: string
  className?: string
  maxZoom?: number
  minZoom?: number
}

export function PinchToZoom({
  src,
  alt = '',
  className,
  maxZoom = 4,
  minZoom = 1,
}: PinchToZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [scale, setScale] = useState(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleDoubleTap = () => {
    if (scale > 1) {
      setScale(1)
      x.set(0)
      y.set(0)
      setIsZoomed(false)
    } else {
      setScale(2)
      setIsZoomed(true)
    }
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (scale > 1) {
      x.set(x.get() + info.delta.x)
      y.set(y.get() + info.delta.y)
    }
  }

  const resetZoom = () => {
    setScale(1)
    x.set(0)
    y.set(0)
    setIsZoomed(false)
  }

  return (
    <div className={cn('relative overflow-hidden select-none', className)}>
      <motion.div
        drag={scale > 1}
        dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDoubleClick={handleDoubleTap}
        animate={{ scale }}
        style={{ x, y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="touch-none cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center relative"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-contain"
          draggable={false}
          loading="lazy"
        />
      </motion.div>

      {/* Zoom indicators */}
      {isZoomed && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetZoom}
            className="p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Hint */}
      {!isZoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium pointer-events-none">
          Pinch to zoom • Double tap to zoom in
        </div>
      )}
    </div>
  )
}

// Swipeable List with Delete
export interface SwipeableListItem {
  id: string
  content: React.ReactNode
}

export interface SwipeableListProps {
  items: SwipeableListItem[]
  onDelete: (id: string) => void
  className?: string
}

export function SwipeableList({ items, onDelete, className }: SwipeableListProps) {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      onDelete(id)
    }, 300)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items
        .filter((item) => !deletedIds.has(item.id))
        .map((item) => (
          <SwipeToDelete
            key={item.id}
            onDelete={() => handleDelete(item.id)}
          >
            {item.content}
          </SwipeToDelete>
        ))}
    </div>
  )
}

// Enhanced Pull to Refresh with custom content
export interface EnhancedPullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  className?: string
  refreshingContent?: React.ReactNode
  pullingContent?: React.ReactNode
}

export function EnhancedPullToRefresh({
  children,
  onRefresh,
  className,
  refreshingContent,
  pullingContent,
}: EnhancedPullToRefreshProps) {
  const [status, setStatus] = useState<'idle' | 'pulling' | 'refreshing'>('idle')
  const y = useSpring(0, { stiffness: 300, damping: 30 })
  const containerRef = useRef<HTMLDivElement>(null)
  const pullThreshold = 80

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const container = containerRef.current
    if (!container || status === 'refreshing') return

    if (container.scrollTop > 0) {
      y.set(0)
      setStatus('idle')
      return
    }

    const my = info.offset.y

    if (my < 0) {
      y.set(0)
      setStatus('idle')
      return
    }

    const rubberBand = Math.min(my * 0.4, pullThreshold * 1.5)
    y.set(rubberBand)

    if (rubberBand > 20) {
      setStatus('pulling')
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const rubberBand = Math.min(info.offset.y * 0.4, pullThreshold * 1.5)

    if (rubberBand >= pullThreshold) {
      setStatus('refreshing')
      y.set(pullThreshold)

      onRefresh().finally(() => {
        setStatus('idle')
        y.set(0)
      })
    } else {
      setStatus('idle')
      y.set(0)
    }
  }

  return (
    <div className={cn('relative h-full overflow-hidden', className)}>
      {/* Pull indicator */}
      <motion.div
        style={{ y }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center -mt-20 h-20 z-10 pointer-events-none"
      >
        {status === 'refreshing' ? (
          refreshingContent || (
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          )
        ) : status === 'pulling' ? (
          pullingContent || (
            <RefreshCw className="w-6 h-6 text-primary" />
          )
        ) : null}
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="touch-none h-full overflow-y-auto overscroll-none"
      >
        {children}
      </motion.div>
    </div>
  )
}
