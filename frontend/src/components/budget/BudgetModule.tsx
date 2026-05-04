import React, { useState, useEffect } from 'react';
import { Plus, Settings, CreditCard } from 'lucide-react';
import BudgetOverview from './BudgetOverview';
import ExpenseList from './ExpenseList';
import ExpenseForm from './ExpenseForm';
import BudgetSettings from './BudgetSettings';
import budgetService from '../../services/budget.service';
import type { TripBudget } from '../../services/budget.service';
import expenseService from '../../services/expense.service';
import type { Expense, CreateExpenseRequest } from '../../services/expense.service';
import { useSearch } from '../../context/SearchContext';

interface BudgetModuleProps {
  tripId: string;
}

const BudgetModule: React.FC<BudgetModuleProps> = ({ tripId }) => {
  const [budget, setBudget] = useState<TripBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchBudget();
    fetchExpenses();
  }, [tripId, refreshKey]);

  const fetchBudget = async () => {
    try {
      const data = await budgetService.getBudget(tripId);
      setBudget(data);
    } catch (err) {
      console.error('Error fetching budget:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const data = await expenseService.getTripExpenses(tripId);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = expenses.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.category.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  }, [searchQuery, expenses]);

  const handleSaveExpense = async (data: CreateExpenseRequest) => {
    if (editingExpense) {
      await expenseService.updateExpense(editingExpense.id, data);
    } else {
      await expenseService.createExpense(tripId, data);
    }
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await expenseService.deleteExpense(id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSaveBudget = async (data: Partial<TripBudget>) => {
    await budgetService.updateBudget(tripId, data);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={14} className="text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Financial Terminal</h2>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Active Ledger</h2>
          <p className="text-white/70 text-sm font-medium">Real-time expenditure tracking and fiscal optimization.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-14 h-14 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-2xl transition-all border border-white/10 flex items-center justify-center active:scale-95"
            title="Budget Configuration"
          >
            <Settings size={22} />
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Append Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <BudgetOverview tripId={tripId} key={`overview-${refreshKey}`} />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-sm font-black text-white/60 uppercase tracking-[0.2em]">Transaction History</h3>
             <div className="h-px flex-1 bg-white/5 mx-6"></div>
          </div>
          <ExpenseList 
            expenses={filteredExpenses} 
            onEdit={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDelete={handleDeleteExpense}
          />
        </div>
      </div>

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <ExpenseForm
            tripId={tripId}
            expense={editingExpense}
            onSave={handleSaveExpense}
            onClose={() => setIsExpenseModalOpen(false)}
          />
        </div>
      )}

      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <BudgetSettings
            budget={budget}
            onSave={handleSaveBudget}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default BudgetModule;
