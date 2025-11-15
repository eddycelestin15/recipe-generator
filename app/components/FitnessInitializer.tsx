'use client';

import { useEffect } from 'react';
import { initializeFitnessData } from '../lib/utils/fitness-seed-data';

export default function FitnessInitializer() {
  useEffect(() => {
    // Initialize fitness data on first load
    if (typeof window !== 'undefined') {
      initializeFitnessData();
    }
  }, []);

  return null; // This component doesn't render anything
}
