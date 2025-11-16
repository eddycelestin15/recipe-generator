'use client'

import { useEffect, useRef, useState } from 'react'

export interface PerformanceMetrics {
  fps: number
  averageFps: number
  frameTime: number
  isOptimal: boolean
}

export function usePerformanceMonitor(options?: {
  targetFps?: number
  sampleSize?: number
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void
}) {
  const { targetFps = 60, sampleSize = 60, onPerformanceIssue } = options || {}

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    averageFps: 60,
    frameTime: 16.67,
    isOptimal: true,
  })

  const frameTimesRef = useRef<number[]>([])
  const lastTimeRef = useRef<number>(performance.now())
  const rafIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const measureFrame = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      // Add to frame times buffer
      frameTimesRef.current.push(deltaTime)
      if (frameTimesRef.current.length > sampleSize) {
        frameTimesRef.current.shift()
      }

      // Calculate metrics
      const averageFrameTime =
        frameTimesRef.current.reduce((sum, time) => sum + time, 0) /
        frameTimesRef.current.length

      const currentFps = 1000 / deltaTime
      const averageFps = 1000 / averageFrameTime
      const isOptimal = averageFps >= targetFps * 0.9 // Allow 10% tolerance

      const newMetrics = {
        fps: Math.round(currentFps),
        averageFps: Math.round(averageFps),
        frameTime: Math.round(averageFrameTime * 100) / 100,
        isOptimal,
      }

      setMetrics(newMetrics)

      // Notify if performance issue detected
      if (!isOptimal && onPerformanceIssue) {
        onPerformanceIssue(newMetrics)
      }

      rafIdRef.current = requestAnimationFrame(measureFrame)
    }

    rafIdRef.current = requestAnimationFrame(measureFrame)

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [targetFps, sampleSize, onPerformanceIssue])

  return metrics
}

export function PerformanceMonitor({ visible = false }: { visible?: boolean }) {
  const metrics = usePerformanceMonitor({
    onPerformanceIssue: (metrics) => {
      console.warn('Performance issue detected:', metrics)
    },
  })

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg font-mono text-xs space-y-1">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            metrics.isOptimal ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="font-semibold">Performance</span>
      </div>
      <div>FPS: {metrics.fps}</div>
      <div>Avg FPS: {metrics.averageFps}</div>
      <div>Frame Time: {metrics.frameTime}ms</div>
    </div>
  )
}

// Hook to detect if device supports high performance
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasTouch: false,
    hasPointer: false,
    hasHover: false,
    deviceMemory: 4,
    hardwareConcurrency: 4,
    supportsWebGL: false,
    supportsWebGL2: false,
    isMobile: false,
    isHighPerformance: true,
  })

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const hasPointer = window.matchMedia('(pointer: fine)').matches
    const hasHover = window.matchMedia('(hover: hover)').matches
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    // @ts-ignore - deviceMemory is experimental
    const deviceMemory = (navigator.deviceMemory as number) || 4
    const hardwareConcurrency = navigator.hardwareConcurrency || 4

    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    const gl2 = canvas.getContext('webgl2')
    const supportsWebGL = !!gl
    const supportsWebGL2 = !!gl2

    // Determine if device is high performance
    const isHighPerformance =
      deviceMemory >= 4 &&
      hardwareConcurrency >= 4 &&
      supportsWebGL

    setCapabilities({
      hasTouch,
      hasPointer,
      hasHover,
      deviceMemory,
      hardwareConcurrency,
      supportsWebGL,
      supportsWebGL2,
      isMobile,
      isHighPerformance,
    })
  }, [])

  return capabilities
}

// Hook to throttle function calls for performance
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastRanRef = useRef<number>(Date.now())

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastRun = now - lastRanRef.current

    if (timeSinceLastRun >= delay) {
      callback(...args)
      lastRanRef.current = now
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
        lastRanRef.current = Date.now()
      }, delay - timeSinceLastRun)
    }
  }) as T
}

// Hook to debounce function calls
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }) as T
}

// Hook for passive event listeners (better scroll performance)
export function usePassiveEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: HTMLElement | Window = window,
  options?: AddEventListenerOptions
) {
  useEffect(() => {
    const eventListener = (event: Event) => handler(event as WindowEventMap[K])
    const opts = { passive: true, ...options }

    element.addEventListener(eventName, eventListener, opts)

    return () => {
      element.removeEventListener(eventName, eventListener, opts)
    }
  }, [eventName, element, handler, options])
}
