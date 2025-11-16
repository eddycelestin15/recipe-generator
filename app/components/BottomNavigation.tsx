'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BookOpen, Plus, Dumbbell, User } from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Home',
  },
  {
    href: '/recipes',
    icon: BookOpen,
    label: 'Recipes',
  },
  {
    href: '/',
    icon: Plus,
    label: 'Add',
    isCenter: true,
  },
  {
    href: '/fitness',
    icon: Dumbbell,
    label: 'Fitness',
  },
  {
    href: '/account/subscription',
    icon: User,
    label: 'Profile',
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 pb-safe">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="absolute left-1/2 -translate-x-1/2 -top-6"
                >
                  <div className="relative">
                    {/* Gradient background with glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary via-primary to-pink-500 rounded-full blur-lg opacity-60 animate-pulse" />

                    {/* Main button */}
                    <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-secondary via-primary to-pink-500 rounded-full shadow-2xl transform transition-all duration-200 active:scale-95 hover:scale-110">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200"
              >
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive
                      ? 'text-primary scale-110'
                      : 'text-foreground-tertiary'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs mt-1 font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-foreground-tertiary'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
