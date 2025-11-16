/**
 * Design System Utilities
 * Helper functions and utilities for working with the design system
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 * Usage: cn("px-4", "px-2") => "px-2"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common button variants
 */
export const buttonVariants = {
  primary: "bg-gradient-to-r from-secondary to-primary text-white shadow-md hover:shadow-lg transition-all duration-200",
  secondary: "bg-muted text-foreground hover:bg-accent transition-all duration-200",
  outline: "border-2 border-border text-foreground hover:bg-muted transition-all duration-200",
  ghost: "text-foreground-secondary hover:bg-muted hover:text-foreground transition-all duration-200",
  link: "text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors",
};

/**
 * Common card variants
 */
export const cardVariants = {
  default: "bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
  elevated: "bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-all duration-200",
  flat: "bg-card border border-border rounded-lg",
  gradient: "bg-gradient-to-br from-card to-background-secondary border border-border rounded-lg shadow-sm",
};

/**
 * Common input variants
 */
export const inputVariants = {
  default: "w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground placeholder:text-foreground-tertiary",
  error: "w-full px-4 py-2 bg-background border border-error rounded-lg focus:ring-2 focus:ring-error focus:border-transparent transition-all duration-200 text-foreground",
};

/**
 * Common text variants
 */
export const textVariants = {
  heading: "text-foreground font-bold",
  subheading: "text-foreground-secondary font-semibold",
  body: "text-foreground",
  muted: "text-foreground-tertiary",
  error: "text-error",
  success: "text-success",
  warning: "text-warning",
};

/**
 * Animation presets
 */
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  fadeOut: "animate-out fade-out duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  slideOut: "animate-out slide-out-to-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",
};

/**
 * Focus ring utility
 */
export const focusRing = "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/**
 * Get status color based on type
 */
export function getStatusColor(status: "success" | "warning" | "error" | "info") {
  const colors = {
    success: "text-success bg-success/10 border-success/20",
    warning: "text-warning bg-warning/10 border-warning/20",
    error: "text-error bg-error/10 border-error/20",
    info: "text-info bg-info/10 border-info/20",
  };
  return colors[status];
}

/**
 * Common badge variants
 */
export const badgeVariants = {
  default: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground",
  primary: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20",
  success: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20",
  warning: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20",
  error: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20",
};

/**
 * Common sizes for components
 */
export const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
  xl: "h-14 px-8 text-xl",
};

/**
 * Responsive container
 */
export const container = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/**
 * Common grid layouts
 */
export const gridLayouts = {
  responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  twoColumn: "grid grid-cols-1 md:grid-cols-2 gap-4",
  threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  auto: "grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4",
};
