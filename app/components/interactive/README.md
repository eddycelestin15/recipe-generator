# Interactive Components

A collection of high-performance, native-like interactive components built with Framer Motion, @use-gesture, @dnd-kit, and Vaul.

## Features

- **60fps Performance**: All components are optimized for smooth 60fps animations
- **Mobile-First**: Touch-friendly gestures and interactions
- **Accessible**: Built with accessibility in mind
- **Type-Safe**: Full TypeScript support
- **Customizable**: Extensive props for customization

## Components

### 1. Swipeable Cards (Tinder-style)

Interactive swipeable cards for meal suggestions with like/dislike/super-like actions.

```tsx
import { SwipeableCards } from '@/app/components/interactive'

const meals = [
  {
    id: '1',
    name: 'Mediterranean Quinoa Bowl',
    description: 'Healthy quinoa bowl...',
    prepTime: '15 min',
    cookTime: '20 min',
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 16,
    tags: ['Vegetarian', 'High Protein'],
  },
]

<SwipeableCards
  cards={meals}
  onLike={(card) => console.log('Liked', card)}
  onDislike={(card) => console.log('Disliked', card)}
  onSuperLike={(card) => console.log('Super liked', card)}
  onFinish={() => console.log('All done')}
/>
```

**Gestures:**
- Swipe right: Like
- Swipe left: Dislike
- Swipe up: Super like
- Tap buttons: Manual actions

### 2. Bottom Sheets

Native-like bottom sheets for mobile modals.

```tsx
import { BottomSheet, QuickActionSheet, FilterBottomSheet } from '@/app/components/interactive'

// Basic Bottom Sheet
<BottomSheet
  open={open}
  onOpenChange={setOpen}
  title="Settings"
  description="Customize your experience"
>
  <div className="p-6">Content here</div>
</BottomSheet>

// Quick Action Sheet
<QuickActionSheet
  open={open}
  onOpenChange={setOpen}
  actions={[
    {
      icon: <Share2 />,
      label: 'Share',
      onClick: () => {},
    },
  ]}
/>

// Filter Bottom Sheet
<FilterBottomSheet
  open={open}
  onOpenChange={setOpen}
  filters={[
    {
      id: 'diet',
      label: 'Diet Type',
      options: [
        { value: 'vegan', label: 'Vegan' },
      ],
      value: selectedFilters,
      onChange: setSelectedFilters,
    },
  ]}
  onApply={() => {}}
  onReset={() => {}}
/>
```

**Features:**
- Snap points support
- Dismissible with swipe
- Backdrop overlay
- Nested sheets support

### 3. Camera Capture

Full-screen camera modal for capturing food photos.

```tsx
import { CameraCapture, useCameraCapture } from '@/app/components/interactive'

// With hook
const { isOpen, open, close, capturedImage, handleCapture, CameraCaptureComponent } = useCameraCapture()

<button onClick={open}>Open Camera</button>
<CameraCaptureComponent />

// Or directly
<CameraCapture
  open={open}
  onOpenChange={setOpen}
  onCapture={(imageSrc) => console.log(imageSrc)}
  allowGallery={true}
/>
```

**Features:**
- Front/back camera switching
- Flash effect on capture
- Gallery upload option
- Preview before confirm
- Camera guides overlay

### 4. Drag & Drop

Drag and drop system for meal planning.

```tsx
import { MealPlanner } from '@/app/components/interactive'

const [meals, setMeals] = useState([...])
const [slots, setSlots] = useState([...])

<MealPlanner
  meals={meals}
  slots={slots}
  onMealsChange={setMeals}
  onSlotsChange={setSlots}
/>
```

**Features:**
- Drag meals to slots
- Reorder meals
- Swap between slots
- Visual feedback
- Touch and mouse support

### 5. Gestures

Advanced gesture components.

#### Swipe to Delete

```tsx
import { SwipeToDelete } from '@/app/components/interactive'

<SwipeToDelete onDelete={() => console.log('Deleted')}>
  <div>Item content</div>
</SwipeToDelete>
```

#### Pull to Refresh

```tsx
import { PullToRefresh, EnhancedPullToRefresh } from '@/app/components/interactive'

<EnhancedPullToRefresh
  onRefresh={async () => {
    await fetchData()
  }}
>
  <div>Content to refresh</div>
</EnhancedPullToRefresh>
```

#### Pinch to Zoom

```tsx
import { PinchToZoom } from '@/app/components/interactive'

<PinchToZoom
  src="/image.jpg"
  alt="Food"
  maxZoom={4}
  minZoom={1}
/>
```

**Gestures:**
- Pinch to zoom in/out
- Double tap to zoom
- Drag to pan when zoomed
- Double tap again to reset

## Performance

All components are optimized for 60fps:

- Hardware-accelerated CSS transforms (translateX, translateY, scale)
- `will-change` hints for GPU acceleration
- RAF-based animations via Framer Motion
- Passive event listeners for scroll
- Debounced/throttled handlers
- Efficient re-render prevention

### Performance Monitoring

Use the provided performance hooks to monitor your app:

```tsx
import { usePerformanceMonitor, PerformanceMonitor } from '@/app/hooks/usePerformanceMonitor'

// In your component
const metrics = usePerformanceMonitor({
  targetFps: 60,
  onPerformanceIssue: (metrics) => {
    console.warn('Performance issue:', metrics)
  },
})

// Or use the visual monitor
<PerformanceMonitor visible={isDev} />
```

### Device Capabilities

Detect device capabilities for conditional rendering:

```tsx
import { useDeviceCapabilities } from '@/app/hooks/usePerformanceMonitor'

const { isHighPerformance, isMobile, hasTouch } = useDeviceCapabilities()

// Conditionally enable effects
{isHighPerformance && <ExpensiveAnimation />}
```

## Best Practices

1. **Use `will-change` sparingly**: Only on elements that will animate
2. **Prefer `transform` over `top/left`**: For GPU acceleration
3. **Use `passive: true`**: For scroll listeners
4. **Debounce/throttle**: Heavy computations in handlers
5. **Virtual lists**: For long scrollable lists
6. **Lazy load**: Images and heavy components
7. **Reduce layout shifts**: Use fixed dimensions when possible

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Android 90+

## Dependencies

- `framer-motion`: ^12.23.24 - Animations and gestures
- `@use-gesture/react`: Latest - Advanced gesture recognition
- `@dnd-kit/core`: Latest - Drag and drop
- `@dnd-kit/sortable`: Latest - Sortable lists
- `vaul`: Latest - Bottom sheets
- `react-webcam`: Latest - Camera access

## Demo

Visit `/interactive-demo` to see all components in action.

## License

MIT
