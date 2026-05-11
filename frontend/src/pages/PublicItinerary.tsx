import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Clock, 
  Download, Info, Navigation
} from 'lucide-react';
import itineraryService from '../services/itinerary.service';
import type { ItineraryResponse } from '../services/itinerary.service';
import Timeline from '../components/itinerary/Timeline';
import Button from '../components/shared/Button';

const PublicItinerary: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);

  useEffect(() => {
    const fetchItinerary = async () => {
      if (!token) return;
      try {
        const data = await itineraryService.getPublicItinerary(token);
        setItinerary(data);
        if (data.days && data.days.length > 0) {
          setActiveDay(data.days[0].dayNumber);
        }
      } catch (err) {
        console.error('Failed to load public itinerary:', err);
        setError('Itinerary not found or link has expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Synchronizing Journey...</p>
      </div>
    </div>
  );

  if (error || !itinerary) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center p-10 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <Info size={32} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Access Denied</h2>
        <p className="text-slate-500 font-bold mb-8">{error || 'This itinerary link is no longer valid.'}</p>
        <Link to="/login">
          <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs">Return to Base</Button>
        </Link>
      </div>
    </div>
  );

  const scheduleDays = itinerary.days || [];
  const currentDayData = scheduleDays.find(d => d.dayNumber === activeDay);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Cinematic Header */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=2000`} 
          alt="Destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
             <div>
                <div className="flex items-center gap-2 mb-4">
                   <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Shared Itinerary</div>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
                  {itinerary.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-white/80">
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <MapPin size={16} className="text-primary" />
                      <span className="text-sm font-bold">Trip View</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <Clock size={16} className="text-primary" />
                      <span className="text-sm font-bold">
                        {itinerary.days?.length} Days Planned
                      </span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.print()}
                  className="h-16 px-8 bg-white text-slate-900 rounded-2xl flex items-center gap-3 transition-all active:scale-95 font-black uppercase tracking-widest text-xs shadow-2xl"
                >
                   <Download size={20} />
                   <span>Download PDF</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-14 pb-24 -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
              {scheduleDays.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`shrink-0 h-16 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-1 border-2 ${
                    activeDay === day.dayNumber
                      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="opacity-60">Day</span>
                  <span className="text-lg leading-none">{day.dayNumber}</span>
                </button>
              ))}
            </div>

            {currentDayData ? (
              <div className="space-y-8 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Day {currentDayData.dayNumber} Experience</h2>
                    <p className="text-sm text-muted-foreground font-bold mt-1">
                      {new Date(currentDayData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-[2.5rem] p-4 md:p-8 border border-border shadow-sm">
                  <Timeline 
                    activities={currentDayData.activities} 
                    onActivityEdit={() => {}} // Read only
                    onActivityDelete={() => {}} // Read only
                    onAddActivity={() => {}} // Read only
                    dayTitle={`Day ${currentDayData.dayNumber}`}
                    date={currentDayData.date}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-[2.5rem] p-20 text-center border-2 border-dashed border-border">
                <p className="text-muted-foreground font-black text-sm uppercase tracking-widest">No activities planned for this day.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5">
              <h3 className="text-xl font-black mb-8 tracking-tight uppercase tracking-[0.2em] text-primary">Travel Policy</h3>
              <p className="text-white/60 font-medium leading-relaxed mb-8">
                This is a shared read-only view of a travel itinerary. 
                Log in to the main platform to create your own journeys.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10 text-white hover:bg-white/5">
                  Sign Up for Free
                </Button>
              </Link>
            </div>

            <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Navigation size={20} className="text-primary" />
                <h4 className="font-black text-foreground uppercase tracking-widest text-xs">Trip Summary</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Days</span>
                   <span className="font-bold text-foreground">{itinerary.days?.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Activities</span>
                   <span className="font-bold text-foreground">
                     {itinerary.days?.reduce((acc, day) => acc + (day.activities?.length || 0), 0)}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Overlay for watermarking */}
      <div className="hidden print:block fixed bottom-8 left-0 right-0 text-center text-slate-400 text-[8px] font-black uppercase tracking-widest">
        Generated by Voyager Travel Planner • voyager.app
      </div>
    </div>
  );
};

export default PublicItinerary;
