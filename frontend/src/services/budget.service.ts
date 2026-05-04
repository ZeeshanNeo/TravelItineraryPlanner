import api from './api';

export interface CategoryBudget {
  id?: string;
  category: string;
  amount: number;
}

export interface TripBudget {
  id?: string;
  tripId: string;
  totalAmount: number;
  currency: string;
  categoryBudgets: CategoryBudget[];
}

export interface CategorySummary {
  category: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageSpent: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  currency: string;
  categorySummaries: CategorySummary[];
}

const budgetService = {
  getBudget: async (tripId: string): Promise<TripBudget> => {
    const response = await api.get<TripBudget>(`/trips/${tripId}/budgets`);
    return response.data;
  },

  updateBudget: async (tripId: string, budget: Partial<TripBudget>): Promise<TripBudget> => {
    const response = await api.put<TripBudget>(`/trips/${tripId}/budgets`, budget);
    return response.data;
  },

  getSummary: async (tripId: string): Promise<BudgetSummary> => {
    const response = await api.get<BudgetSummary>(`/trips/${tripId}/budgets/summary`);
    return response.data;
  }
};

export default budgetService;
