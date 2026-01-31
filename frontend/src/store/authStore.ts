import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  phone_number: string;
  full_name: string;
  profile_picture?: string;
  monthly_income?: number;
  monthly_budget?: number;
  saving_goal?: number;
  last_income_update?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, phone: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  updateFinancialGoals: (income: number, budget: number, savingGoal: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if user is already logged in (from localStorage)
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    register: async (email: string, phone: string, password: string, name: string) => {
      try {
        set({ isLoading: true, error: null });
        
        const response = await fetch('http://localhost:3000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone_number: phone, password, full_name: name }),
        });

        if (!response.ok) throw new Error('Registration failed');

        const data = await response.json();
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: any) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    },

    setUser: (user: User) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },

    setToken: (token: string) => {
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    },

    clearError: () => set({ error: null }),

    updateFinancialGoals: (income: number, budget: number, savingGoal: number) => {
      const currentState = useAuthStore.getState();
      const updatedUser = {
        ...(currentState.user || {}),
        monthly_income: income,
        monthly_budget: budget,
        saving_goal: savingGoal,
        last_income_update: new Date().toISOString(),
      } as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    },
  };
});
