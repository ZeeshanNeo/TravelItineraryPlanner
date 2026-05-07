import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Calendar, 
  Archive, ArchiveRestore, Trash2, 
  Edit3
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';
import EditTripModal from '../components/trips/EditTripModal';
import { useSearch } from '../context/SearchContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'archived'>('active');
  const [editingTrip, setEditingTrip] = useState<TripResponse | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tripsData, statsData] = await Promise.all([
        tripService.getTrips(filter === 'archived'),
        tripService.getStatistics()
      ]);
      
      let filtered = tripsData;
      if (filter === 'archived') {
        filtered = tripsData.filter(t => t.isArchived);
      } else if (filter === 'active') {
        filtered = tripsData.filter(t => !t.isArchived);
      } else if (filter === 'upcoming') {
        filtered = tripsData.filter(t => !t.isArchived && new Date(t.startDate) > new Date());
      }
      setTrips(filtered);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = trips.filter(t => 
        t.destination.toLowerCase().includes(query) || 
        t.title?.toLowerCase().includes(query) ||
        t.travelType?.toLowerCase().includes(query)
      );
      setFilteredTrips(filtered);
    } else {
      setFilteredTrips(trips);
    }
  }, [searchQuery, trips]);

  const handleArchive = async (id: string, currentlyArchived: boolean) => {
    try {
      await tripService.archiveTrip(id, !currentlyArchived);
      fetchData();
    } catch (error) {
      console.error('Failed to archive trip', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this journey? This action cannot be undone.')) {
      try {
        await tripService.deleteTrip(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete trip', error);
      }
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in-up space-y-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">My Journeys</h1>
            <p className="text-slate-500 text-lg font-medium">Manage your global explorations and team itineraries.</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
            {['active', 'upcoming', 'archived'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[420px] rounded-4xl bg-white/50 animate-pulse skeleton-shimmer border border-white/50"></div>
            ))}
          </div>
        ) : filteredTrips.length === 0 && !searchQuery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {/* Plan Your Next Trip Card */}
            <div 
              onClick={() => navigate('/plan-trip')}
              className="group enterprise-surface cursor-pointer rounded-[2.5rem] border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center justify-center p-12 text-center h-[520px]"
            >
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Plus className="text-blue-600 w-10 h-10 enterprise-icon" />
              </div>
              <h3 className="text-2xl font-black text-blue-700 mb-4">Plan Your Next Trip</h3>
              <p className="text-blue-500 font-medium max-w-[200px]">Start a new itinerary or invite collaborators.</p>
            </div>
          </div>
        ) : filteredTrips.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-4xl border border-slate-100 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No results match</h3>
            <p className="text-slate-500 font-medium px-6">Nothing found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {/* Plan Your Next Trip Card */}
            <div 
              onClick={() => navigate('/plan-trip')}
              className="group enterprise-surface cursor-pointer rounded-[2.5rem] border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center justify-center p-12 text-center h-[520px]"
            >
              <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Plus className="text-blue-600 w-10 h-10 enterprise-icon" />
              </div>
              <h3 className="text-2xl font-black text-blue-700 mb-4">Plan Your Next Trip</h3>
              <p className="text-blue-500 font-medium max-w-[200px]">Start a new itinerary or invite collaborators.</p>
            </div>

            {filteredTrips.map((trip, idx) => (
              <div 
                key={trip.id} 
                className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col group enterprise-surface border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] motion-card-enter"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={trip.destination} 
                    src={`https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&q=80&sig=${trip.id}`}
                  />
                  
                  <div className="absolute top-6 left-6">
                    <div className="bg-white/95 backdrop-blur-md text-blue-600 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      {trip.isArchived ? 'ARCHIVED' : 'CONFIRMED'}
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button onClick={(e) => { e.stopPropagation(); setEditingTrip(trip); }} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90">
                      <Edit3 size={18} className="enterprise-icon" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleArchive(trip.id, trip.isArchived); }} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90">
                      {trip.isArchived ? <ArchiveRestore size={18} className="enterprise-icon" /> : <Archive size={18} className="enterprise-icon" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }} className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90">
                      <Trash2 size={18} className="enterprise-icon" />
                    </button>
                  </div>
                </div>

                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 mb-2 truncate">
                    {trip.title || trip.destination}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400 mb-10 font-bold text-sm">
                    <Calendar size={16} className="text-slate-300" />
                    <span>{new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="mt-auto space-y-8">
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">
                        <span>Booking Completion</span>
                        <span>{trip.travelType === 'Business' ? '85%' : '30%'}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: trip.travelType === 'Business' ? '85%' : '30%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].slice(0, (trip.travelCompanions?.length || 0) + 1).map(p => (
                          <div key={p} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?u=${trip.id}${p}`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {(trip.travelCompanions?.length || 0) > 2 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                            +{(trip.travelCompanions?.length || 0) - 2}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/trip/${trip.id}`)} 
                        className="text-blue-600 font-black text-sm hover:underline"
                      >
                        Enter Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-slate-100">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm enterprise-surface">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Total Trips</p>
              <p className="text-5xl font-black text-blue-600">{stats?.totalTrips || trips.length}</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm enterprise-surface">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Countries Visited</p>
              <p className="text-5xl font-black text-blue-600">{stats?.countriesVisited || '0'}</p>
           </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm enterprise-surface">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Travel Days</p>
               <p className="text-5xl font-black text-blue-600">{stats?.totalTravelDays || '0'}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm enterprise-surface">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Exp. Savings</p>
               <p className="text-5xl font-black text-blue-600">
                 ${stats ? (stats.totalBudget >= 1000 ? (stats.totalBudget / 1000).toFixed(1) + 'k' : stats.totalBudget.toFixed(0)) : '0.0'}
               </p>
            </div>
        </div>

        {editingTrip && (
          <EditTripModal 
            trip={editingTrip} 
            onClose={() => setEditingTrip(null)} 
            onSuccess={() => {
              setEditingTrip(null);
              fetchData();
            }} 
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
