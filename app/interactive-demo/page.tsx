'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SwipeableCards,
  BottomSheet,
  QuickActionSheet,
  FilterBottomSheet,
  CameraCapture,
  MealPlanner,
  SwipeToDelete,
  PinchToZoom,
  EnhancedPullToRefresh,
  type MealSuggestion,
  type MealItem,
  type MealSlot,
} from '@/app/components/interactive'
import { Camera, Filter, Trash2, Heart, Star, X, Settings, Share2, Plus, Activity } from 'lucide-react'
import { PerformanceMonitor } from '@/app/hooks/usePerformanceMonitor'

export default function InteractiveDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>('swipe')
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false)
  const [showBottomSheet, setShowBottomSheet] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  // Mock data for swipeable cards
  const [mealSuggestions] = useState<MealSuggestion[]>([
    {
      id: '1',
      name: 'Mediterranean Quinoa Bowl',
      description: 'Healthy quinoa bowl with roasted vegetables, chickpeas, and tahini dressing',
      prepTime: '15 min',
      cookTime: '20 min',
      calories: 450,
      protein: 18,
      carbs: 55,
      fat: 16,
      tags: ['Vegetarian', 'High Protein', 'Mediterranean'],
    },
    {
      id: '2',
      name: 'Grilled Salmon with Asparagus',
      description: 'Fresh Atlantic salmon with grilled asparagus and lemon butter sauce',
      prepTime: '10 min',
      cookTime: '15 min',
      calories: 520,
      protein: 42,
      carbs: 12,
      fat: 32,
      tags: ['High Protein', 'Keto', 'Seafood'],
    },
    {
      id: '3',
      name: 'Thai Green Curry',
      description: 'Aromatic Thai curry with vegetables and jasmine rice',
      prepTime: '20 min',
      cookTime: '25 min',
      calories: 480,
      protein: 15,
      carbs: 62,
      fat: 18,
      tags: ['Vegetarian', 'Asian', 'Spicy'],
    },
    {
      id: '4',
      name: 'Chicken Burrito Bowl',
      description: 'Mexican-style bowl with seasoned chicken, black beans, and guacamole',
      prepTime: '15 min',
      cookTime: '20 min',
      calories: 550,
      protein: 38,
      carbs: 48,
      fat: 22,
      tags: ['High Protein', 'Mexican', 'Gluten-free'],
    },
  ])

  // Mock data for drag and drop
  const [meals, setMeals] = useState<MealItem[]>([
    { id: '1', name: 'Greek Yogurt Bowl', prepTime: '5 min', calories: 320 },
    { id: '2', name: 'Chicken Caesar Salad', prepTime: '15 min', calories: 450 },
    { id: '3', name: 'Salmon with Vegetables', prepTime: '25 min', calories: 520 },
    { id: '4', name: 'Protein Smoothie', prepTime: '3 min', calories: 280 },
  ])

  const [slots, setSlots] = useState<MealSlot[]>([
    { id: 'breakfast', name: 'Breakfast', time: '8:00 AM', meal: null },
    { id: 'lunch', name: 'Lunch', time: '12:30 PM', meal: null },
    { id: 'dinner', name: 'Dinner', time: '7:00 PM', meal: null },
    { id: 'snack', name: 'Snack', time: '3:00 PM', meal: null },
  ])

  // Mock data for swipeable list
  const [listItems, setListItems] = useState([
    { id: '1', name: 'Eggs', amount: '12 units' },
    { id: '2', name: 'Chicken Breast', amount: '500g' },
    { id: '3', name: 'Brown Rice', amount: '1kg' },
    { id: '4', name: 'Broccoli', amount: '300g' },
    { id: '5', name: 'Greek Yogurt', amount: '500ml' },
  ])

  // Filter state
  const [dietFilters, setDietFilters] = useState<string[]>([])
  const [mealTypeFilters, setMealTypeFilters] = useState<string[]>([])

  const handleLike = (card: MealSuggestion) => {
    console.log('Liked:', card.name)
  }

  const handleDislike = (card: MealSuggestion) => {
    console.log('Disliked:', card.name)
  }

  const handleSuperLike = (card: MealSuggestion) => {
    console.log('Super liked:', card.name)
  }

  const handleCapture = (imageSrc: string) => {
    console.log('Captured image:', imageSrc.substring(0, 50))
  }

  const handleDeleteItem = (id: string) => {
    setListItems((items) => items.filter((item) => item.id !== id))
  }

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  const demos = [
    { id: 'swipe', name: 'Swipe Cards', icon: Heart },
    { id: 'bottomsheet', name: 'Bottom Sheets', icon: Settings },
    { id: 'camera', name: 'Camera', icon: Camera },
    { id: 'dragdrop', name: 'Drag & Drop', icon: Plus },
    { id: 'gestures', name: 'Gestures', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Interactive Components Demo
          </h1>

          {/* Demo selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {demos.map((demo) => {
              const Icon = demo.icon
              return (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                    ${activeDemo === demo.id
                      ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{demo.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Swipeable Cards Demo */}
        {activeDemo === 'swipe' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Meal Suggestions
              </h2>
              <p className="text-muted-foreground">
                Swipe right to like, left to dislike, up to super like
              </p>
            </div>
            <SwipeableCards
              cards={mealSuggestions}
              onLike={handleLike}
              onDislike={handleDislike}
              onSuperLike={handleSuperLike}
              onFinish={() => console.log('All cards reviewed')}
            />
          </motion.div>
        )}

        {/* Bottom Sheets Demo */}
        {activeDemo === 'bottomsheet' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Bottom Sheets
              </h2>
              <p className="text-muted-foreground">
                Native-like bottom sheets for mobile interactions
              </p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
              <button
                onClick={() => setShowBottomSheet(true)}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all"
              >
                <Settings className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-foreground">Basic Bottom Sheet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Simple bottom sheet with title
                </p>
              </button>

              <button
                onClick={() => setShowQuickActions(true)}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all"
              >
                <Share2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-foreground">Quick Actions</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Action sheet with multiple options
                </p>
              </button>

              <button
                onClick={() => setShowFilters(true)}
                className="p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all"
              >
                <Filter className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold text-foreground">Filter Sheet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bottom sheet with filter options
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Camera Demo */}
        {activeDemo === 'camera' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Camera Capture
              </h2>
              <p className="text-muted-foreground">
                Take photos of your food for tracking
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <button
                onClick={() => setShowCamera(true)}
                className="w-full p-12 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 border-2 border-dashed border-primary/50 hover:border-primary transition-all"
              >
                <Camera className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Open Camera
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tap to capture food photos
                </p>
              </button>
            </div>
          </motion.div>
        )}

        {/* Drag & Drop Demo */}
        {activeDemo === 'dragdrop' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Meal Planning
              </h2>
              <p className="text-muted-foreground">
                Drag meals to plan your day
              </p>
            </div>
            <MealPlanner
              meals={meals}
              slots={slots}
              onMealsChange={setMeals}
              onSlotsChange={setSlots}
            />
          </motion.div>
        )}

        {/* Gestures Demo */}
        {activeDemo === 'gestures' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Advanced Gestures
              </h2>
              <p className="text-muted-foreground">
                Swipe, pinch, and pull interactions
              </p>
            </div>

            {/* Swipe to Delete */}
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Swipe to Delete
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Swipe left on items to delete them
              </p>
              <div className="space-y-2">
                {listItems.map((item) => (
                  <SwipeToDelete
                    key={item.id}
                    onDelete={() => handleDeleteItem(item.id)}
                  >
                    <div className="p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.amount}</p>
                        </div>
                        <Trash2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </SwipeToDelete>
                ))}
              </div>
            </div>

            {/* Pull to Refresh */}
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Pull to Refresh
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pull down to refresh the content
              </p>
              <div className="h-64 rounded-xl border border-border overflow-hidden">
                <EnhancedPullToRefresh onRefresh={handleRefresh}>
                  <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-4 bg-card rounded-lg border border-border">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </EnhancedPullToRefresh>
              </div>
            </div>

            {/* Pinch to Zoom */}
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Pinch to Zoom
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pinch or double tap to zoom image
              </p>
              <div className="h-96 rounded-xl border border-border overflow-hidden bg-muted">
                <PinchToZoom
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                  alt="Food"
                  className="h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Sheets */}
      <BottomSheet
        open={showBottomSheet}
        onOpenChange={setShowBottomSheet}
        title="Settings"
        description="Customize your experience"
      >
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground">
            This is a basic bottom sheet with a title and description.
          </p>
          <button
            onClick={() => setShowBottomSheet(false)}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary text-white font-medium"
          >
            Got it
          </button>
        </div>
      </BottomSheet>

      <QuickActionSheet
        open={showQuickActions}
        onOpenChange={setShowQuickActions}
        actions={[
          {
            icon: <Share2 className="w-5 h-5" />,
            label: 'Share Recipe',
            onClick: () => console.log('Share'),
          },
          {
            icon: <Heart className="w-5 h-5" />,
            label: 'Add to Favorites',
            onClick: () => console.log('Favorite'),
          },
          {
            icon: <Trash2 className="w-5 h-5" />,
            label: 'Delete',
            onClick: () => console.log('Delete'),
            variant: 'destructive',
          },
        ]}
      />

      <FilterBottomSheet
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={[
          {
            id: 'diet',
            label: 'Diet Type',
            options: [
              { value: 'vegetarian', label: 'Vegetarian' },
              { value: 'vegan', label: 'Vegan' },
              { value: 'keto', label: 'Keto' },
              { value: 'paleo', label: 'Paleo' },
            ],
            value: dietFilters,
            onChange: setDietFilters,
          },
          {
            id: 'mealType',
            label: 'Meal Type',
            options: [
              { value: 'breakfast', label: 'Breakfast' },
              { value: 'lunch', label: 'Lunch' },
              { value: 'dinner', label: 'Dinner' },
              { value: 'snack', label: 'Snack' },
            ],
            value: mealTypeFilters,
            onChange: setMealTypeFilters,
          },
        ]}
        onApply={() => console.log('Applied filters', { dietFilters, mealTypeFilters })}
        onReset={() => {
          setDietFilters([])
          setMealTypeFilters([])
        }}
      />

      <CameraCapture
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleCapture}
      />

      {/* Performance Monitor Toggle */}
      <button
        onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all"
        title="Toggle Performance Monitor"
      >
        <Activity className={`w-5 h-5 ${showPerformanceMonitor ? 'text-primary' : 'text-muted-foreground'}`} />
      </button>

      {/* Performance Monitor */}
      <PerformanceMonitor visible={showPerformanceMonitor} />
    </div>
  )
}
