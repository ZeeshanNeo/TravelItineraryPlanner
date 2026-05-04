import React, { useState } from 'react';
import type { Expense, CreateExpenseRequest } from '../../services/expense.service';
import { X, Save, Calendar, Tag, CreditCard, Type } from 'lucide-react';

interface ExpenseFormProps {
  tripId: string;
  expense?: Expense | null;
  onSave: (data: CreateExpenseRequest) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = [
  'Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Insurance', 'Miscellaneous'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR'];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ tripId, expense, onSave, onClose }) => {
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    tripId,
    title: expense?.title || '',
    description: expense?.description || '',
    category: expense?.category || 'Miscellaneous',
    amount: expense?.amount || 0,
    currency: expense?.currency || 'USD',
    exchangeRate: expense?.exchangeRate || 1,
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-indigo-400" size={20} />
            {expense ? 'Edit Expense' : 'Log New Expense'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Type size={14} /> Title
              </label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Dinner at Skyline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Tag size={14} /> Category
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <Calendar size={14} /> Date
              </label>
              <input
                type="date"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                <CreditCard size={14} /> Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                Currency
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
              >
                {CURRENCIES.map(curr => (
                  <option key={curr} value={curr} className="bg-slate-900">{curr}</option>
                ))}
              </select>
            </div>

            {formData.currency !== 'USD' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Exchange Rate (1 {formData.currency} = ? USD)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={formData.exchangeRate}
                  onChange={e => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-24 resize-none"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about the expense..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
