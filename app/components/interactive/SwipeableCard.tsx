'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useState } from 'react'
import { Heart, X, Star, ChefHat } from 'lucide-react'

export interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  className?: string
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  className = '',
}: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0)
  const [exitY, setExitY] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

  // Icon indicators opacity
  const likeOpacity = useTransform(x, [25, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, -25], [1, 0])
  const superLikeOpacity = useTransform(y, [-100, -25], [1, 0])

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 150
    const velocityThreshold = 500

    // Check for upward swipe (super like)
    if (
      info.offset.y < -threshold ||
      info.velocity.y < -velocityThreshold
    ) {
      setExitY(-1000)
      onSwipeUp?.()
      return
    }

    // Check for right swipe (like)
    if (
      info.offset.x > threshold ||
      info.velocity.x > velocityThreshold
    ) {
      setExitX(1000)
      onSwipeRight?.()
      return
    }

    // Check for left swipe (dislike)
    if (
      info.offset.x < -threshold ||
      info.velocity.x < -velocityThreshold
    ) {
      setExitX(-1000)
      onSwipeLeft?.()
      return
    }
  }

  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing ${className}`}
      style={{
        x,
        y,
        rotate,
        opacity,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={{
        x: exitX,
        y: exitY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Nope indicator */}
      <motion.div
        className="absolute top-6 left-6 z-10 rounded-full bg-red-500/20 p-4 border-4 border-red-500"
        style={{ opacity: nopeOpacity }}
      >
        <X className="w-12 h-12 text-red-500" strokeWidth={3} />
      </motion.div>

      {/* Like indicator */}
      <motion.div
        className="absolute top-6 right-6 z-10 rounded-full bg-green-500/20 p-4 border-4 border-green-500"
        style={{ opacity: likeOpacity }}
      >
        <Heart className="w-12 h-12 text-green-500" strokeWidth={3} />
      </motion.div>

      {/* Super Like indicator */}
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 z-10 rounded-full bg-blue-500/20 p-4 border-4 border-blue-500"
        style={{ opacity: superLikeOpacity }}
      >
        <Star className="w-12 h-12 text-blue-500" strokeWidth={3} fill="currentColor" />
      </motion.div>

      {children}
    </motion.div>
  )
}

export interface MealSuggestion {
  id: string
  name: string
  image?: string
  description: string
  prepTime: string
  cookTime: string
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
}

export interface SwipeableCardsProps {
  cards: MealSuggestion[]
  onLike: (card: MealSuggestion) => void
  onDislike: (card: MealSuggestion) => void
  onSuperLike: (card: MealSuggestion) => void
  onFinish?: () => void
}

export function SwipeableCards({
  cards,
  onLike,
  onDislike,
  onSuperLike,
  onFinish,
}: SwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSwipeLeft = () => {
    if (currentIndex < cards.length) {
      onDislike(cards[currentIndex])
      setCurrentIndex((prev) => prev + 1)
      if (currentIndex + 1 >= cards.length) {
        onFinish?.()
      }
    }
  }

  const handleSwipeRight = () => {
    if (currentIndex < cards.length) {
      onLike(cards[currentIndex])
      setCurrentIndex((prev) => prev + 1)
      if (currentIndex + 1 >= cards.length) {
        onFinish?.()
      }
    }
  }

  const handleSwipeUp = () => {
    if (currentIndex < cards.length) {
      onSuperLike(cards[currentIndex])
      setCurrentIndex((prev) => prev + 1)
      if (currentIndex + 1 >= cards.length) {
        onFinish?.()
      }
    }
  }

  // Show up to 3 cards at a time for depth effect
  const visibleCards = cards.slice(currentIndex, currentIndex + 3).reverse()

  if (currentIndex >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <ChefHat className="w-20 h-20 text-muted-foreground" />
        <h3 className="text-2xl font-bold text-foreground">All done!</h3>
        <p className="text-muted-foreground">You've reviewed all meal suggestions.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {visibleCards.map((card, index) => {
        const reversedIndex = visibleCards.length - 1 - index
        const isTop = reversedIndex === visibleCards.length - 1
        const scale = 1 - reversedIndex * 0.05
        const yOffset = reversedIndex * 10

        return (
          <SwipeableCard
            key={card.id}
            onSwipeLeft={isTop ? handleSwipeLeft : undefined}
            onSwipeRight={isTop ? handleSwipeRight : undefined}
            onSwipeUp={isTop ? handleSwipeUp : undefined}
            className={`w-full max-w-md ${!isTop ? 'pointer-events-none' : ''}`}
          >
            <motion.div
              initial={false}
              animate={{
                scale,
                y: yOffset,
              }}
              className="w-full bg-card rounded-2xl shadow-2xl overflow-hidden border border-border"
            >
              {/* Image */}
              <div className="relative w-full h-80 bg-gradient-to-br from-secondary/20 to-primary/20">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ChefHat className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
                {/* Tags overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex flex-wrap gap-2">
                    {card.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {card.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {card.description}
                  </p>
                </div>

                {/* Time info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Prep:</span>
                    <span>{card.prepTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Cook:</span>
                    <span>{card.cookTime}</span>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-foreground">
                      {card.calories}
                    </div>
                    <div className="text-xs text-muted-foreground">Cal</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-foreground">
                      {card.protein}g
                    </div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-foreground">
                      {card.carbs}g
                    </div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-bold text-foreground">
                      {card.fat}g
                    </div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </SwipeableCard>
        )
      })}

      {/* Action buttons */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-4 pb-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeLeft}
          className="w-16 h-16 rounded-full bg-red-500 text-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeUp}
          className="w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <Star className="w-6 h-6" fill="currentColor" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSwipeRight}
          className="w-16 h-16 rounded-full bg-green-500 text-white shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Heart className="w-8 h-8" fill="currentColor" strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  )
}
