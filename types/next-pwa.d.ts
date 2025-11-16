declare module 'next-pwa' {
  import type { NextConfig } from 'next'

  interface PWAConfig {
    dest?: string
    disable?: boolean
    register?: boolean
    skipWaiting?: boolean
    runtimeCaching?: Array<{
      urlPattern: RegExp
      handler: string
      method?: string
      options?: {
        cacheName: string
        expiration?: {
          maxEntries: number
          maxAgeSeconds: number
        }
        networkTimeoutSeconds?: number
        rangeRequests?: boolean
      }
    }>
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig

  export default withPWA
}
