'use client';

import { useEffect } from 'react';
import { useUser } from '@/lib/hooks/useUser';

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  useEffect(() => {
    // Set locale cookie based on user preference
    if (user?.settings?.language) {
      document.cookie = `locale=${user.settings.language}; path=/; max-age=31536000`; // 1 year
    }
  }, [user?.settings?.language]);

  return <>{children}</>;
}
