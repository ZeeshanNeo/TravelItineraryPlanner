import api from './api';

export interface Expense {
  id: string;
  tripId: string;
  bookingId?: string;
  activityId?: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountInBaseCurrency: number;
  date: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  tripId?: string;
  bookingId?: string;
  activityId?: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  date: string;
}

const expenseService = {
  getTripExpenses: async (tripId: string): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(`/trips/${tripId}/expenses`);
    return response.data;
  },

  getExpense: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (tripId: string, expense: CreateExpenseRequest): Promise<Expense> => {
    const response = await api.post<Expense>(`/trips/${tripId}/expenses`, expense);
    return response.data;
  },

  updateExpense: async (id: string, expense: Partial<CreateExpenseRequest>): Promise<Expense> => {
    const response = await api.put<Expense>(`/expenses/${id}`, expense);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  }
};

export default expenseService;
