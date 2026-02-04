import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Investment Types
export type InvestmentType = 'mutual_fund' | 'fixed_deposit' | 'sip' | 'stock' | 'gold' | 'bond' | 'other';
export type RiskProfile = 'conservative' | 'moderate' | 'aggressive';

// Investment Interface
export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  amount: number; // invested amount
  currentValue: number;
  units?: number; // for mutual funds
  navPrice?: number; // NAV for funds
  interestRate?: number; // for FDs
  maturityDate?: string;
  provider: string; // bank/broker name
  linkedGoalId?: string; // optional link to savings goal
  purchaseDate: string;
  riskLevel: RiskProfile;
  expectedReturnPercentage?: number;
  actualReturnPercentage?: number;
  notes?: string;
  documents?: string[]; // file URLs
  createdAt: string;
  updatedAt: string;
}

// Investment Performance
export interface InvestmentPerformance {
  investmentId: string;
  date: string;
  value: number;
  units?: number;
  navPrice?: number;
}

// Investment Alert
export interface InvestmentAlert {
  id: string;
  investmentId: string;
  type: 'maturity' | 'low_returns' | 'high_volatility' | 'rebalance_needed';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

// Portfolio Summary
export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  averageRiskLevel: RiskProfile;
  allocationByType: Record<InvestmentType, number>;
  allocationByRisk: Record<RiskProfile, number>;
}

interface InvestmentState {
  // Investments
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  getInvestment: (id: string) => Investment | undefined;
  getInvestments: () => Investment[];
  getInvestmentsByType: (type: InvestmentType) => Investment[];
  getInvestmentsByRisk: (riskLevel: RiskProfile) => Investment[];
  getInvestmentsByGoal: (goalId: string) => Investment[];

  // Performance Tracking
  performance: InvestmentPerformance[];
  addPerformanceRecord: (record: Omit<InvestmentPerformanceRecord, 'id'>) => void;
  getPerformanceHistory: (investmentId: string) => InvestmentPerformance[];
  updateInvestmentValue: (investmentId: string, newValue: number) => void;

  // Calculations
  calculateROI: (investmentId: string) => number; // percentage
  calculateAnnualizedReturn: (investmentId: string) => number;
  calculateGainLoss: (investmentId: string) => number; // absolute value
  getPortfolioSummary: () => PortfolioSummary;
  getRiskScore: () => number; // 0-100

  // Alerts
  alerts: InvestmentAlert[];
  addAlert: (alert: Omit<InvestmentAlert, 'id' | 'date'>) => void;
  markAlertAsRead: (alertId: string) => void;
  deleteAlert: (alertId: string) => void;
  getUnreadAlerts: () => InvestmentAlert[];

  // Risk Profiling
  assessRiskProfile: (
    age: number,
    investmentHorizon: number,
    savingsAmount: number,
    monthlyIncome: number
  ) => RiskProfile;

  // Rebalancing
  suggestRebalance: () => Array<{
    type: InvestmentType;
    currentAllocation: number;
    recommendedAllocation: number;
  }>;
}

