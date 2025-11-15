'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ChefHat, BookOpen, Activity, Calendar, Dumbbell, LayoutDashboard, Target, Sparkles, Brain } from 'lucide-react';

export default function Navigation() {
  const [expiringCount, setExpiringCount] = useState(0);
  const [insightsCount, setInsightsCount] = useState(0);
  const pathname = usePathname();

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
      href: '/',
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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-800">AI Recipe Generator</span>
          </div>

          <div className="flex gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
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
          </div>
        </div>
      </div>
    </nav>
  );
}
