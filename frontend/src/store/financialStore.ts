import { create } from 'zustand';

// Recurring Transaction Interface
export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: 'salary' | 'rent' | 'utilities' | 'subscription' | 'insurance' | 'other';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  nextDueDate: string;
  type: 'income' | 'expense';
  notifyBefore?: number; // days before
}

// Debt/Loan Interface
export interface Debt {
  id: string;
  name: string;
  principal: number;
  currentBalance: number;
  interestRate: number;
  emiAmount?: number;
  totalEMIs?: number;
  completedEMIs?: number;
  dueDate: string;
  type: 'loan' | 'creditcard' | 'emi';
  creditor?: string;
  notes?: string;
}

// Alert Interface
export interface Alert {
  id: string;
  type: 'budget_exceeded' | 'bill_due' | 'low_savings' | 'high_spending' | 'debt_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  createdAt: string;
  isRead: boolean;
}

// Financial Health Score
export interface FinancialHealth {
  overallScore: number; // 0-100
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  budgetAdherence: number;
  trends: {
    label: string;
    value: number;
    status: 'improving' | 'stable' | 'declining';
  }[];
}

interface FinancialState {
  recurringTransactions: RecurringTransaction[];
  debts: Debt[];
  alerts: Alert[];
  financialHealth: FinancialHealth | null;

