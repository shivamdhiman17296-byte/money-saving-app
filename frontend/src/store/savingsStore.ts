import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Savings Goal Interface
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date
  category: 'emergency' | 'travel' | 'gadgets' | 'education' | 'home' | 'other';
  color: string;
  autoSaveRule?: {
    type: 'percentage' | 'fixed' | 'roundup' | 'salary-portion';
    value: number; // percentage or fixed amount
    frequency: 'daily' | 'weekly' | 'monthly';
  };
  milestones: SavingsMilestone[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Savings Milestone
export interface SavingsMilestone {
  id: string;
  goalId: string;
  amount: number;
  achievedAt?: string;
  description: string;
}

// Savings Contribution
export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  source: 'manual' | 'auto-save' | 'round-up' | 'transfer';
  notes?: string;
}

// Savings Challenge
export interface SavingsChallenge {
  id: string;
  name: string;
  targetSavings: number;
  currentSavings: number;
  duration: 'weekly' | 'monthly' | '30-day' | '90-day';
  startDate: string;
  endDate: string;
  isActive: boolean;
  participants?: number;
  reward?: string;
}

// Savings Streak
export interface SavingsStreak {
  goalId: string;
  currentStreak: number; // days
  longestStreak: number; // days
  lastContributionDate?: string;
}

interface SavingsState {
  // Goals
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  getGoal: (id: string) => SavingsGoal | undefined;
  getGoals: () => SavingsGoal[];
  getGoalsByCategory: (category: string) => SavingsGoal[];

  // Contributions
  contributions: SavingsContribution[];
  addContribution: (contribution: Omit<SavingsContribution, 'id'>) => void;
  getContributionsByGoal: (goalId: string) => SavingsContribution[];
  getTotalContributed: (goalId: string) => number;

  // Milestones
  addMilestone: (goalId: string, milestone: Omit<SavingsMilestone, 'id'>) => void;
  achieveMilestone: (goalId: string, milestoneId: string) => void;
  getMilestonesByGoal: (goalId: string) => SavingsMilestone[];

  // Statistics
  getTotalSavingsTarget: () => number;
  getTotalSavingsCurrent: () => number;
  getSavingsRate: (monthlyIncome: number) => number;
  getGoalProgress: (goalId: string) => number; // percentage
  getGoalDaysRemaining: (goalId: string) => number;

  // Streaks
  streaks: Map<string, SavingsStreak>;
  updateStreak: (goalId: string) => void;
  getStreak: (goalId: string) => SavingsStreak | undefined;

  // Challenges
  challenges: SavingsChallenge[];
  createChallenge: (challenge: Omit<SavingsChallenge, 'id'>) => void;
  updateChallenge: (id: string, challenge: Partial<SavingsChallenge>) => void;
  getChallenges: () => SavingsChallenge[];
  getActiveChallenge: () => SavingsChallenge | undefined;

  // Auto-save rules
  enableAutoSave: (goalId: string, rule: SavingsGoal['autoSaveRule']) => void;
  disableAutoSave: (goalId: string) => void;
  processAutoSaves: () => void;
}

