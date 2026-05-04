import api from './api';

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'Owner' | 'Collaborator' | 'Viewer';
  joinedAt: string;
}

export interface Comment {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  activityId?: string;
  text: string;
  createdAt: string;
}

export interface TripTask {
  id: string;
  tripId: string;
  assignedToUserId?: string;
  assignedToUserName: string;
  title: string;
  description: string;
  status: 'ToDo' | 'InProgress' | 'Completed' | 'Cancelled';
  dueDate?: string;
}

export interface ExpenseSplit {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  isPaid: boolean;
}

const collaborationService = {
  // Members
  getMembers: async (tripId: string): Promise<TripMember[]> => {
    const response = await api.get(`/Collaboration/trips/${tripId}/members`);
    return response.data;
  },

  shareTrip: async (tripId: string, email: string, role: string): Promise<TripMember> => {
    const response = await api.post(`/Collaboration/trips/${tripId}/share`, { email, role });
    return response.data;
  },

  removeMember: async (memberId: string): Promise<void> => {
    await api.delete(`/Collaboration/members/${memberId}`);
  },

  // Comments
  getComments: async (tripId: string): Promise<Comment[]> => {
    const response = await api.get(`/Collaboration/trips/${tripId}/comments`);
    return response.data;
  },

  addComment: async (tripId: string, text: string, activityId?: string): Promise<Comment> => {
    const response = await api.post(`/Collaboration/trips/${tripId}/comments`, { text, activityId });
    return response.data;
  },

  // Tasks
  getTasks: async (tripId: string): Promise<TripTask[]> => {
    const response = await api.get(`/Collaboration/trips/${tripId}/tasks`);
    return response.data;
  },

  createTask: async (tripId: string, data: any): Promise<TripTask> => {
    const response = await api.post(`/Collaboration/trips/${tripId}/tasks`, data);
    return response.data;
  },

  updateTaskStatus: async (taskId: string, status: string): Promise<TripTask> => {
    const response = await api.patch(`/Collaboration/tasks/${taskId}/status`, `"${status}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Expense Splitting
  getSplits: async (expenseId: string): Promise<ExpenseSplit[]> => {
    const response = await api.get(`/Collaboration/expenses/${expenseId}/splits`);
    return response.data;
  },

  splitExpense: async (expenseId: string, splits: any[]): Promise<void> => {
    await api.post(`/Collaboration/expenses/${expenseId}/split`, splits);
  },

  getBalances: async (tripId: string): Promise<any> => {
    const response = await api.get(`/Collaboration/trips/${tripId}/balances`);
    return response.data;
  }
};

export default collaborationService;