  // Recurring Transactions Actions
  addRecurringTransaction: (transaction: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  getRecurringTransactions: () => RecurringTransaction[];
  getDueRecurringTransactions: () => RecurringTransaction[];

  // Debt Actions
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  getDebts: () => Debt[];
  getTotalDebt: () => number;
  calculateDebtPayoffDate: (debtId: string) => Date | null;

  // Alert Actions
  addAlert: (alert: Alert) => void;
  markAlertAsRead: (id: string) => void;
  deleteAlert: (id: string) => void;
  getUnreadAlerts: () => Alert[];
  getAllAlerts: () => Alert[];

  // Financial Health
  calculateFinancialHealth: (monthlyIncome: number, monthlySpending: number, savingGoal: number) => void;
  getFinancialHealth: () => FinancialHealth | null;
}

export const useFinancialStore = create<FinancialState>((set, get) => {
  // Load from localStorage
  const savedRecurring = localStorage.getItem('recurringTransactions');
  const savedDebts = localStorage.getItem('debts');
  const savedAlerts = localStorage.getItem('alerts');
  const savedHealth = localStorage.getItem('financialHealth');

  return {
    recurringTransactions: savedRecurring ? JSON.parse(savedRecurring) : [],
    debts: savedDebts ? JSON.parse(savedDebts) : [],
    alerts: savedAlerts ? JSON.parse(savedAlerts) : [],
    financialHealth: savedHealth ? JSON.parse(savedHealth) : null,

    // Recurring Transactions
    addRecurringTransaction: (transaction: RecurringTransaction) => {
      set((state) => {
        const updated = [...state.recurringTransactions, transaction];
        localStorage.setItem('recurringTransactions', JSON.stringify(updated));
        return { recurringTransactions: updated };
      });
    },

    updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => {
      set((state) => {
        const updated = state.recurringTransactions.map((t) =>
          t.id === id ? { ...t, ...transaction } : t
        );
        localStorage.setItem('recurringTransactions', JSON.stringify(updated));
        return { recurringTransactions: updated };
      });
    },

    deleteRecurringTransaction: (id: string) => {
      set((state) => {
        const updated = state.recurringTransactions.filter((t) => t.id !== id);
        localStorage.setItem('recurringTransactions', JSON.stringify(updated));
        return { recurringTransactions: updated };
      });
    },

    getRecurringTransactions: () => get().recurringTransactions,

    getDueRecurringTransactions: () => {
      const today = new Date().toISOString().split('T')[0];
      return get().recurringTransactions.filter((t) => t.isActive && t.nextDueDate <= today);
    },

    // Debts
    addDebt: (debt: Debt) => {
      set((state) => {
        const updated = [...state.debts, debt];
        localStorage.setItem('debts', JSON.stringify(updated));
        return { debts: updated };
      });
    },

    updateDebt: (id: string, debt: Partial<Debt>) => {
      set((state) => {
        const updated = state.debts.map((d) =>
          d.id === id ? { ...d, ...debt } : d
        );
        localStorage.setItem('debts', JSON.stringify(updated));
        return { debts: updated };
      });
    },

    deleteDebt: (id: string) => {
      set((state) => {
        const updated = state.debts.filter((d) => d.id !== id);
        localStorage.setItem('debts', JSON.stringify(updated));
        return { debts: updated };
      });
    },

    getDebts: () => get().debts,

    getTotalDebt: () => {
      return get().debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    },

    calculateDebtPayoffDate: (debtId: string) => {
      const debt = get().debts.find((d) => d.id === debtId);
      if (!debt || !debt.emiAmount || !debt.totalEMIs) return null;

      const completed = debt.completedEMIs || 0;
      const remaining = debt.totalEMIs - completed;
      const dueDate = new Date(debt.dueDate);
      dueDate.setMonth(dueDate.getMonth() + remaining);
      return dueDate;
    },

    // Alerts
    addAlert: (alert: Alert) => {
      set((state) => {
        const updated = [...state.alerts, alert];
        localStorage.setItem('alerts', JSON.stringify(updated));
        return { alerts: updated };
      });
    },

    markAlertAsRead: (id: string) => {
      set((state) => {
        const updated = state.alerts.map((a) =>
          a.id === id ? { ...a, isRead: true } : a
        );
        localStorage.setItem('alerts', JSON.stringify(updated));
        return { alerts: updated };
      });
    },

    deleteAlert: (id: string) => {
      set((state) => {
        const updated = state.alerts.filter((a) => a.id !== id);
        localStorage.setItem('alerts', JSON.stringify(updated));
        return { alerts: updated };
      });
    },

    getUnreadAlerts: () => get().alerts.filter((a) => !a.isRead),

    getAllAlerts: () => get().alerts,

    // Financial Health
    calculateFinancialHealth: (monthlyIncome: number, monthlySpending: number, savingGoal: number) => {
      const debts = get().debts;
      const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);

      const savingsRate = ((monthlyIncome - monthlySpending) / monthlyIncome) * 100;
      const debtToIncomeRatio = totalDebt / (monthlyIncome * 12);
      const monthlyEmergencyFund = monthlyIncome - monthlySpending;
      const emergencyFundMonths = monthlyEmergencyFund > 0 ? 6 : 0; // Assuming 6 months needed
      const budgetAdherence = ((savingGoal - monthlySpending) / savingGoal) * 100;

      // Calculate overall score (0-100)
      const scoreComponents = {
        savingsRate: Math.min(savingsRate / 30 * 100, 100), // 30% savings = 100 score
        debtRatio: Math.max(100 - debtToIncomeRatio * 100, 0), // Lower debt ratio = higher score
        emergencyFund: Math.min(emergencyFundMonths * 16.66, 100), // 6 months = 100 score
        budgetAdherence: Math.max(budgetAdherence, 0),
      };

      const overallScore =
        (scoreComponents.savingsRate * 0.3 +
          scoreComponents.debtRatio * 0.3 +
          scoreComponents.emergencyFund * 0.2 +
          scoreComponents.budgetAdherence * 0.2) /
        100;

      const health: FinancialHealth = {
        overallScore: Math.min(Math.max(overallScore, 0), 100),
        savingsRate,
        debtToIncomeRatio,
        emergencyFundMonths,
        budgetAdherence,
        trends: [
          { label: 'Savings Rate', value: savingsRate, status: savingsRate > 20 ? 'improving' : 'stable' },
          { label: 'Debt Ratio', value: debtToIncomeRatio, status: debtToIncomeRatio < 0.5 ? 'stable' : 'declining' },
          { label: 'Emergency Fund', value: emergencyFundMonths, status: emergencyFundMonths >= 6 ? 'improving' : 'stable' },
        ],
      };

      set({ financialHealth: health });
      localStorage.setItem('financialHealth', JSON.stringify(health));
    },

    getFinancialHealth: () => get().financialHealth,
  };
});