export const useSavingsStore = create<SavingsState>()(
  persist(
    (set, get) => {
      const generateId = () => Math.random().toString(36).substr(2, 9);

      return {
        goals: [],
        contributions: [],
        streaks: new Map(),
        challenges: [],

        // Goals Management
        addGoal: (goal) => {
          const newGoal: SavingsGoal = {
            ...goal,
            id: generateId(),
            milestones: goal.milestones || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ goals: [...state.goals, newGoal] }));
        },

        updateGoal: (id, updatedGoal) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === id
                ? { ...goal, ...updatedGoal, updatedAt: new Date().toISOString() }
                : goal
            ),
          }));
        },

        deleteGoal: (id) => {
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== id),
            contributions: state.contributions.filter((c) => c.goalId !== id),
          }));
        },

        getGoal: (id) => {
          return get().goals.find((goal) => goal.id === id);
        },

        getGoals: () => get().goals,

        getGoalsByCategory: (category) => {
          return get().goals.filter((goal) => goal.category === category);
        },

        // Contributions
        addContribution: (contribution) => {
          const newContribution: SavingsContribution = {
            ...contribution,
            id: generateId(),
          };

          set((state) => {
            const updatedGoals = state.goals.map((goal) =>
              goal.id === contribution.goalId
                ? {
                    ...goal,
                    currentAmount: goal.currentAmount + contribution.amount,
                    updatedAt: new Date().toISOString(),
                  }
                : goal
            );

            return {
              contributions: [...state.contributions, newContribution],
              goals: updatedGoals,
            };
          });

          // Update streak
          get().updateStreak(contribution.goalId);
        },

        getContributionsByGoal: (goalId) => {
          return get().contributions.filter((c) => c.goalId === goalId);
        },

        getTotalContributed: (goalId) => {
          return get().contributions
            .filter((c) => c.goalId === goalId)
            .reduce((sum, c) => sum + c.amount, 0);
        },

        // Milestones
        addMilestone: (goalId, milestone) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    milestones: [
                      ...goal.milestones,
                      { ...milestone, id: generateId() },
                    ],
                  }
                : goal
            ),
          }));
        },

        achieveMilestone: (goalId, milestoneId) => {
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    milestones: goal.milestones.map((m) =>
                      m.id === milestoneId
                        ? { ...m, achievedAt: new Date().toISOString() }
                        : m
                    ),
                  }
                : goal
            ),
          }));
        },

        getMilestonesByGoal: (goalId) => {
          const goal = get().getGoal(goalId);
          return goal?.milestones || [];
        },

        // Statistics
        getTotalSavingsTarget: () => {
          return get().goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
        },

        getTotalSavingsCurrent: () => {
          return get().goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
        },

        getSavingsRate: (monthlyIncome) => {
          return monthlyIncome > 0
            ? (get().getTotalSavingsCurrent() / monthlyIncome) * 100
            : 0;
        },

        getGoalProgress: (goalId) => {
          const goal = get().getGoal(goalId);
          if (!goal) return 0;
          return (goal.currentAmount / goal.targetAmount) * 100;
        },

        getGoalDaysRemaining: (goalId) => {
          const goal = get().getGoal(goalId);
          if (!goal) return 0;
          const deadline = new Date(goal.deadline);
          const today = new Date();
          const diff = deadline.getTime() - today.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24));
        },

        // Streaks
        updateStreak: (goalId) => {
          set((state) => {
            const currentStreak = state.streaks.get(goalId);
            const today = new Date().toISOString().split('T')[0];
            const lastContributionDate = currentStreak?.lastContributionDate;

            let newStreak = currentStreak?.currentStreak || 0;

            if (lastContributionDate !== today) {
              const lastDate = lastContributionDate
                ? new Date(lastContributionDate)
                : new Date();
              const diffDays = Math.floor(
                (new Date(today).getTime() - lastDate.getTime()) /
                  (1000 * 3600 * 24)
              );

              if (diffDays === 1) {
                newStreak = (currentStreak?.currentStreak || 0) + 1;
              } else if (diffDays > 1) {
                newStreak = 1;
              } else {
                newStreak = Math.max(newStreak, 1);
              }
            }

            const updatedStreaks = new Map(state.streaks);
            updatedStreaks.set(goalId, {
              goalId,
              currentStreak: newStreak,
              longestStreak: Math.max(
                newStreak,
                currentStreak?.longestStreak || 0
              ),
              lastContributionDate: today,
            });

            return { streaks: updatedStreaks };
          });
        },

        getStreak: (goalId) => {
          return get().streaks.get(goalId);
        },

        // Challenges
        createChallenge: (challenge) => {
          const newChallenge: SavingsChallenge = {
            ...challenge,
            id: generateId(),
          };
          set((state) => ({ challenges: [...state.challenges, newChallenge] }));
        },

        updateChallenge: (id, challenge) => {
          set((state) => ({
            challenges: state.challenges.map((c) =>
              c.id === id ? { ...c, ...challenge } : c
            ),
          }));
        },

        getChallenges: () => get().challenges,

        getActiveChallenge: () => {
          return get().challenges.find((c) => c.isActive);
        },

        // Auto-save
        enableAutoSave: (goalId, rule) => {
          get().updateGoal(goalId, { autoSaveRule: rule });
        },

        disableAutoSave: (goalId) => {
          get().updateGoal(goalId, { autoSaveRule: undefined });
        },

        processAutoSaves: () => {
          // This would be called by a scheduled service
          // For now, it's a placeholder for the auto-save logic
          const goals = get().goals;
          goals.forEach((goal) => {
            if (goal.autoSaveRule) {
              // Process based on rule type
              let amount = 0;
              switch (goal.autoSaveRule.type) {
                case 'fixed':
                  amount = goal.autoSaveRule.value;
                  break;
                case 'percentage':
                  // Would need monthly income from auth store
                  amount = 0;
                  break;
              }

              if (amount > 0) {
                get().addContribution({
                  goalId: goal.id,
                  amount,
                  date: new Date().toISOString(),
                  source: 'auto-save',
                });
              }
            }
          });
        },
      };
    },
    {
      name: 'savings-storage',
      partialize: (state) => ({
        goals: state.goals,
        contributions: state.contributions,
        challenges: state.challenges,
      }),
    }
  )
);
