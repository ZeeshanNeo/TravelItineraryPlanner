import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Plus, 
  MoreVertical, Calendar,
  Filter, Search, Download,
  Sparkles, Layers, History, Clock, ChevronRight
} from 'lucide-react';
import Button from '../components/shared/Button';
import Layout from '../components/layout/Layout';
import itineraryService from '../services/itinerary.service';
import type { ItineraryResponse } from '../services/itinerary.service';
import { useSearch } from '../context/SearchContext';

const Itinerary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [itineraries, setItineraries] = useState<ItineraryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const data = await itineraryService.getItineraries(false);
      setItineraries(data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItineraryStatus = (itinerary: ItineraryResponse) => {
    if (itinerary.isArchived) return 'archived';
    if (!itinerary.isPublic) return 'draft';
    const now = new Date();
    const startDate = new Date(itinerary.startDate);
    const endDate = new Date(itinerary.endDate);
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getTotalActivities = (itinerary: ItineraryResponse) => {
    return itinerary.days?.reduce((total, day) => total + (day.activities?.length || 0), 0) || 0;
  };

  const getTotalCost = (itinerary: ItineraryResponse) => {
    const total = itinerary.days?.reduce((total, day) => {
      return total + (day.activities?.reduce((dayTotal, activity) => dayTotal + (activity.cost || 0), 0) || 0);
    }, 0) || 0;
    return total.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const filteredItineraries = itineraries.filter(itinerary => {
    const status = getItineraryStatus(itinerary);
    if (activeTab !== 'all' && status !== activeTab) return false;
    const effectiveQuery = searchQuery || localSearchQuery;
    if (effectiveQuery) {
      const query = effectiveQuery.toLowerCase();
      return (
        itinerary.title.toLowerCase().includes(query) ||
        itinerary.description?.toLowerCase().includes(query) ||
        itinerary.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="space-y-12 pb-24 px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <div className="w-12 h-1 bg-primary mb-6"></div>
              <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">Collections</h1>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 rounded-[3rem] h-[500px]"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-16 pb-24 px-6 md:px-10 animate-fade-in">
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6">
               <Layers size={16} className="text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Vault / Itineraries</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter leading-none">Your Collections</h1>
            <p className="text-muted-foreground mt-6 text-xl font-medium max-w-xl">Curated travel intelligence and elite planning for your global journeys.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-16 px-8 rounded-2xl border-border text-foreground font-bold text-sm uppercase tracking-widest hover:bg-muted transition-all active:scale-95">
              <Download className="w-5 h-5 mr-3" />
              Export
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/plan-trip')}
              className="h-16 px-10 rounded-2xl shadow-2xl shadow-primary/30 flex items-center text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 mr-3" />
              Initialize New
            </Button>
          </div>
        </div>

        {/* Sophisticated Search & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 flex p-2 bg-muted dark:bg-slate-900/50 rounded-[2rem] border border-border/50 dark:border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', icon: Layers, label: 'All Projects' },
              { id: 'upcoming', icon: Sparkles, label: 'Upcoming' },
              { id: 'draft', icon: History, label: 'Drafts' },
              { id: 'completed', icon: Clock, label: 'History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-card text-slate-950 shadow-lg ring-1 ring-slate-100' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/40'
                }`}
              >
                <tab.icon size={14} className={activeTab === tab.id ? 'text-primary' : 'text-slate-300'} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-5 flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery || localSearchQuery}
                onChange={(e) => searchQuery ? null : setLocalSearchQuery(e.target.value)}
                readOnly={!!searchQuery}
                className={`w-full pl-16 pr-6 py-5 bg-card border border-border rounded-[1.5rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm ${searchQuery ? 'opacity-50' : ''}`}
              />
            </div>
            <button className="p-5 rounded-[1.5rem] bg-card border border-border text-muted-foreground hover:text-foreground hover:shadow-md transition-all active:scale-95">
              <Filter className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cinematic Grid */}
        {filteredItineraries.length === 0 ? (
          <div className="bg-muted dark:bg-slate-900/30 rounded-[4rem] py-32 text-center border-2 border-dashed border-border dark:border-slate-800">
            <div className="w-24 h-24 bg-card dark:bg-slate-800 rounded-[2.5rem] shadow-sm flex items-center justify-center mx-auto mb-10">
              <Layers className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-foreground dark:text-white mb-4 tracking-tight">No active projects</h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">
              Start your next adventure by creating a premium travel itinerary.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/plan-trip')}
              className="rounded-2xl px-12 py-5 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
            >
              Initialize First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredItineraries.map((itinerary) => {
              const status = getItineraryStatus(itinerary);
              const totalActivities = getTotalActivities(itinerary);
              const totalCost = getTotalCost(itinerary);
              
              return (
                <div 
                  key={itinerary.id} 
                  onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                  className="group enterprise-surface bg-card dark:bg-slate-900/50 rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-border dark:border-white/5 cursor-pointer flex flex-col h-full motion-card-enter"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=800&sig=${itinerary.id}`} 
                      alt={itinerary.title} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                    
                    <div className="absolute top-8 left-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-xl ${
                        status === 'upcoming' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : status === 'draft'
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : status === 'active'
                          ? 'bg-primary/20 text-blue-400 border-primary/30'
                          : 'bg-muted0/20 text-slate-300 border-slate-500/30'
                      }`}>
                        {status}
                      </span>
                    </div>
                    
                    <button 
                      className="absolute top-8 right-8 w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-card hover:text-foreground transition-all shadow-lg flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex items-center text-white/80 text-[10px] font-black uppercase tracking-widest mb-3">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
                        {formatDateRange(itinerary.startDate, itinerary.endDate)}
                      </div>
                      <h3 className="text-3xl font-black text-white leading-tight tracking-tight">{itinerary.title}</h3>
                    </div>
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted dark:bg-slate-800 flex items-center justify-center">
                           <MapPin size={18} className="text-muted-foreground enterprise-icon" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Scope</p>
                          <p className="text-sm font-bold text-muted-foreground dark:text-slate-300">
                            {itinerary.totalDays} Days / {totalActivities} Events
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50 dark:border-white/5">
                      <div>
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Financial Target</p>
                        <p className="text-2xl font-black text-foreground dark:text-white">{totalCost}</p>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                        Launch Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Itinerary;
