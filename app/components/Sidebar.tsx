'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ChefHat,
  BookOpen,
  Calendar,
  Refrigerator,
  Apple,
  Dumbbell,
  Target,
  Bot,
  Lightbulb,
  User,
  Settings,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Generator', href: '/', icon: ChefHat },
  { name: 'Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Meal Planning', href: '/meal-planning', icon: Calendar },
  { name: 'Fridge', href: '/fridge', icon: Refrigerator },
  { name: 'Nutrition', href: '/nutrition', icon: Apple },
  { name: 'Fitness', href: '/fitness', icon: Dumbbell },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'AI Coach', href: '/ai-coach', icon: Bot },
  { name: 'Insights', href: '/insights', icon: Lightbulb },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expiringCount, setExpiringCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadExpiringCount()
    loadInsightsCount()

    // Refresh every 60 seconds
    const interval = setInterval(() => {
      loadExpiringCount()
      loadInsightsCount()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadExpiringCount = async () => {
    try {
      const response = await fetch('/api/fridge/expiring?days=3')
      const data = await response.json()
      setExpiringCount(data.count || 0)
    } catch (error) {
      console.error('Error loading expiring count:', error)
    }
  }

  const loadInsightsCount = async () => {
    try {
      const response = await fetch('/api/ai/insights?unread=true')
      const data = await response.json()
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error loading insights count:', error)
    }
  }

  const getBadgeCount = (href: string) => {
    if (href === '/fridge' && expiringCount > 0) return expiringCount
    if (href === '/insights' && unreadCount > 0) return unreadCount
    return null
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:w-[280px] border-r border-border bg-background/95 backdrop-blur-lg z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-secondary via-primary to-pink-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
            Recipe AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const badgeCount = getBadgeCount(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-full text-base font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                  }
                `}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`}
                />
                <span className="flex-1">{item.name}</span>
                {badgeCount && (
                  <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Card */}
      {session?.user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-foreground/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-semibold">
              {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-foreground/60 truncate">
                {session.user.email}
              </p>
            </div>
            <Settings className="w-4 h-4 text-foreground/40 group-hover:text-foreground/60 transition-colors" />
          </div>

          {/* Quick Actions */}
          <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
            <Link
              href="/account/subscription"
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Subscription</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-error hover:bg-error/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
