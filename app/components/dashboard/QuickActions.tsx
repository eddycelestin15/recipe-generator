'use client';

import Link from 'next/link';
import { Plus, TrendingUp, Calendar, Target } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      label: 'Logger Poids',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Ajouter Repas',
      icon: Plus,
      href: '/nutrition',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Workout',
      icon: Calendar,
      href: '/fitness',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      label: 'Objectifs',
      icon: Target,
      href: '/goals',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center transition-colors shadow hover:shadow-md`}
        >
          <action.icon className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
