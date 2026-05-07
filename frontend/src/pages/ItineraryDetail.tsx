import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import {
  Calendar, MapPin, Clock, ArrowLeft,
  Share2, List, CreditCard, FileText, Camera as CameraIcon, Users,
  Download, Sparkles, DollarSign, X, ShieldCheck, CheckCircle
} from 'lucide-react';
import Button from '../components/shared/Button';
import { tripService } from '../services/trip.service';
import itineraryService, { ActivityType } from '../services/itinerary.service';
import type { TripResponse } from '../services/trip.service';
import type { ActivityResponse, ItineraryResponse, ItineraryDayResponse } from '../services/itinerary.service';
import Timeline from '../components/itinerary/Timeline';
import { useToast } from '../components/shared/Toast';
import { runTripAssurance, type AssuranceCheck } from '../utils/tripAssurance';
import ExportManifestModal from '../components/itinerary/ExportManifestModal';

// Lazy loaded modules for performance
const BudgetModule = lazy(() => import('../components/budget/BudgetModule'));
const TravelDocModule = lazy(() => import('../components/travelDocs/TravelDocModule'));
const MemoryGalleryModule = lazy(() => import('../components/memories/MemoryGalleryModule'));
const CollaborationModule = lazy(() => import('../components/collaboration/CollaborationModule'));

const ItineraryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedule' | 'budget' | 'documentation' | 'memories' | 'collaboration'>('schedule');
  const [activeDay, setActiveDay] = useState(1);
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [assuranceChecks, setAssuranceChecks] = useState<AssuranceCheck[]>([]);
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

      if (tripData && itins.length > 0) {
        const checks = runTripAssurance(tripData, itins);
        setAssuranceChecks(checks);
      }
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

  const createInitialDays = async (itinerary: ItineraryResponse) => {
    try {
      const [year, month, day] = itinerary.startDate.split('T')[0].split('-').map(Number);

      for (let i = 1; i <= itinerary.totalDays; i++) {
        const date = new Date(year, month - 1, day);
        date.setDate(date.getDate() + (i - 1));

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        try {
          await itineraryService.createItineraryDay({
            itineraryId: itinerary.id,
            dayNumber: i,
            date: dateStr,
            title: `Day ${i}`
          });
        } catch (dayErr) {
          console.error(`Failed to create day ${i}:`, dayErr);
        }
      }
      showToast(`Itinerary generated: ${itinerary.totalDays} days`, 'success');
      await refreshItineraries();
      setActiveDay(1);
    } catch (err) {
      console.error('Failed to generate itinerary days:', err);
      showToast('Initial day generation failed', 'error');
    }
  };

  useEffect(() => {
    if (itineraries.length > 0 && (!itineraries[0].days || itineraries[0].days.length === 0)) {
      createInitialDays(itineraries[0]);
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
      showToast(editingActivity ? 'Activity updated successfully' : 'Activity added to your journey', 'success');
    } catch (err: any) {
      setActivityError(err.response?.data?.message || 'Failed to save experience. Verify details and try again.');
    } finally {
      setActivitySaving(false);
    }
  };

  const handleActivitiesReorder = async (activityIds: string[]) => {
    if (!currentDayData) return;
    try {
      await itineraryService.reorderActivities(currentDayData.id, activityIds);
      await refreshItineraries();
      showToast('Schedule reordered', 'success');
    } catch (err) {
      console.error('Failed to reorder activities:', err);
      showToast('Failed to save new order', 'error');
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
                <button 
                  onClick={() => setActiveTab('collaboration')}
                  className="h-16 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center gap-3 transition-all active:scale-95 group"
                >
                  <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Collaborate</span>
                </button>
                <button 
                  onClick={() => setExportModalOpen(true)}
                  className="h-16 w-16 bg-primary hover:bg-primary/90 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 transition-all active:scale-95"
                >
                  <Download size={24} />
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
                  className={`flex items-center gap-3 px-8 h-14 rounded-3xl transition-all duration-300 ${activeTab === tab.id
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
                          className={`min-w-[56px] h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${activeDay === d.dayNumber
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                            : 'text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
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
                        onActivitiesReorder={handleActivitiesReorder}
                        onActivityEdit={openEditActivityModal}
                        onActivityDelete={async (activityId) => {
                          if (window.confirm('Archive this experience?')) {
                            await itineraryService.deleteActivity(activityId);
                            await refreshItineraries();
                          }
                        }}
                        onAddActivity={openCreateActivityModal}
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
                    <div className="flex justify-between items-start mb-10">
                      <h3 className="text-2xl font-black text-foreground tracking-tight">Intelligence</h3>
                      <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <ShieldCheck size={12} />
                        Assurance Active
                      </div>
                    </div>
                    <div className="space-y-8">
                      {assuranceChecks.slice(0, 3).map((check, i) => (
                        <div key={i} className="flex items-start gap-5 group cursor-default">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${check.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            <CheckCircle size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{check.title}</p>
                            <p className="text-sm font-bold text-foreground leading-tight">{check.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('documentation');
                        showToast('Full Trip Assurance Review Protocol Initiated', 'success');
                      }}
                      className="w-full mt-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Review Trip Assurance
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('collaboration')}
                      className="p-6 bg-emerald-500 rounded-[2rem] text-white flex flex-col gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Users size={24} className="text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Share Project</span>
                    </button>
                    <button
                      onClick={() => setExportModalOpen(true)}
                      className="p-6 bg-card border border-border rounded-[2rem] text-foreground flex flex-col gap-3 hover:bg-muted transition-all shadow-sm"
                    >
                      <FileText size={24} className="text-muted-foreground" />
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

      {exportModalOpen && trip && (
        <ExportManifestModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          trip={trip}
        />
      )}

      {activityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0" onClick={() => setActivityModalOpen(false)} />
          <form
            onSubmit={saveActivity}
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500"
          >
            {/* Modal Sidebar - Visual Context */}
            <div className="hidden md:flex md:w-80 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-white/5 p-12 flex-col justify-between shrink-0">
              <div>
                <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-black shadow-[0_10px_25px_rgba(0,0,0,0.8)] mb-10 rotate-[-6deg]">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-4">
                  {editingActivity ? 'Refine Experience' : 'New Adventure'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">
                  Capture the essence of your journey. Every detail counts toward a perfect trip.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Scope</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {currentDayData ? `Day ${currentDayData.dayNumber}` : 'Master Itinerary'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content - Form Fields */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header for Mobile */}
              <div className="md:hidden p-8 border-b border-slate-100 dark:border-white/5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingActivity ? 'Edit Activity' : 'Add Activity'}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-14 space-y-10 custom-scrollbar">
                {activityError && (
                  <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold animate-in slide-in-from-top-2">
                    {activityError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Experience Title</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Sparkles size={20} />
                      </div>
                      <input
                        required
                        value={activityForm.title}
                        onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })}
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl pl-16 pr-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all"
                        placeholder="e.g. Sushi Masterclass in Ginza"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Classification</label>
                    <select
                      value={activityForm.activityType}
                      onChange={(event) => setActivityForm({ ...activityForm, activityType: event.target.value })}
                      className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                    >
                      {Object.keys(ActivityType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Pinpoint Location</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <MapPin size={20} />
                      </div>
                      <input
                        value={activityForm.location}
                        onChange={(event) => setActivityForm({ ...activityForm, location: event.target.value })}
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl pl-16 pr-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="Search location..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Start Time</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Clock size={20} />
                      </div>
                      <input
                        type="time"
                        required
                        value={activityForm.startTime}
                        onChange={(event) => setActivityForm({ ...activityForm, startTime: event.target.value })}
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl pl-16 pr-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">End Time</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Clock size={20} />
                      </div>
                      <input
                        type="time"
                        required
                        value={activityForm.endTime}
                        onChange={(event) => setActivityForm({ ...activityForm, endTime: event.target.value })}
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl pl-16 pr-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Forecasted Cost</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <DollarSign size={20} />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={activityForm.cost}
                        onChange={(event) => setActivityForm({ ...activityForm, cost: event.target.value })}
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl pl-16 pr-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Currency Code</label>
                    <input
                      value={activityForm.currency}
                      maxLength={3}
                      onChange={(event) => setActivityForm({ ...activityForm, currency: event.target.value.toUpperCase() })}
                      className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center uppercase tracking-widest"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Additional Intelligence</label>
                    <textarea
                      value={activityForm.description}
                      onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })}
                      className="min-h-32 w-full bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-8 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all resize-none"
                      placeholder="Important timing, reservation, or planning details..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-4 group cursor-pointer p-2">
                      <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${activityForm.isFlexible ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-slate-200 dark:border-white/10 group-hover:border-primary/50'}`}>
                        {activityForm.isFlexible && <X size={14} className="text-white rotate-45" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={activityForm.isFlexible}
                        onChange={(event) => setActivityForm({ ...activityForm, isFlexible: event.target.checked })}
                        className="hidden"
                      />
                      <span className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Mark as Flexible Opportunity</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-8 md:p-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setActivityModalOpen(false)}
                  className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest bg-emerald-800 text-white hover:bg-slate-800 shadow-2xl shadow-primary/100 transition-all active:scale-95"
                >
                  Discard
                </button>
                <Button
                  type="submit"
                  isLoading={activitySaving}
                  className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all active:scale-95"
                >
                  {editingActivity ? 'Save Experience' : 'Finalize Activity'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default ItineraryDetail;
