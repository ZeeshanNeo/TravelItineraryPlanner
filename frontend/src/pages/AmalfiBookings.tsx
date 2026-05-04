import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Download, Plane, Hotel, Car, Utensils,
  ChevronRight, MapPin, ShieldCheck,
  MoreVertical, Clock, Info, Loader2, AlertCircle
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { bookingService } from '../services/booking.service';
import type { BookingResponse, BookingSummaryResponse } from '../services/booking.service';
import budgetService from '../services/budget.service';
import type { BudgetSummary } from '../services/budget.service';
import travelDocService from '../services/travelDoc.service';
import type { EmergencyContact, LocalInfoNote } from '../services/travelDoc.service';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';

const AmalfiBookings = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [summary, setSummary] = useState<BookingSummaryResponse | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfoNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      
      const [
        tripData, 
        summaryData, 
        budgetData, 
        bookingsData, 
        contactsData, 
        localInfoData
      ] = await Promise.all([
        tripService.getTrip(id),
        bookingService.getBookingSummary(id),
        budgetService.getSummary(id),
        bookingService.getBookings({ tripId: id }),
        travelDocService.getContacts(id),
        travelDocService.getLocalInfo(id)
      ]);

      setTrip(tripData);
      setSummary(summaryData);
      setBudgetSummary(budgetData);
      setBookings(bookingsData);
      setContacts(contactsData);
      setLocalInfo(localInfoData);
    } catch (err: any) {
      console.error('Error fetching Amalfi bookings data:', err);
      setError(err.message || 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-2xl font-black text-muted-foreground uppercase tracking-widest">Architecting Manifest...</p>
        </div>
      </Layout>
    );
  }

  if (error || !trip) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive mb-4">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter">System Error</h2>
          <p className="text-muted-foreground max-w-md">{error || 'Trip not found.'}</p>
          <button 
            onClick={() => fetchData()}
            className="mt-6 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all"
          >
            Retry Sync
          </button>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Total Bookings', value: summary?.totalBookings || '0', color: 'text-primary' },
    { label: 'Confirmed', value: summary?.confirmedCount || '0', color: 'text-emerald-500' },
    { label: 'Pending Action', value: summary?.pendingCount || '0', color: 'text-amber-500' },
    { label: 'Trip Budget', value: budgetSummary ? `$${(budgetSummary.totalBudget / 1000).toFixed(1)}k` : '$0k', color: 'text-slate-900 dark:text-white' },
  ];

  const airTravel = bookings.filter(b => b.category === 'Flight');
  const accommodations = bookings.filter(b => b.category === 'Accommodation');
  const otherBookings = bookings.filter(b => b.category === 'Transportation' || b.category === 'Activity');

  return (
    <Layout>
      <div className="space-y-12 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-4 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">{trip.title}</span>
               <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                 • {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
               </span>
            </div>
            <h1 className="text-6xl font-black text-foreground tracking-tighter leading-none">Booking Center</h1>
            <p className="text-muted-foreground mt-4 text-xl font-medium max-w-2xl">
              Enterprise-grade reservation management for your upcoming {trip.destination} journey.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button className="h-16 px-8 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20">
                <Download size={20} />
                Export Manifest
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="premium-glass bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">{stat.label}</p>
               <h3 className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Main Content Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 space-y-12">
              {/* Air Travel Segment */}
              <section className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                          <Plane size={24} />
                       </div>
                       <h2 className="text-2xl font-black tracking-tight text-foreground">Air Travel</h2>
                    </div>
                    <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Manage All</button>
                 </div>
                 
                 <div className="space-y-4">
                    {airTravel.length > 0 ? airTravel.map((flight) => (
                       <div key={flight.id} className="premium-glass bg-card p-8 rounded-[2.5rem] border border-border flex items-center justify-between hover:border-primary/30 transition-colors group">
                          <div className="flex items-center gap-12">
                             <div className="text-center">
                                <h4 className="text-3xl font-black text-foreground">{flight.location || 'SFO'}</h4>
                                <p className="text-xs font-bold text-muted-foreground uppercase">
                                  {flight.startDate ? new Date(flight.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                             </div>
                             <div className="flex flex-col items-center gap-1 w-32">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{flight.provider} {flight.confirmationCode}</span>
                                <div className="h-[2px] w-full bg-border relative">
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                                </div>
                             </div>
                             <div className="text-center">
                                <h4 className="text-3xl font-black text-foreground">{flight.address || 'NRT'}</h4>
                                <p className="text-xs font-bold text-muted-foreground uppercase">
                                  {flight.endDate ? new Date(flight.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-1 ${flight.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                   <ShieldCheck size={12} />
                                   {flight.status}
                                </span>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Ref: {flight.confirmationCode || 'N/A'}</p>
                             </div>
                             <button className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground">
                                <ChevronRight size={20} />
                             </button>
                          </div>
                       </div>
                    )) : (
                      <div className="premium-glass bg-card p-8 rounded-[2.5rem] border border-border border-dashed flex items-center justify-center text-muted-foreground">
                        <p className="font-bold uppercase tracking-widest text-xs">No air travel booked yet</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Accommodations Segment */}
              <section className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                       <Hotel size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Accommodations</h2>
                 </div>
                 
                 <div className="space-y-6">
                    {accommodations.length > 0 ? accommodations.map((hotel) => (
                      <div key={hotel.id} className="premium-glass bg-card p-10 rounded-[3rem] border border-border">
                        <div className="flex flex-col md:flex-row gap-10">
                          <div className="w-full md:w-64 h-48 rounded-[2rem] overflow-hidden bg-muted flex items-center justify-center">
                              <Hotel size={48} className="text-muted-foreground/20" />
                          </div>
                          <div className="flex-1 space-y-6">
                              <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-3xl font-black text-foreground mb-1">{hotel.title}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin size={14} />
                                      <span className="text-xs font-bold">{hotel.address || hotel.location}</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${hotel.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                  {hotel.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-8 pt-6 border-t border-border">
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Check-in</p>
                                    <p className="text-sm font-black text-foreground">
                                      {hotel.startDate ? new Date(hotel.startDate).toLocaleDateString() : 'TBD'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Provider</p>
                                    <p className="text-sm font-black text-foreground">{hotel.provider || 'Direct'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Confirmation</p>
                                    <p className="text-sm font-black text-foreground">{hotel.confirmationCode || 'N/A'}</p>
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="premium-glass bg-card p-10 rounded-[3rem] border border-border border-dashed flex items-center justify-center text-muted-foreground">
                        <p className="font-bold uppercase tracking-widest text-xs">No accommodations reserved yet</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* Ground & Activities */}
              <section className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
                       <Car size={24} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Ground & Activities</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {otherBookings.length > 0 ? otherBookings.map((booking) => (
                      <div key={booking.id} className="premium-glass bg-card p-8 rounded-[2.5rem] border border-border space-y-4">
                        <div className="flex justify-between items-start">
                            <div className={`w-10 h-10 bg-muted rounded-xl flex items-center justify-center ${booking.category === 'Transportation' ? 'text-indigo-500' : 'text-orange-500'}`}>
                              {booking.category === 'Transportation' ? <Car size={18} /> : <Utensils size={18} />}
                            </div>
                            <button className="text-muted-foreground hover:text-foreground"><MoreVertical size={16} /></button>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-foreground">{booking.title}</h4>
                            <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-2">{booking.description || 'Enterprise reservation confirmed.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <Clock size={12} />
                              {booking.startDate ? new Date(booking.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${booking.status === 'Confirmed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {booking.status}
                            </span>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 premium-glass bg-card p-8 rounded-[2.5rem] border border-border border-dashed flex items-center justify-center text-muted-foreground">
                        <p className="font-bold uppercase tracking-widest text-xs">No activities or transport booked</p>
                      </div>
                    )}
                 </div>
              </section>
           </div>

           {/* Sidebar Matrix */}
           <div className="lg:col-span-4 space-y-8">
              <div className="premium-glass bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight">Policy Center</h3>
                 <div className="space-y-6">
                    {localInfo.length > 0 ? localInfo.slice(0, 3).map((info) => (
                      <div key={info.id} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                            <Info size={18} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{info.category}</p>
                            <p className="text-sm font-bold line-clamp-2">{info.title}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex items-start gap-4 opacity-50">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                            <Info size={18} />
                        </div>
                        <p className="text-sm font-bold italic">Standard corporate policies apply.</p>
                      </div>
                    )}
                 </div>
                 <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-colors">
                    Review Trip Assurance
                 </button>
              </div>

              <div className="premium-glass bg-card p-10 rounded-[3rem] border border-border space-y-8">
                 <h3 className="text-2xl font-black tracking-tight text-foreground">Duty of Care</h3>
                 <div className="space-y-4">
                    {contacts.length > 0 ? contacts.map((contact) => (
                      <div key={contact.id} className="p-6 bg-muted rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{contact.relationship}</p>
                        <p className="text-sm font-black text-foreground">{contact.name}</p>
                        <p className="text-sm font-bold text-primary">{contact.phoneNumber}</p>
                      </div>
                    )) : (
                      <div className="p-6 bg-muted rounded-2xl">
                        <p className="text-sm font-black text-muted-foreground">Emergency Concierge: 1-800-VOYAGER</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default AmalfiBookings;
