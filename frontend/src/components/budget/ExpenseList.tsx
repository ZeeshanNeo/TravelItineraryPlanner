import React from 'react';
import type { Expense } from '../../services/expense.service';
import { Trash2, Edit3, ExternalLink, DollarSign } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  Transportation: '🚗',
  Accommodation: '🏨',
  Food: '🍴',
  Activities: '🎟️',
  Shopping: '🛍️',
  Insurance: '🛡️',
  Miscellaneous: '📦'
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete }) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h4 className="text-lg font-semibold text-white">Recent Expenses</h4>
      </div>
      <div className="divide-y divide-white/5">
        {expenses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No expenses logged yet.</div>
        ) : (
          expenses.map(expense => (
            <div key={expense.id} className="p-4 hover:bg-white/5 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                    {CATEGORY_ICONS[expense.category] || '💰'}
                  </div>
                  <div>
                    <h5 className="text-white font-medium group-hover:text-indigo-400 transition-colors">
                      {expense.title}
                    </h5>
                    <div className="flex items-center text-xs text-white/50 mt-1 space-x-2">
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{expense.category}</span>
                      {expense.bookingId && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-indigo-400/80">
                            Linked to Booking <ExternalLink size={10} />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {expense.amount.toLocaleString()} {expense.currency}
                    </p>
                    {expense.currency !== 'USD' && (
                      <p className="text-[10px] text-white/50 flex items-center justify-end gap-1">
                        ≈ {expense.amountInBaseCurrency.toLocaleString()} USD
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(expense)}
                       className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                      title="Edit Expense"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => console.log('Split expense', expense.id)}
                       className="p-2 hover:bg-emerald-500/10 rounded-lg text-white/40 hover:text-emerald-400 transition-all"
                      title="Split Bill"
                    >
                      <DollarSign size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                       className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-all"
                      title="Delete Expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
