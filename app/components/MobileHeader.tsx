'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Bell, Menu, Crown, CreditCard, Settings, Calendar, MessageCircle } from 'lucide-react';
import { useSubscription } from '@/app/lib/hooks/useSubscription';
import ThemeToggle from '@/app/components/ThemeToggle';
import PremiumBadge from '@/app/components/premium/PremiumBadge';

export default function MobileHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isPremium, isInTrial, trialDaysRemaining } = useSubscription();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 pt-safe">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-secondary" />
            <span className="text-lg font-bold text-foreground">Recipe AI</span>
            {isPremium && <PremiumBadge variant="small" />}
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Trial badge */}
            {isInTrial && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                {trialDaysRemaining}d
              </span>
            )}

            {/* Meal Planning */}
            <Link
              href="/weekly-planning"
              className="p-2 rounded-full hover:bg-muted transition-all duration-200"
              title="Weekly Meal Planning"
            >
              <Calendar className="w-5 h-5 text-foreground-secondary" />
            </Link>

            {/* AI Nutritionist */}
            <Link
              href="/ai-nutritionist"
              className="p-2 rounded-full hover:bg-muted transition-all duration-200"
              title="AI Nutritionist"
            >
              <MessageCircle className="w-5 h-5 text-foreground-secondary" />
            </Link>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMenu(false);
                }}
                className="p-2 rounded-full hover:bg-muted transition-all duration-200"
              >
                <Bell className="w-5 h-5 text-foreground-secondary" />
                {/* Notification dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-card rounded-xl shadow-xl border border-border py-2 z-20 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                    </div>
                    <div className="px-4 py-8 text-center text-foreground-tertiary text-sm">
                      No new notifications
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMenu(!showMenu);
                  setShowNotifications(false);
                }}
                className="p-2 rounded-full hover:bg-muted transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-foreground-secondary" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-xl border border-border py-2 z-20">
                    {!isPremium && (
                      <Link
                        href="/pricing"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all duration-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
                      >
                        <Crown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Upgrade to Premium
                        </span>
                      </Link>
                    )}
                    <Link
                      href="/account/subscription"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all duration-200"
                    >
                      <CreditCard className="w-5 h-5 text-foreground-tertiary" />
                      <span className="text-foreground-secondary">Subscription</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-all duration-200"
                    >
                      <Settings className="w-5 h-5 text-foreground-tertiary" />
                      <span className="text-foreground-secondary">Settings</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
