/**
 * SSR-safe localStorage utilities
 * Provides guards to prevent localStorage access during server-side rendering
 */

/**
 * Check if we're in a browser environment with localStorage available
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get item from localStorage with SSR guard
 */
export function getItem(key: string): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(key);
}

/**
 * Set item in localStorage with SSR guard
 */
export function setItem(key: string, value: string): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(key, value);
}

/**
 * Remove item from localStorage with SSR guard
 */
export function removeItem(key: string): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(key);
}

/**
 * Clear all localStorage with SSR guard
 */
export function clear(): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.clear();
}

/**
 * Get current user ID from localStorage with SSR guard
 */
export function getCurrentUserId(): string {
  if (!isBrowser()) {
    return 'default_user';
  }
  let userId = localStorage.getItem('current_user_id');
  if (!userId) {
    userId = 'default_user';
    localStorage.setItem('current_user_id', userId);
  }
  return userId;
}
