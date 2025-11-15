/**
 * AI Features Type Definitions
 *
 * Defines all TypeScript interfaces and types for AI-powered features
 */

// ============================================================================
// AI CHAT INTERFACES
// ============================================================================

export type ChatRole = 'user' | 'assistant';

export interface ChatContext {
  currentWeight?: number;
  goalWeight?: number;
  todayCalories?: number;
  goalCalories?: number;
  todayProtein?: number;
  goalProtein?: number;
  weeklyWorkouts?: number;
  dietType?: string;
  goalType?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  context?: ChatContext;
}

export interface CreateChatMessageDTO {
  content: string;
  context?: ChatContext;
}

// ============================================================================
// FOOD PHOTO ANALYSIS
// ============================================================================

export interface IdentifiedFood {
  name: string;
  confidence: number; // 0-1
  portion: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
}

export interface TotalEstimated {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodPhotoAnalysis {
  id: string;
  userId: string;
  imageUrl: string;
  analyzedDate: Date;
  identifiedFoods: IdentifiedFood[];
  totalEstimated: TotalEstimated;
  overallAssessment: string;
  wasLoggedAsMeal: boolean;
}

export interface CreatePhotoAnalysisDTO {
  imageUrl: string;
}

// ============================================================================
// AI INSIGHTS & ALERTS
// ============================================================================

export type InsightType = 'alert' | 'suggestion' | 'achievement' | 'tip';
export type InsightPriority = 'low' | 'medium' | 'high';

export interface AIInsight {
  id: string;
  userId: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  message: string;
  actionable?: string; // CTA text
  actionLink?: string; // link to page
  createdDate: Date;
  read: boolean;
}

export interface CreateInsightDTO {
  type: InsightType;
  priority: InsightPriority;
  title: string;
  message: string;
  actionable?: string;
  actionLink?: string;
}

// ============================================================================
// WEEKLY ANALYSIS
// ============================================================================

export interface WeeklyAnalysisData {
  startDate: Date;
  endDate: Date;
  avgCalories: number;
  goalCalories: number;
  avgProtein: number;
  goalProtein: number;
  avgCarbs: number;
  goalCarbs: number;
  avgFat: number;
  goalFat: number;
  workoutsDone: number;
  daysTracked: number;
  complianceScore: number;
}

export interface WeeklyAnalysisResult {
  complianceScore: number; // 0-100
  positives: string[]; // 3 points
  improvements: Array<{
    issue: string;
    action: string;
  }>; // 2 axes
  insight: string; // 1 surprising insight
  motivationalMessage: string;
}

// ============================================================================
// MEAL INSIGHTS
// ============================================================================

export interface MealInsight {
  beforeEating?: {
    percentageOfDailyGoal: number;
    comparison: string; // e.g., "40% higher than your average meal"
    recommendation: string;
  };
  afterLogging?: {
    dayBalance: string; // e.g., "Your day is balanced but lacks vegetables"
    suggestions: string[];
  };
}

// ============================================================================
// OPTIMIZATION
// ============================================================================

export interface MealPlanOptimization {
  originalPlan: any; // reference to meal plan
  suggestions: Array<{
    mealId: string;
    currentFood: string;
    suggestedSwap: string;
    reason: string;
    nutritionalImprovement: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    };
  }>;
  overallImprovement: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitInfo {
  photoAnalysisLimit: number;
  photoAnalysisUsed: number;
  photoAnalysisRemaining: number;
  chatLimit: number;
  chatUsed: number;
  chatRemaining: number;
  resetDate: Date;
}

export interface UserTier {
  tier: 'free' | 'premium';
  limits: {
    photoAnalysisPerDay: number;
    chatMessagesPerDay: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const USER_TIERS: Record<'free' | 'premium', UserTier['limits']> = {
  free: {
    photoAnalysisPerDay: 10,
    chatMessagesPerDay: 50,
  },
  premium: {
    photoAnalysisPerDay: 999999,
    chatMessagesPerDay: 999999,
  },
};

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  alert: 'Alerte',
  suggestion: 'Suggestion',
  achievement: 'Succès',
  tip: 'Conseil',
};

export const INSIGHT_PRIORITY_COLORS: Record<InsightPriority, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
};
