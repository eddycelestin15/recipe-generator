'use client'

import Link from 'next/link'
import { TrendingUp, Sparkles, BookOpen, Apple } from 'lucide-react'

const trendingRecipes = [
  { id: 1, title: 'High-Protein Breakfast Bowl', category: 'Breakfast', trend: '+24%' },
  { id: 2, title: 'Mediterranean Quinoa Salad', category: 'Lunch', trend: '+18%' },
  { id: 3, title: 'Grilled Salmon with Veggies', category: 'Dinner', trend: '+15%' },
]

const suggestions = [
  {
    icon: Sparkles,
    title: 'Try AI Coach',
    description: 'Get personalized meal recommendations',
    href: '/ai-coach',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Apple,
    title: 'Track Nutrition',
    description: 'Monitor your daily intake',
    href: '/nutrition',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: BookOpen,
    title: 'Save Recipes',
    description: 'Build your recipe collection',
    href: '/recipes',
    color: 'from-orange-500 to-red-500',
  },
]

export function RightSidebar() {
  return (
    <aside className="hidden xl:block xl:fixed xl:right-0 xl:top-0 xl:bottom-0 xl:w-[320px] overflow-y-auto py-4 px-4 z-30">
      <div className="space-y-4">
        {/* Trending Section */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Trending Recipes
              </h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {trendingRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href="/recipes"
                className="block p-4 hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/60 font-medium mb-1">
                      {recipe.category}
                    </p>
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {recipe.title}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full whitespace-nowrap">
                    {recipe.trend}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/recipes"
            className="block p-3 text-center text-sm text-primary hover:bg-primary/5 transition-colors font-medium"
          >
            Show more
          </Link>
        </div>

        {/* Suggestions */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-lg font-bold text-foreground mb-4">
            You might like
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon
              return (
                <Link
                  key={index}
                  href={suggestion.href}
                  className="block group"
                >
                  <div className="flex gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${suggestion.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-foreground/60 line-clamp-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Footer Links */}
        <div className="px-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground/50">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/help" className="hover:underline">
              Help
            </Link>
          </div>
          <p className="text-xs text-foreground/40 mt-2">
            © 2025 Recipe AI. All rights reserved.
          </p>
        </div>
      </div>
    </aside>
  )
}
