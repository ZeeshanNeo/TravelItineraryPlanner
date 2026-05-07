import React, { useState } from 'react';
import type { TripBudget, CategoryBudget } from '../../services/budget.service';
import { X, Save, DollarSign, PieChart as PieIcon } from 'lucide-react';

interface BudgetSettingsProps {
  budget: TripBudget | null;
  onSave: (data: Partial<TripBudget>) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = [
  'Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Insurance', 'Miscellaneous'
];

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ budget, onSave, onClose }) => {
  const [totalAmount, setTotalAmount] = useState(budget?.totalAmount || 0);
  const [currency, setCurrency] = useState(budget?.currency || 'USD');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(
    budget?.categoryBudgets?.reduce((acc, cb) => ({ ...acc, [cb.category]: cb.amount }), {}) || {}
  );
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (category: string, amount: number) => {
    setCategoryBudgets(prev => ({ ...prev, [category]: amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedCategoryBudgets = Object.entries(categoryBudgets)
        .filter(([_, amount]) => amount > 0)
        .map(([category, amount]) => ({ category, amount }));

      await onSave({
        totalAmount,
        currency,
        categoryBudgets: formattedCategoryBudgets as CategoryBudget[]
      });
      onClose();
    } catch (err) {
      console.error('Error saving budget settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <PieIcon className="text-indigo-400" size={20} />
            Budget Settings
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Total Trip Budget</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <DollarSign size={16} />
                </div>
                <input
                  type="number"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={totalAmount}
                  onChange={e => setTotalAmount(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Base Currency</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="USD" className="bg-slate-900">USD</option>
                <option value="EUR" className="bg-slate-900">EUR</option>
                <option value="GBP" className="bg-slate-900">GBP</option>
                {/* Add more as needed */}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex justify-between">
              Category Allocation
              <span className={`font-normal ${totalAllocated > totalAmount ? 'text-red-400' : 'text-gray-500'}`}>
                {totalAllocated.toLocaleString()} / {totalAmount.toLocaleString()} {currency}
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-xs text-gray-400 flex-1">{cat}</span>
                  <input
                    type="number"
                    className="w-24 bg-black/20 border border-white/10 rounded px-2 py-1 text-right text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    value={categoryBudgets[cat] || 0}
                    onChange={e => handleCategoryChange(cat, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end space-x-3">
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
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetSettings;
