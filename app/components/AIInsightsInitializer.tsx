'use client';

import { useEffect } from 'react';
import { AutoInsightsService } from '../lib/services/auto-insights-service';

/**
 * AI Insights Initializer
 *
 * Initializes automatic insights generation
 * Should be added to the root layout
 */
export default function AIInsightsInitializer() {
  useEffect(() => {
    // Initialize auto insights
    AutoInsightsService.initialize();
  }, []);

  return null; // This component doesn't render anything
}
