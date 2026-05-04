import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { 
  Calendar, MapPin, Clock, ArrowLeft, 
  Star, Share2, List, CreditCard, FileText, Camera as CameraIcon, Users,
  Settings, Download, Sparkles
} from 'lucide-react';
import Button from '../components/shared/Button';
import { tripService } from '../services/trip.service';
import itineraryService, { ActivityType } from '../services/itinerary.service';
import type { TripResponse } from '../services/trip.service';
import type { ActivityResponse, ItineraryResponse, ItineraryDayResponse } from '../services/itinerary.service';
import Timeline from '../components/itinerary/Timeline';

// Lazy loaded modules for performance
const BudgetModule = lazy(() => import('../components/budget/BudgetModule'));
const TravelDocModule = lazy(() => import('../components/travelDocs/TravelDocModule'));
const MemoryGalleryModule = lazy(() => import('../components/memories/MemoryGalleryModule'));
const CollaborationModule = lazy(() => import('../components/collaboration/CollaborationModule'));

const ItineraryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'documentation' | 'memories' | 'collaboration'>('schedule');
  const [activeDay, setActiveDay] = useState(1);
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityResponse | null>(null);
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    activityType: 'Sightseeing',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    address: '',
    cost: '',
    currency: 'USD',
    notes: '',
    isFlexible: false,
    bookingReference: '',
    contactInfo: ''
  });

  useEffect(() => {
    if (id) {
      fetchTripAndItineraries();
    }
  }, [id]);

  const fetchTripAndItineraries = async () => {
    setLoading(true);
    try {
      const tripData = await tripService.getTrip(id!);
      setTrip(tripData);
      
      let itins = await itineraryService.getItinerariesByTrip(id!);
      
      if (itins.length === 0 && tripData) {
        // Auto-create initial itinerary if missing
        const newItin = await itineraryService.createItinerary({
          tripId: tripData.id,
          title: `${tripData.title || tripData.destination} Main Itinerary`,
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          isPublic: false
        });
        itins = [newItin];
      }
      
      setItineraries(itins);
    } catch (err) {
      console.error('Failed to load itinerary data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshItineraries = async () => {
    if (!id) return;
    const itineraryData = await itineraryService.getItinerariesByTrip(id);
    setItineraries(itineraryData);
  };

  const createInitialDays = async (itinId: string) => {
    if (!trip) return;
    try {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 1; i <= Math.min(diffDays, 14); i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + (i - 1));
        await itineraryService.createItineraryDay({
          itineraryId: itinId,
          dayNumber: i,
          date: date.toISOString(),
          title: `Day ${i}`
        });
      }
      await refreshItineraries();
    } catch (err) {
      console.error('Failed to create initial days:', err);
    }
  };

  useEffect(() => {
    if (itineraries.length > 0 && (!itineraries[0].days || itineraries[0].days.length === 0)) {
      createInitialDays(itineraries[0].id);
    }
  }, [itineraries, trip]);

  if (loading) return <Layout><div className="flex justify-center p-20 animate-pulse text-primary font-bold">Initializing journey...</div></Layout>;
  if (!trip) return <Layout><div className="p-20 text-center text-muted-foreground font-bold">Journey details not found</div></Layout>;

  const activeItinerary = itineraries[0];
  const scheduleDays = activeItinerary?.days || [];
  const currentDayData = scheduleDays.find((d: ItineraryDayResponse) => d.dayNumber === activeDay);

  const toTimeInput = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '09:00';
    return date.toTimeString().slice(0, 5);
  };

  const buildActivityDate = (time: string) => {
    const baseDate = currentDayData?.date ? new Date(currentDayData.date) : new Date();
    const [hours, minutes] = time.split(':').map(Number);
    baseDate.setHours(hours || 0, minutes || 0, 0, 0);
    return baseDate.toISOString();
  };

  const openCreateActivityModal = () => {
    if (!currentDayData) {
      if (scheduleDays.length > 0) {
        setActiveDay(scheduleDays[0].dayNumber);
      } else {
        console.warn('Cannot add activity: No day selected or schedule empty.');
        return;
      }
    }
    setEditingActivity(null);
    setActivityError(null);
    setActivityForm({
      title: '',
      description: '',
      activityType: 'Sightseeing',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      address: '',
      cost: '',
      currency: 'USD',
      notes: '',
      isFlexible: false,
      bookingReference: '',
      contactInfo: ''
    });
    setActivityModalOpen(true);
  };

  const openEditActivityModal = (activity: ActivityResponse) => {
    setEditingActivity(activity);
    setActivityError(null);
    setActivityForm({
      title: activity.title,
      description: activity.description || '',
      activityType: activity.activityType,
      startTime: toTimeInput(activity.startTime),
      endTime: toTimeInput(activity.endTime),
      location: activity.location || '',
      address: activity.address || '',
      cost: activity.cost?.toString() || '',
      currency: activity.currency || 'USD',
      notes: activity.notes || '',
      isFlexible: activity.isFlexible,
      bookingReference: activity.bookingReference || '',
      contactInfo: activity.contactInfo || ''
    });
    setActivityModalOpen(true);
  };

  const saveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDayData) return;
    
    setActivitySaving(true);
    setActivityError(null);
    
    try {
      const typeKey = activityForm.activityType as keyof typeof ActivityType;
      const payload: any = {
        itineraryDayId: currentDayData.id,
        title: activityForm.title,
        description: activityForm.description,
        activityType: ActivityType[typeKey],
        startTime: buildActivityDate(activityForm.startTime),
        endTime: buildActivityDate(activityForm.endTime),
        location: activityForm.location,
        address: activityForm.address,
        cost: activityForm.cost ? parseFloat(activityForm.cost) : 0,
        currency: activityForm.currency,
        notes: activityForm.notes,
        isFlexible: activityForm.isFlexible,
        bookingReference: activityForm.bookingReference,
        contactInfo: activityForm.contactInfo,
        order: editingActivity ? editingActivity.order : currentDayData.activities.length
      };

      if (editingActivity) {
        await itineraryService.updateActivity(editingActivity.id, payload);
      } else {
        await itineraryService.createActivity(payload);
      }
      
      await refreshItineraries();
      setActivityModalOpen(false);
    } catch (err: any) {
      setActivityError(err.response?.data?.message || 'Failed to save experience. Verify details and try again.');
    } finally {
      setActivitySaving(false);
    }
  };

  return (
    <Layout>
      <div className="pb-24">
        {/* Cinematic Header Area */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=2000`} 
            alt="Destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-14">
            <Link to="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Back to Control Center</span>
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div>
                  <div className="flex items-center gap-2 mb-4">
                     <Calendar size={18} className="text-primary" />
                     <span className="text-sm font-black uppercase tracking-[0.4em] text-white/60">Operational Window</span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                    {trip.title || trip.destination}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-white/80">
                     <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                        <MapPin size={16} className="text-primary" />
                        <span className="text-sm font-bold">{trip.destination}</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                        <Clock size={16} className="text-primary" />
                        <span className="text-sm font-bold">
                          {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                     </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <button className="h-16 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center gap-3 transition-all active:scale-95 group">
                     <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Collaborate</span>
                  </button>
                  <button className="h-16 w-16 bg-primary hover:bg-primary/90 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 transition-all active:scale-95">
                     <Settings size={24} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <div className="px-6 md:px-14 -mt-8 relative z-10">
          <div className="premium-glass bg-card/80 p-2 rounded-[2.5rem] flex items-center justify-between border border-white/40 shadow-2xl shadow-black/5 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {[
                { id: 'schedule', label: 'Schedule', icon: List },
                { id: 'budget', label: 'Financials', icon: CreditCard },
                { id: 'documentation', label: 'Vault', icon: FileText },
                { id: 'memories', label: 'Gallery', icon: CameraIcon },
                { id: 'collaboration', label: 'Network', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 h-14 rounded-3xl transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Matrix */}
        <div className="px-6 md:px-14 mt-16">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {activeTab === 'schedule' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Timeline / Schedule */}
                <div className="lg:col-span-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                    <div>
                       <h2 className="text-4xl font-black text-foreground dark:text-white tracking-tighter mb-1">Itinerary Detail</h2>
                       <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest">Chronological Experience</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-4 sm:pb-0 no-scrollbar p-2 bg-muted dark:bg-slate-900/50 rounded-3xl border border-border dark:border-white/5" role="navigation">
                      {scheduleDays.map((d: ItineraryDayResponse) => (
                        <button
                          key={d.id}
                          onClick={() => setActiveDay(d.dayNumber)}
                          className={`min-w-[56px] h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                            activeDay === d.dayNumber 
                              ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                              : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">Day</span>
                          <span className="text-xl font-black leading-none">{d.dayNumber}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {currentDayData && (
                      <Timeline 
                        activities={currentDayData.activities} 
                        onActivitiesReorder={async (ids) => {
                          try {
                            await itineraryService.reorderActivities(currentDayData.id, ids);
                            await refreshItineraries();
                          } catch (err) {
                            console.error('Reorder failed:', err);
                          }
                        }}
                        onActivityEdit={openEditActivityModal}
                        onActivityDelete={async (activityId) => {
                          if (window.confirm('Archive this experience?')) {
                            await itineraryService.deleteActivity(activityId);
                            await refreshItineraries();
                          }
                        }}
                        onAddActivity={openCreateActivityModal}
                        dayTitle={`Day ${currentDayData.dayNumber}`}
                        date={currentDayData.date}
                      />
                    )}
                    {!currentDayData && (
                      <div className="text-center py-32 bg-muted dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-border dark:border-slate-800">
                        <div className="w-20 h-20 bg-card dark:bg-slate-800 rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-6">
                           <List size={32} className="text-slate-200" />
                        </div>
                        <p className="text-muted-foreground font-black text-sm uppercase tracking-[0.2em] mb-6">No Experiences Logged</p>
                        <Button variant="primary" onClick={openCreateActivityModal} className="rounded-2xl h-12 px-8 text-xs font-black uppercase tracking-widest">+ Add Experience</Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Intelligence */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Trip Intelligence Card */}
                  <div className="premium-glass bg-card p-10 rounded-[3rem] shadow-xl border border-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Sparkles size={120} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-10 tracking-tight">Intelligence</h3>
                    <div className="space-y-8">
                      {[
                        { label: 'Target Destination', value: trip.destination, icon: MapPin, color: 'text-blue-500' },
                        { label: 'Departure Index', value: new Date(trip.startDate).toLocaleDateString(), icon: Clock, color: 'text-indigo-500' },
                        { label: 'Travel Classification', value: trip.travelType, icon: Star, color: 'text-amber-500' },
                      ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-5 group cursor-default">
                          <div className={`w-14 h-14 rounded-3xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-xl font-bold text-foreground truncate">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-12 p-6 bg-muted rounded-3xl border border-border">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Journey Completion</p>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                           <div 
                             className="h-full bg-primary rounded-full transition-all duration-1000" 
                             style={{ width: `${scheduleDays.length > 0 ? (activeDay / scheduleDays.length) * 100 : 0}%` }}
                           ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase">
                           <span>{scheduleDays.length > 0 ? Math.round((activeDay / scheduleDays.length) * 100) : 0}% Complete</span>
                           <span>Day {activeDay}/{scheduleDays.length || 0}</span>
                        </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-4">
                     <button className="p-6 bg-slate-900 rounded-[2rem] text-white flex flex-col gap-3 hover:bg-black transition-all">
                        <Share2 size={24} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Share Project</span>
                     </button>
                     <button className="p-6 bg-card border border-border rounded-[2rem] text-foreground flex flex-col gap-3 hover:bg-muted transition-all shadow-sm">
                        <Download size={24} className="text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Export PDF</span>
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <Suspense fallback={<div className="p-32 text-center text-muted-foreground animate-pulse font-black uppercase tracking-[0.2em]">Synchronizing Module...</div>}>
                <div className="bg-slate-900 rounded-[3rem] p-4 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-800 animate-fade-in-up overflow-hidden">
                  {activeTab === 'budget' && <BudgetModule tripId={id!} />}
                  {activeTab === 'documentation' && <TravelDocModule tripId={id!} />}
                  {activeTab === 'memories' && <MemoryGalleryModule tripId={id!} />}
                  {activeTab === 'collaboration' && <CollaborationModule tripId={id!} />}
                </div>
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {activityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <form onSubmit={saveActivity} className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-card rounded-[2rem] shadow-2xl border border-border p-6 md:p-8 animate-fade-in-up">
            <div className="flex items-start justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  {editingActivity ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-2">
                  {currentDayData ? `Day ${currentDayData.dayNumber}` : 'Daily schedule'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivityModalOpen(false)}
                className="h-11 px-4 rounded-2xl bg-muted text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                Close
              </button>
            </div>

            {activityError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                {activityError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Title</span>
                <input
                  required
                  value={activityForm.title}
                  onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="Museum visit, dinner reservation, train to Kyoto..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Type</span>
                <select
                  value={activityForm.activityType}
                  onChange={(event) => setActivityForm({ ...activityForm, activityType: event.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                >
                  {Object.keys(ActivityType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Location</span>
                <input
                  value={activityForm.location}
                  onChange={(event) => setActivityForm({ ...activityForm, location: event.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="Place or area"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start</span>
                <input
                  type="time"
                  required
                  value={activityForm.startTime}
                  onChange={(event) => setActivityForm({ ...activityForm, startTime: event.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">End</span>
                <input
                  type="time"
                  required
                  value={activityForm.endTime}
                  onChange={(event) => setActivityForm({ ...activityForm, endTime: event.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cost</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={activityForm.cost}
                  onChange={(event) => setActivityForm({ ...activityForm, cost: event.target.value })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="0.00"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Currency</span>
                <input
                  value={activityForm.currency}
                  maxLength={3}
                  onChange={(event) => setActivityForm({ ...activityForm, currency: event.target.value.toUpperCase() })}
                  className="w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</span>
                <textarea
                  value={activityForm.description}
                  onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })}
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-primary/10"
                  placeholder="Important timing, reservation, or planning details"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-5 py-4 md:col-span-2">
                <input
                  type="checkbox"
                  checked={activityForm.isFlexible}
                  onChange={(event) => setActivityForm({ ...activityForm, isFlexible: event.target.checked })}
                  className="h-5 w-5 accent-primary"
                />
                <span className="text-sm font-bold text-foreground">This activity is flexible</span>
              </label>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setActivityModalOpen(false)} className="rounded-2xl">
                Cancel
              </Button>
              <Button type="submit" isLoading={activitySaving} className="rounded-2xl">
                {editingActivity ? 'Save Activity' : 'Create Activity'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default ItineraryDetail;
