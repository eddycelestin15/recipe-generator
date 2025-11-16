'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SessionLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Public routes that don't need session check
  const isPublicRoute =
    pathname?.startsWith('/auth') || pathname?.startsWith('/legal');

  useEffect(() => {
    // Mark initial load as complete after session check
    if (status !== 'loading') {
      setIsInitialLoad(false);
    }
  }, [status]);

  // Show loading screen only on initial load for protected routes
  if (isInitialLoad && !isPublicRoute && status === 'loading') {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Logo */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
              <svg
                className="w-11 h-11 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-2xl animate-spin" />
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Recipe Health
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading your experience...
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
