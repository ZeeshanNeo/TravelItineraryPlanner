import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import budgetService from '../../services/budget.service';
import type { BudgetSummary } from '../../services/budget.service';

interface BudgetOverviewProps {
  tripId: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ tripId }) => {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const summaryData = await budgetService.getSummary(tripId);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Loading budget...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const chartData = summary?.categorySummaries
    .filter(cs => cs.spentAmount > 0)
    .map(cs => ({
      name: cs.category,
      value: cs.spentAmount
    })) || [];

  const barData = summary?.categorySummaries.map(cs => ({
    name: cs.category,
    budgeted: cs.budgetedAmount,
    spent: cs.spentAmount
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Budget</p>
            <h3 className="text-2xl font-bold text-white">
              {(summary?.totalBudget ?? 0).toLocaleString()} {summary?.currency}
            </h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Spent</p>
            <h3 className="text-2xl font-bold text-white">
              {(summary?.totalSpent ?? 0).toLocaleString()} {summary?.currency}
            </h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${(summary?.remainingBudget ?? 0) < 0 ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-white/60">Remaining</p>
            <h3 className={`text-2xl font-bold ${((summary?.remainingBudget ?? 0) < 0) ? 'text-red-400' : 'text-white'}`}>
              {(summary?.remainingBudget ?? 0).toLocaleString()} {summary?.currency}
            </h3>
          </div>
        </div>
      </div>

      {/* Currency Intelligence Hint */}
      <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <DollarSign size={20} />
          </div>
          <div>
            <h4 className="font-black text-white text-lg leading-tight">Currency Intelligence</h4>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Real-time Exchange Accuracy</p>
          </div>
        </div>
        <p className="text-sm text-indigo-200/60 font-medium max-w-md">
          Expenses are automatically normalized to <span className="text-white font-black">{summary?.currency}</span> using mission-critical conversion data for precise fiscal reporting.
        </p>
        <button className="px-6 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/10">
          Update Rates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-white mb-6">Spending by Category</h4>
          <div className="w-full">
            <ResponsiveContainer width="100%" aspect={1.6}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-white mb-6">Budget vs Actual</h4>
          <div className="w-full">
            <ResponsiveContainer width="100%" aspect={1.6}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="budgeted" fill="rgba(99, 102, 241, 0.5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h4 className="text-lg font-semibold text-white">Category Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/10 text-xs uppercase tracking-wider text-white/60">
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Budgeted</th>
                <th className="px-6 py-3 font-medium">Spent</th>
                <th className="px-6 py-3 font-medium">Progress</th>
                <th className="px-6 py-3 font-medium">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summary?.categorySummaries.map((cat, index) => (
                <tr key={cat.category} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-200 font-medium">{cat.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {(cat.budgetedAmount ?? 0).toLocaleString()} {summary.currency}
                  </td>
                  <td className="px-6 py-4 text-gray-200 font-medium">
                    {(cat.spentAmount ?? 0).toLocaleString()} {summary.currency}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${cat.percentageSpent > 100 ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(cat.percentageSpent, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">{Math.round(cat.percentageSpent)}% spent</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={(cat.remainingAmount ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'}>
                      {(cat.remainingAmount ?? 0).toLocaleString()} {summary.currency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