interface InvestmentPerformanceRecord {
  id?: string;
  investmentId: string;
  date: string;
  value: number;
  units?: number;
  navPrice?: number;
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => {
      const generateId = () => Math.random().toString(36).substr(2, 9);

      return {
        investments: [],
        performance: [],
        alerts: [],

        // Investments Management
        addInvestment: (investment) => {
          const newInvestment: Investment = {
            ...investment,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({ investments: [...state.investments, newInvestment] }));
        },

        updateInvestment: (id, investment) => {
          set((state) => ({
            investments: state.investments.map((inv) =>
              inv.id === id
                ? { ...inv, ...investment, updatedAt: new Date().toISOString() }
                : inv
            ),
          }));
        },

        deleteInvestment: (id) => {
          set((state) => ({
            investments: state.investments.filter((inv) => inv.id !== id),
            performance: state.performance.filter((p) => p.investmentId !== id),
            alerts: state.alerts.filter((a) => a.investmentId !== id),
          }));
        },

        getInvestment: (id) => {
          return get().investments.find((inv) => inv.id === id);
        },

        getInvestments: () => get().investments,

        getInvestmentsByType: (type) => {
          return get().investments.filter((inv) => inv.type === type);
        },

        getInvestmentsByRisk: (riskLevel) => {
          return get().investments.filter((inv) => inv.riskLevel === riskLevel);
        },

        getInvestmentsByGoal: (goalId) => {
          return get().investments.filter((inv) => inv.linkedGoalId === goalId);
        },

        // Performance
        addPerformanceRecord: (record) => {
          const newRecord: InvestmentPerformance = {
            investmentId: record.investmentId,
            date: record.date,
            value: record.value,
            units: record.units,
            navPrice: record.navPrice,
          };

          set((state) => {
            const updatedPerformance = [...state.performance, newRecord];
            return { performance: updatedPerformance };
          });

          // Update investment current value
          get().updateInvestmentValue(record.investmentId, record.value);
        },

        getPerformanceHistory: (investmentId) => {
          return get().performance.filter((p) => p.investmentId === investmentId);
        },

        updateInvestmentValue: (investmentId, newValue) => {
          get().updateInvestment(investmentId, { currentValue: newValue });
        },

        // Calculations
        calculateROI: (investmentId) => {
          const investment = get().getInvestment(investmentId);
          if (!investment) return 0;

          const roi =
            ((investment.currentValue - investment.amount) / investment.amount) * 100;
          return parseFloat(roi.toFixed(2));
        },

        calculateAnnualizedReturn: (investmentId) => {
          const investment = get().getInvestment(investmentId);
          if (!investment) return 0;

          const purchaseDate = new Date(investment.purchaseDate);
          const today = new Date();
          const yearsHeld = (today.getTime() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

          if (yearsHeld <= 0) return 0;

          const roi = get().calculateROI(investmentId);
          const annualizedReturn = Math.pow(1 + roi / 100, 1 / yearsHeld) - 1;

          return parseFloat((annualizedReturn * 100).toFixed(2));
        },

        calculateGainLoss: (investmentId) => {
          const investment = get().getInvestment(investmentId);
          if (!investment) return 0;
          return investment.currentValue - investment.amount;
        },

        getPortfolioSummary: () => {
          const investments = get().investments;

          const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
          const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
          const totalGainLoss = totalCurrentValue - totalInvested;
          const gainLossPercentage =
            totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

          // Calculate allocations
          const allocationByType: Record<InvestmentType, number> = {
            mutual_fund: 0,
            fixed_deposit: 0,
            sip: 0,
            stock: 0,
            gold: 0,
            bond: 0,
            other: 0,
          };

          const allocationByRisk: Record<RiskProfile, number> = {
            conservative: 0,
            moderate: 0,
            aggressive: 0,
          };

          investments.forEach((inv) => {
            const percentage = (inv.currentValue / totalCurrentValue) * 100;
            allocationByType[inv.type] = (allocationByType[inv.type] || 0) + percentage;
            allocationByRisk[inv.riskLevel] =
              (allocationByRisk[inv.riskLevel] || 0) + percentage;
          });

          // Calculate average risk
          const riskWeights = {
            conservative: 0,
            moderate: 0,
            aggressive: 0,
          };

          investments.forEach((inv) => {
            riskWeights[inv.riskLevel] += inv.currentValue;
          });

          let averageRiskLevel: RiskProfile = 'moderate';
          if (riskWeights.aggressive > riskWeights.conservative) {
            averageRiskLevel = 'aggressive';
          } else if (riskWeights.conservative > riskWeights.moderate) {
            averageRiskLevel = 'conservative';
          }

          return {
            totalInvested,
            totalCurrentValue,
            totalGainLoss,
            gainLossPercentage: parseFloat(gainLossPercentage.toFixed(2)),
            averageRiskLevel,
            allocationByType,
            allocationByRisk,
          };
        },

        getRiskScore: () => {
          const riskWeights = { conservative: 0, moderate: 50, aggressive: 100 };
          const investments = get().investments;

          if (investments.length === 0) return 0;

          const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
          let riskScore = 0;

          investments.forEach((inv) => {
            const weight = inv.currentValue / totalValue;
            riskScore += riskWeights[inv.riskLevel] * weight;
          });

          return Math.round(riskScore);
        },

        // Alerts
        addAlert: (alert) => {
          const newAlert: InvestmentAlert = {
            ...alert,
            id: generateId(),
            date: new Date().toISOString(),
          };
          set((state) => ({ alerts: [...state.alerts, newAlert] }));
        },

        markAlertAsRead: (alertId) => {
          set((state) => ({
            alerts: state.alerts.map((a) =>
              a.id === alertId ? { ...a, isRead: true } : a
            ),
          }));
        },

        deleteAlert: (alertId) => {
          set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== alertId),
          }));
        },

        getUnreadAlerts: () => {
          return get().alerts.filter((a) => !a.isRead);
        },

        // Risk Profiling
        assessRiskProfile: (age, investmentHorizon, savingsAmount, monthlyIncome) => {
          let score = 0;

          // Age factor (younger = can take more risk)
          if (age < 30) score += 30;
          else if (age < 45) score += 20;
          else if (age < 60) score += 10;
          else score += 0;

          // Investment horizon
          if (investmentHorizon > 10) score += 30;
          else if (investmentHorizon > 5) score += 20;
          else if (investmentHorizon > 2) score += 10;
          else score += 0;

          // Emergency fund check
          const emergencyMonths = savingsAmount / monthlyIncome;
          if (emergencyMonths >= 6) score += 20;
          else if (emergencyMonths >= 3) score += 10;
          else score += 0;

          if (score >= 60) return 'aggressive';
          if (score >= 40) return 'moderate';
          return 'conservative';
        },

        // Rebalancing
        suggestRebalance: () => {
          const summary = get().getPortfolioSummary();

          // Recommended allocation based on risk profile
          const recommendations = {
            conservative: {
              mutual_fund: 20,
              fixed_deposit: 50,
              sip: 10,
              stock: 5,
              gold: 10,
              bond: 5,
              other: 0,
            },
            moderate: {
              mutual_fund: 35,
              fixed_deposit: 30,
              sip: 15,
              stock: 10,
              gold: 5,
              bond: 5,
              other: 0,
            },
            aggressive: {
              mutual_fund: 40,
              fixed_deposit: 15,
              sip: 20,
              stock: 15,
              gold: 5,
              bond: 5,
              other: 0,
            },
          };

          const recommended = recommendations[summary.averageRiskLevel];
          const suggestions: Array<{
            type: InvestmentType;
            currentAllocation: number;
            recommendedAllocation: number;
          }> = [];

          Object.keys(recommended).forEach((type) => {
            const current = summary.allocationByType[type as InvestmentType] || 0;
            const target = recommended[type as InvestmentType] || 0;

            if (Math.abs(current - target) > 5) {
              suggestions.push({
                type: type as InvestmentType,
                currentAllocation: parseFloat(current.toFixed(1)),
                recommendedAllocation: target,
              });
            }
          });

          return suggestions;
        },
      };
    },
    {
      name: 'investment-storage',
      partialize: (state) => ({
        investments: state.investments,
        performance: state.performance,
        alerts: state.alerts,
      }),
    }
  )
);
