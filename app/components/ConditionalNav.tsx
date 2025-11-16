'use client';

import { usePathname } from 'next/navigation';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';

export default function ConditionalNav() {
  const pathname = usePathname();

  // Hide navigation on auth and legal pages
  const isAuthPage = pathname?.startsWith('/auth');
  const isLegalPage = pathname?.startsWith('/legal');

  if (isAuthPage || isLegalPage) {
    return null;
  }

  return (
    <>
      <MobileHeader />
      <BottomNavigation />
    </>
  );
}
