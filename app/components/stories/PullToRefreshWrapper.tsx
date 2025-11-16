'use client';

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/app/hooks/usePullToRefresh';

interface PullToRefreshWrapperProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
}

export default function PullToRefreshWrapper({
  children,
  onRefresh,
}: PullToRefreshWrapperProps) {
  const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
    onRefresh,
    threshold: 80,
    resistance: 2.5,
  });

  const rotation = Math.min((pullDistance / 80) * 360, 360);
  const opacity = Math.min(pullDistance / 80, 1);
  const scale = Math.min(pullDistance / 80, 1);

  return (
    <div className="relative">
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{
          y: pullDistance > 0 ? Math.min(pullDistance - 20, 60) : -40,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isPulling || isRefreshing ? opacity : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="flex items-center justify-center"
          style={{
            scale: isPulling || isRefreshing ? scale : 0,
          }}
        >
          <motion.div
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
            animate={{
              rotate: isRefreshing ? 360 : rotation,
            }}
            transition={
              isRefreshing
                ? {
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : { duration: 0.1 }
            }
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{
          y: isPulling && !isRefreshing ? pullDistance * 0.5 : 0,
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
