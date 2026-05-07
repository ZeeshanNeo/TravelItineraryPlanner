import React, { useState, useEffect } from 'react';
import { DollarSign, User } from 'lucide-react';
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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balancesData, expensesData] = await Promise.all([
        collaborationService.getBalances(tripId),
        collaborationService.getSplits(tripId) // Using splits as a proxy for shared expenses
      ]);
      
      let finalBalances = [];
      if (balancesData && Array.isArray(balancesData.balances)) {
        finalBalances = balancesData.balances;
      } else if (Array.isArray(balancesData)) {
        finalBalances = balancesData;
      }
      
      setBalances(finalBalances);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err) {
      console.error('Error fetching shared data:', err);
      setBalances([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white/50 animate-pulse text-center py-12 font-black uppercase tracking-widest text-xs">Syncing Ledger...</div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-white flex items-center gap-4 tracking-tight">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign className="text-emerald-400" size={28} />
            </div>
            Treasury Console
          </h3>
          <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px] opacity-60">Manage collaborative funds & peer-to-peer splits</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
          >
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-emerald-500/20"
          >
            Add Group Expense
          </button>
        </div>
      </div>

      {/* Peer-to-Peer Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {balances.map((balance) => (
          <div key={balance.userId} className="premium-glass bg-white/5 border border-white/10 rounded-[2.5rem] p-8 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20">
                {balance.userName?.charAt(0) || <User />}
              </div>
              <div>
                <h4 className="text-xl font-black text-white tracking-tight">{balance.userName || 'Voyager'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Active Partner</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 opacity-60">Contribution</p>
                <p className="text-xl font-black text-white tracking-tight">${balance.totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 opacity-60">Obligation</p>
                <p className="text-xl font-black text-white tracking-tight">${balance.totalOwed.toLocaleString()}</p>
              </div>
            </div>

            <div className={`p-6 rounded-3xl border transition-colors ${balance.netBalance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Net Status</span>
                <p className={`text-2xl font-black ${balance.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {balance.netBalance >= 0 ? '+' : ''}${balance.netBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Ledger Section */}
      <div className="mt-12 bg-white/5 rounded-[3rem] border border-white/10 p-8 md:p-12 overflow-hidden relative">
         <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-white uppercase tracking-[0.2em]">Shared Ledger</h4>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-full">
               {expenses.length} Total Entries
            </span>
         </div>

         {expenses.length > 0 ? (
           <div className="space-y-4">
              {expenses.map((expense, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                         <DollarSign size={20} />
                      </div>
                      <div>
                         <p className="text-white font-black tracking-tight">{expense.description || 'General Group Split'}</p>
                         <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Split among {expense.splits?.length || 0} members</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-white">${expense.amount?.toLocaleString() || '0'}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Settled</p>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                 <DollarSign size={40} className="text-white" />
              </div>
              <p className="text-white/40 font-black uppercase tracking-widest text-xs">No ledger entries detected</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-6 text-emerald-400 font-black uppercase tracking-widest text-[10px] hover:underline"
              >
                Create First Entry +
              </button>
           </div>
         )}
      </div>

      {/* Simple Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl">
              <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-widest">New Group Expense</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Amount ($)</label>
                    <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:border-emerald-500/50" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 block">Description</label>
                    <input type="text" placeholder="Dinner, Taxi, etc." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:border-emerald-500/50" />
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                    <button 
                      onClick={() => {
                        // In a real app, this would call collaborationService.splitExpense
                        setShowAddModal(false);
                        fetchData();
                      }}
                      className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    >
                      Save & Split
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SharedExpenses;
