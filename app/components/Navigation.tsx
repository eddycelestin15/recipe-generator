'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ChefHat, BookOpen, Activity, Calendar, Dumbbell, LayoutDashboard, Target, Sparkles, Brain, Crown, User, CreditCard, MessageCircle } from 'lucide-react';
import { useSubscription } from '@/app/lib/hooks/useSubscription';
import PremiumBadge from '@/app/components/premium/PremiumBadge';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function Navigation() {
  const [expiringCount, setExpiringCount] = useState(0);
  const [insightsCount, setInsightsCount] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const pathname = usePathname();
  const { isPremium, isInTrial, trialDaysRemaining } = useSubscription();

  useEffect(() => {
    loadExpiringCount();
    loadInsightsCount();

    // Recharger toutes les 60 secondes
    const interval = setInterval(() => {
      loadExpiringCount();
      loadInsightsCount();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadExpiringCount = async () => {
    try {
      const response = await fetch('/api/fridge/expiring?days=2');
      const data = await response.json();
      setExpiringCount(data.count || 0);
    } catch (error) {
      console.error('Error loading expiring count:', error);
    }
  };

  const loadInsightsCount = async () => {
    try {
      const response = await fetch('/api/ai/insights?unread=true');
      const data = await response.json();
      setInsightsCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading insights count:', error);
    }
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      badge: null,
    },
    {
      href: '/generator',
      icon: ChefHat,
      label: 'Générateur',
      badge: null,
    },
    {
      href: '/recipes',
      icon: BookOpen,
      label: 'Bibliothèque',
      badge: null,
    },
    {
      href: '/meal-planning',
      icon: Calendar,
      label: 'Planification',
      badge: null,
    },
    {
      href: '/fridge',
      icon: Refrigerator,
      label: 'Mon Frigo',
      badge: expiringCount > 0 ? expiringCount : null,
    },
    {
      href: '/nutrition',
      icon: Activity,
      label: 'Nutrition',
      badge: null,
    },
    {
      href: '/fitness',
      icon: Dumbbell,
      label: 'Fitness',
      badge: null,
    },
    {
      href: '/habits',
      icon: Target,
      label: 'Habitudes',
      badge: null,
    },
    {
      href: '/ai-coach',
      icon: Brain,
      label: 'Coach IA',
      badge: null,
    },
    {
      href: '/insights',
      icon: Sparkles,
      label: 'Insights',
      badge: insightsCount > 0 ? insightsCount : null,
    },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-secondary" />
            <span className="text-xl font-bold text-foreground">AI Recipe Generator</span>
            {isPremium && <PremiumBadge variant="small" />}
            {isInTrial && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                Trial: {trialDaysRemaining}d left
              </span>
            )}
          </div>

          <div className="flex gap-4 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-md'
                      : 'text-foreground-secondary hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Meal Planning Icon */}
            <Link
              href="/weekly-planning"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-foreground-secondary hover:bg-muted hover:text-foreground transition-all duration-200"
              title="Weekly Meal Planning"
            >
              <Calendar className="w-5 h-5" />
            </Link>

            {/* AI Nutritionist Icon */}
            <Link
              href="/ai-nutritionist"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-foreground-secondary hover:bg-muted hover:text-foreground transition-all duration-200"
              title="AI Nutritionist"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Account Menu */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-foreground-secondary hover:bg-muted hover:text-foreground transition-all duration-200"
              >
                <User className="w-5 h-5" />
              </button>

              {showAccountMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAccountMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-2 z-20">
                    <Link
                      href="/account/subscription"
                      onClick={() => setShowAccountMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all duration-200"
                    >
                      <CreditCard className="w-5 h-5 text-foreground-tertiary" />
                      <span className="text-foreground-secondary">Subscription</span>
                    </Link>
                    {!isPremium && (
                      <Link
                        href="/pricing"
                        onClick={() => setShowAccountMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all duration-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
                      >
                        <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Upgrade to Premium</span>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
