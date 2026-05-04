import { useState, useEffect } from 'react';
import {
  Palmtree, Briefcase, Users, User, X,
  MapPin, Calendar as CalendarIcon, FileText,
  ShieldCheck, Globe, Zap
} from 'lucide-react';
import { tripService, TravelType, type TripResponse, type TravelTypeEnum } from '../../services/trip.service';

interface EditTripModalProps {
  trip: TripResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTripModal = ({ trip, onClose, onSuccess }: EditTripModalProps) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelType, setTravelType] = useState<TravelTypeEnum>(TravelType.Leisure);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setTitle(trip.title || '');
      setDestination(trip.destination || '');
      setStartDate(trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '');
      setEndDate(trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '');

      let initialType: TravelTypeEnum = TravelType.Leisure;
      if (trip.travelType === 'Business' || trip.travelType === '1') initialType = TravelType.Business;
      if (trip.travelType === 'Family' || trip.travelType === '2') initialType = TravelType.Family;
      if (trip.travelType === 'Solo' || trip.travelType === '3') initialType = TravelType.Solo;
      setTravelType(initialType);

      setPurpose(trip.purpose || '');
      setNotes(trip.notes || '');
    }
  }, [trip]);

  if (!trip) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await tripService.updateTrip(trip.id, {
        title,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        travelType,
        purpose,
        notes
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const travelTypes = [
    { id: TravelType.Leisure, icon: <Palmtree className="w-6 h-6" />, label: 'Leisure' },
    { id: TravelType.Business, icon: <Briefcase className="w-6 h-6" />, label: 'Business' },
    { id: TravelType.Family, icon: <Users className="w-6 h-6" />, label: 'Family' },
    { id: TravelType.Solo, icon: <User className="w-6 h-6" />, label: 'Solo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-5xl flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 dark:border-white/5">

        {/* Decorative Sidebar */}
        <div className="hidden lg:flex lg:w-80 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-white/5 p-12 flex-col justify-between shrink-0">
          <div>
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-black shadow-[0_10px_25px_rgba(0,0,0,0.8)] mb-8 rotate-[-6deg]">              <Zap size={28} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
              Journey Intelligence
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">
              Refine your voyage parameters. Our intelligence engine optimizes your schedule based on travel classification.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sync Status</p>
                <p className="text-xs font-black text-slate-900 dark:text-white">Active Node</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security</p>
                <p className="text-xs font-black text-slate-900 dark:text-white">Encrypted Vault</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 max-h-[85vh]">
          <div className="flex items-center justify-between p-8 md:px-12 md:py-10 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Overhaul</span>
            </div>
            <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
            {error && (
              <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-bold flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <form id="edit-trip-form" onSubmit={handleSubmit} className="space-y-12">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <FileText size={12} /> Journey Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    placeholder="E.g., Tokyo Expedition"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <MapPin size={12} /> Target Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    placeholder="E.g., Tokyo, Japan"
                    required
                  />
                </div>
              </div>

              {/* Temporal Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <CalendarIcon size={12} /> Commencement
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <CalendarIcon size={12} /> Conclusion
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Voyage Classification</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {travelTypes.map(type => (
                    <button
                      key={type.label}
                      type="button"
                      onClick={() => setTravelType(type.id as TravelTypeEnum)}
                      className={`flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] border-2 transition-all duration-300 ${travelType === type.id
                        ? 'border-primary bg-primary/5 text-primary shadow-2xl shadow-primary/10'
                        : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 hover:border-slate-200 dark:hover:border-white/10'
                        }`}
                    >
                      <div className={`transition-transform duration-500 ${travelType === type.id ? 'scale-110' : ''}`}>
                        {type.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes Sections */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Purpose / Budget Profile</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    placeholder="E.g., Corporate Conference, Family Vacation"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Intelligence Field Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-[2rem] p-8 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                    placeholder="Record additional voyage insights here..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-8 md:px-12 md:py-10 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-end gap-6 bg-slate-50/50 dark:bg-slate-800/20">
            <button
              type="button"
              onClick={onClose}
              className="h-16 px-10 rounded-2xl font-black text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase tracking-widest transition-colors"
            >
              Cancel Refinement
            </button>
            <button
              type="submit"
              form="edit-trip-form"
              disabled={isSubmitting}
              className="h-16 px-14 bg-slate-900 dark:bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Update Journey</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTripModal;
