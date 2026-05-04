import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Filter, Download, ChevronDown, Wallet, TrendingUp, PieChart
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import BudgetModule from '../components/budget/BudgetModule';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';

const Expenses = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      setSelectedTripId(tripId);
      setIsLoading(false);
    } else {
      fetchTrips();
    }
  }, [tripId]);

  const fetchTrips = async () => {
    try {
      const data = await tripService.getTrips(false);
      setTrips(data);
      if (data.length > 0) {
        setSelectedTripId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch trips', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12 pb-24 px-6 md:px-10 animate-fade-in">
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
               <Wallet size={16} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Ledger / Treasury</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-none">
              {tripId ? 'Trip Ledger' : 'Financial Control'}
            </h1>
            <p className="text-muted-foreground mt-6 text-xl font-medium max-w-xl">
              {tripId ? 'Comprehensive fiscal oversight for your current workspace.' : 'Execute comprehensive fiscal oversight and cost analysis for your premium journeys.'}
            </p>
          </div>
          
          {!tripId && (
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Filter size={18} />
                </div>
                <select
                  className="appearance-none bg-card border border-border rounded-2xl pl-14 pr-12 py-4 text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer shadow-sm min-w-[240px]"
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                >
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.title || trip.destination}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-muted-foreground">
                  <ChevronDown size={18} />
                </div>
              </div>
              
              <button className="flex items-center gap-3 px-8 py-4 bg-card border border-border rounded-2xl text-sm font-bold text-foreground hover:bg-muted transition-all shadow-sm active:scale-95">
                <Download size={20} className="text-primary" />
                Download Audit
              </button>
            </div>
          )}
          {tripId && (
            <button className="flex items-center gap-3 px-8 py-4 bg-card border border-border rounded-2xl text-sm font-bold text-foreground hover:bg-muted transition-all shadow-sm active:scale-95">
              <Download size={20} className="text-primary" />
              Download Trip Audit
            </button>
          )}
        </div>

        {/* Intelligence Quick Stats (Optional but premium) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                 <TrendingUp size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Efficiency</p>
                 <p className="text-2xl font-black text-foreground">Elite Target</p>
              </div>
           </div>
           <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                 <PieChart size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Allocation</p>
                 <p className="text-2xl font-black text-foreground">Optimized</p>
              </div>
           </div>
           <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/5 flex items-center justify-center text-orange-500">
                 <Wallet size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                 <p className="text-2xl font-black text-foreground">In Control</p>
              </div>
           </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-96 gap-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">Synchronizing Ledger...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-32 bg-muted dark:bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-border dark:border-slate-800">
            <h3 className="text-3xl font-black text-foreground dark:text-white mb-4">No active fiscal accounts</h3>
            <p className="text-muted-foreground max-w-md mx-auto">Initialize a trip to start tracking advanced financial metrics.</p>
          </div>
        ) : (
          <div className="premium-glass-dark rounded-[3.5rem] p-10 md:p-16 border border-white/5 overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
             {/* Abstract background element */}
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
             <BudgetModule tripId={selectedTripId} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Expenses;
