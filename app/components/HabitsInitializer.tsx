'use client';

import { useEffect } from 'react';
import { AchievementRepository } from '../lib/repositories/achievement-repository';

/**
 * Component to initialize habits system data on app start
 */
export default function HabitsInitializer() {
  useEffect(() => {
    // Seed achievements in localStorage
    AchievementRepository.seed();
  }, []);

  return null; // This component renders nothing
}
