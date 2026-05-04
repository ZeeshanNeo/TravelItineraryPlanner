import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowRight, User, TrendingUp } from 'lucide-react';
import collaborationService from '../../services/collaboration.service';

interface SharedExpensesProps {
  tripId: string;
}

interface Balance {
  userId: string;
  userName: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

const SharedExpenses: React.FC<SharedExpensesProps> = ({ tripId }) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, [tripId]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const data = await collaborationService.getBalances(tripId);
      // Data might be an object with a 'balances' array or just the array
      setBalances(data.balances || data);
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white/50 animate-pulse text-center py-12">Calculating balances...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-emerald-400" size={24} />
            Shared Expenses
          </h3>
          <p className="text-gray-400 mt-1 font-medium">Track who owes what in your travel group</p>
        </div>
        <button 
          onClick={fetchBalances}
          className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {balances.map(balance => (
          <div key={balance.userId} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 glass-effect group hover:border-white/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                {balance.userName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{balance.userName}</h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Travel Partner</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-lg font-bold text-white">${balance.totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Owed</p>
                <p className="text-lg font-bold text-white">${balance.totalOwed.toLocaleString()}</p>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-2xl border ${balance.netBalance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-300">Net Balance</p>
                <p className={`text-xl font-black ${balance.netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {balance.netBalance >= 0 ? '+' : ''}${balance.netBalance.toLocaleString()}
                </p>
              </div>
            </div>

            {balance.netBalance < 0 && (
              <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]">
                Settle Debt
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        ))}
        {balances.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem]">
            <User className="mx-auto text-white/10 mb-4" size={64} />
            <p className="text-white/40 font-bold">No expense data yet. Start splitting bills!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedExpenses;
