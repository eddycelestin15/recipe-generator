# Design System Documentation

## Overview

Modern design system inspired by Instagram/Twitter with a custom red/orange color palette and comprehensive dark mode support.

## Features

- Custom color palette with primary (red) and secondary (orange) colors
- Full dark mode support with smooth transitions
- Design tokens for colors, typography, spacing, shadows
- Modern, minimalist, and professional aesthetic
- Tailwind CSS v4 integration

## Color Palette

### Primary Colors (Red)
- `primary-500`: #ff4538 (Main primary color)
- Available shades: 50-950

### Secondary Colors (Orange)
- `secondary-500`: #f97316
- Available shades: 50-950

### Semantic Colors
- Background, foreground, border colors that adapt to theme
- Status colors: success, warning, error, info

## Using Colors in Components

### Tailwind Classes

```tsx
// Primary gradient (recommended for CTAs)
<button className="bg-gradient-to-r from-secondary to-primary text-white">
  Action
</button>

// Background/Foreground (theme-aware)
<div className="bg-background text-foreground">
  Content
</div>

// Card style
<div className="bg-card border border-border rounded-lg">
  Card content
</div>

// Muted backgrounds
<div className="bg-muted text-muted-foreground">
  Subtle content
</div>
```

### CSS Variables

```css
/* Direct CSS usage */
.my-component {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
}

/* Primary colors */
.cta-button {
  background: var(--primary);
  color: var(--primary-foreground);
}

/* Hover states */
.interactive:hover {
  background: var(--primary-hover);
}
```

## Dark Mode

### Theme Toggle

The theme toggle is available in the navigation header. Users can switch between:
- Light mode
- Dark mode
- System preference (default)

### Implementation

```tsx
import { useTheme } from 'next-themes';

export function MyComponent() {
  const { theme, setTheme } = useTheme();

  // Toggle theme
  setTheme(theme === 'dark' ? 'light' : 'dark');
}
```

### Adding Dark Mode Styles

```tsx
// Using Tailwind classes
<div className="bg-white dark:bg-neutral-900">
  Adaptive background
</div>

// Custom classes automatically adapt through CSS variables
<div className="bg-background">
  This automatically adapts to dark mode
</div>
```

## Typography

### Font Families
- `font-sans`: Geist Sans (primary)
- `font-mono`: Geist Mono (code)

### Font Sizes
- `text-xs` to `text-6xl`

### Font Weights
- `font-light` (300)
- `font-normal` (400)
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)
- `font-extrabold` (800)

## Spacing

Following a 4px base grid system:
- `gap-1` = 4px
- `gap-2` = 8px
- `gap-4` = 16px
- `gap-6` = 24px
- etc.

## Shadows

```tsx
// Subtle shadow
<div className="shadow-sm">Small shadow</div>

// Medium shadow
<div className="shadow-md">Medium shadow</div>

// Large shadow
<div className="shadow-lg">Large shadow</div>
```

Available in CSS:
```css
box-shadow: var(--shadow-sm);
box-shadow: var(--shadow);
box-shadow: var(--shadow-md);
box-shadow: var(--shadow-lg);
box-shadow: var(--shadow-xl);
box-shadow: var(--shadow-2xl);
```

## Border Radius

```tsx
<div className="rounded">Default (8px)</div>
<div className="rounded-lg">Large (16px)</div>
<div className="rounded-xl">Extra large (24px)</div>
<div className="rounded-full">Fully rounded</div>
```

## Transitions

All transitions use smooth cubic-bezier curves:

```css
/* Fast transitions (150ms) */
transition: var(--transition-fast);

/* Base transitions (200ms) - recommended */
transition: var(--transition);

/* Slow transitions (300ms) */
transition: var(--transition-slow);
```

## Best Practices

### 1. Use Semantic Colors
Prefer semantic color variables over direct color values:
- ✅ `bg-background`, `text-foreground`
- ❌ `bg-white`, `text-black`

### 2. Gradients for CTAs
Use the primary gradient for important call-to-action buttons:
```tsx
<button className="bg-gradient-to-r from-secondary to-primary">
  Primary Action
</button>
```

### 3. Consistent Spacing
Use the 4px grid system for consistent spacing:
```tsx
<div className="p-4 gap-4">
  <div className="mb-2">Content</div>
</div>
```

### 4. Smooth Transitions
Add transitions to interactive elements:
```tsx
<button className="hover:bg-primary transition-all duration-200">
  Hover me
</button>
```

### 5. Dark Mode Consideration
Always test your components in both light and dark modes. Use semantic colors to ensure they adapt properly.

## Component Examples

### Button
```tsx
<button className="px-4 py-2 rounded-lg bg-gradient-to-r from-secondary to-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
  Click me
</button>
```

### Card
```tsx
<div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
  <h3 className="text-foreground font-semibold mb-2">Card Title</h3>
  <p className="text-foreground-secondary">Card content</p>
</div>
```

### Input
```tsx
<input
  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
  placeholder="Enter text"
/>
```

## Design Tokens File

All design tokens are centralized in `/app/design-tokens.ts` for easy reference and potential programmatic usage.

## Resources

- Tailwind CSS v4: https://tailwindcss.com/docs
- next-themes: https://github.com/pacocoursey/next-themes
- Radix UI: https://www.radix-ui.com/
