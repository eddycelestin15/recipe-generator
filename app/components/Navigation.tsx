'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ChefHat, BookOpen, Activity } from 'lucide-react';

export default function Navigation() {
  const [expiringCount, setExpiringCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    loadExpiringCount();

    // Recharger toutes les 60 secondes
    const interval = setInterval(loadExpiringCount, 60000);
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

  const navItems = [
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
