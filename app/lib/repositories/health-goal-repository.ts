/**
 * Health Goal Repository
 *
 * Data access layer for health goals and milestones using localStorage
 */

import type {
  HealthGoal,
  CreateHealthGoalDTO,
  UpdateHealthGoalDTO,
  Milestone,
  GoalStatus,
  GoalCategory,
} from '../types/health-dashboard';

const STORAGE_KEY = 'health_goals';

export class HealthGoalRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getAllGoals(): HealthGoal[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const goals = JSON.parse(data);
      return goals.map((goal: any) => ({
        ...goal,
        startDate: new Date(goal.startDate),
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        milestones: goal.milestones.map((m: any) => ({
          ...m,
          achievedAt: m.achievedAt ? new Date(m.achievedAt) : undefined,
        })),
      }));
    } catch (error) {
      console.error('Error parsing health goals from localStorage:', error);
      return [];
    }
  }

  private static saveGoals(goals: HealthGoal[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }

  /**
   * Create a new health goal
   */
  static create(data: CreateHealthGoalDTO): HealthGoal {
    const goals = this.getAllGoals();
    const userId = this.getUserId();

    const milestones: Milestone[] = (data.milestones || []).map((m, index) => ({
      id: `milestone_${Date.now()}_${index}`,
      goalId: '', // Will be set below
      title: m.title,
      targetValue: m.targetValue,
      achieved: false,
      reward: m.reward,
    }));

    const goalId = `goal_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Set goalId for milestones
    milestones.forEach(m => (m.goalId = goalId));

    const newGoal: HealthGoal = {
      id: goalId,
      userId,
      category: data.category,
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue,
      unit: data.unit,
      startDate: new Date(),
      targetDate: new Date(data.targetDate),
      status: 'active',
      milestones,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  }

  /**
   * Get all goals for the current user
   */
  static getAll(): HealthGoal[] {
    const userId = this.getUserId();
    return this.getAllGoals()
      .filter(g => g.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get goal by ID
   */
  static getById(id: string): HealthGoal | null {
    const goals = this.getAllGoals();
    return goals.find(g => g.id === id) || null;
  }

  /**
   * Get goals by status
   */
  static getByStatus(status: GoalStatus): HealthGoal[] {
    const userId = this.getUserId();
    return this.getAllGoals().filter(
      g => g.userId === userId && g.status === status
    );
  }

  /**
   * Get active goals
   */
  static getActive(): HealthGoal[] {
    return this.getByStatus('active');
  }

  /**
   * Get goals by category
   */
  static getByCategory(category: GoalCategory): HealthGoal[] {
    const userId = this.getUserId();
    return this.getAllGoals().filter(
      g => g.userId === userId && g.category === category
    );
  }

  /**
   * Update goal
   */
  static update(id: string, data: UpdateHealthGoalDTO): HealthGoal | null {
    const goals = this.getAllGoals();
    const index = goals.findIndex(g => g.id === id);

    if (index === -1) return null;

    const updated: HealthGoal = {
      ...goals[index],
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.targetValue !== undefined && { targetValue: data.targetValue }),
      ...(data.currentValue !== undefined && { currentValue: data.currentValue }),
      ...(data.targetDate !== undefined && { targetDate: new Date(data.targetDate) }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: new Date(),
    };

    // If status changed to completed, set completedAt
    if (data.status === 'completed' && !updated.completedAt) {
      updated.completedAt = new Date();
    }

    goals[index] = updated;
    this.saveGoals(goals);
    return updated;
  }

  /**
   * Update current value and check for milestone achievements
   */
  static updateProgress(id: string, currentValue: number): HealthGoal | null {
    const goals = this.getAllGoals();
    const index = goals.findIndex(g => g.id === id);

    if (index === -1) return null;

    const goal = goals[index];
    const previousValue = goal.currentValue;

    // Update current value
    goal.currentValue = currentValue;
    goal.updatedAt = new Date();

    // Check if goal is completed
    const isIncreasing = goal.targetValue > goal.currentValue;
    const isCompleted = isIncreasing
      ? currentValue >= goal.targetValue
      : currentValue <= goal.targetValue;

    if (isCompleted && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    // Check and update milestones
    goal.milestones.forEach(milestone => {
      if (!milestone.achieved) {
        const milestoneReached = isIncreasing
          ? currentValue >= milestone.targetValue && previousValue < milestone.targetValue
          : currentValue <= milestone.targetValue && previousValue > milestone.targetValue;

        if (milestoneReached) {
          milestone.achieved = true;
          milestone.achievedAt = new Date();
        }
      }
    });

    goals[index] = goal;
    this.saveGoals(goals);
    return goal;
  }

  /**
   * Add milestone to goal
   */
  static addMilestone(
    goalId: string,
    milestone: Omit<Milestone, 'id' | 'goalId' | 'achieved' | 'achievedAt'>
  ): HealthGoal | null {
    const goals = this.getAllGoals();
    const index = goals.findIndex(g => g.id === goalId);

    if (index === -1) return null;

    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      goalId,
      title: milestone.title,
      targetValue: milestone.targetValue,
      achieved: false,
      reward: milestone.reward,
    };

    goals[index].milestones.push(newMilestone);
    goals[index].updatedAt = new Date();

    this.saveGoals(goals);
    return goals[index];
  }

  /**
   * Delete goal
   */
  static delete(id: string): boolean {
    const goals = this.getAllGoals();
    const filtered = goals.filter(g => g.id !== id);

    if (filtered.length === goals.length) return false;

    this.saveGoals(filtered);
    return true;
  }

  /**
   * Get progress percentage for a goal
   */
  static getProgressPercentage(id: string): number {
    const goal = this.getById(id);
    if (!goal) return 0;

    const range = Math.abs(goal.targetValue - goal.currentValue);
    const total = Math.abs(goal.targetValue - goal.currentValue);

    if (total === 0) return 100;

    return Math.min(100, Math.max(0, ((total - range) / total) * 100));
  }

  /**
   * Get days remaining until target date
   */
  static getDaysRemaining(id: string): number {
    const goal = this.getById(id);
    if (!goal) return 0;

    const today = new Date();
    const diff = goal.targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Get achieved milestones for a goal
   */
  static getAchievedMilestones(id: string): Milestone[] {
    const goal = this.getById(id);
    if (!goal) return [];

    return goal.milestones.filter(m => m.achieved);
  }

  /**
   * Get pending milestones for a goal
   */
  static getPendingMilestones(id: string): Milestone[] {
    const goal = this.getById(id);
    if (!goal) return [];

    return goal.milestones.filter(m => !m.achieved);
  }
}
