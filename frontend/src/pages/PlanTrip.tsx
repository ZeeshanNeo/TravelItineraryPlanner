import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ChevronRight, ChevronLeft, 
  MapPin, Calendar, Briefcase, 
  User, Users, CheckCircle2,
  Save, Sparkles
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { tripService, TravelType } from '../services/trip.service';
import type { TravelTypeEnum } from '../services/trip.service';

const PlanTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState<TravelTypeEnum>(TravelType.Business);
  const [budget, setBudget] = useState(12500);
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nextStep = () => {
    if (step === 1) {
      if (!destination || !startDate || !endDate) {
        setError('Please fill in all destination fields');
        return;
      }
    }
    setError('');
    setStep(s => Math.min(s + 1, 3));
  }
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleCreateTrip = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await tripService.createTrip({
        title: `${destination} Trip`,
        destination,
        startDate,
        endDate,
        travelType: tripType,
        purpose: 'Budget: ' + budget,
        notes: '',
        travelCompanions: []
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip.');
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        {/* Background ambient effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Modal-style Container */}
        <div className="w-full max-w-4xl relative z-10 animate-fade-in-up">
          <div className="premium-glass bg-white/70 dark:bg-slate-900/70 rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            {/* Left: Preview/Context Panel */}
            <div className="md:w-1/3 bg-slate-900 relative overflow-hidden flex flex-col">
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-1000 group-hover:scale-110" 
                alt="Destination Preview" 
                src={destination ? `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800&sig=${destination}` : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              
              <div className="relative z-10 p-10 flex-1 flex flex-col">
                <div className="mb-auto">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
                      <Sparkles className="text-primary w-6 h-6" />
                   </div>
                   <h2 className="text-3xl font-black text-white leading-tight">Start Your <br />Next Journey</h2>
                </div>
                
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-white/10 text-white/40'}`}>1</div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${step >= 1 ? 'text-white' : 'text-white/40'}`}>Destination</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-white/10 text-white/40'}`}>2</div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${step >= 2 ? 'text-white' : 'text-white/40'}`}>Details</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-white/10 text-white/40'}`}>3</div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${step >= 3 ? 'text-white' : 'text-white/40'}`}>Confirm</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Right: Form Area */}
            <div className="flex-1 flex flex-col bg-white/40">
              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-foreground">
                      {step === 1 && "Where are we going?"}
                      {step === 2 && "Configure your journey"}
                      {step === 3 && "Final Review"}
                    </h3>
                    <p className="text-muted-foreground font-medium text-sm">Step {step} of 3</p>
                  </div>
                  <button onClick={() => navigate('/dashboard')} className="p-3 rounded-2xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground shadow-sm transition-all active:scale-90">
                    <X size={20} />
                  </button>
                </div>

                {error && (
                  <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <X size={14} />
                    </div>
                    {error}
                  </div>
                )}

                <div className="min-h-[300px]">
                  {step === 1 && (
                    <div className="space-y-8 animate-fade-in">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Location</label>
                        <div className="relative group">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <input 
                            value={destination} 
                            onChange={e => setDestination(e.target.value)} 
                            type="text" 
                            className="w-full pl-14 pr-6 py-5 bg-card rounded-3xl border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold shadow-sm placeholder:text-slate-300" 
                            placeholder="e.g. Santorini, Greece" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Departure</label>
                          <div className="relative group">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input 
                              value={startDate} 
                              onChange={e => setStartDate(e.target.value)} 
                              type="date" 
                              className="w-full pl-14 pr-6 py-5 bg-card rounded-3xl border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold shadow-sm" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Return</label>
                          <div className="relative group">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input 
                              value={endDate} 
                              onChange={e => setEndDate(e.target.value)} 
                              type="date" 
                              className="w-full pl-14 pr-6 py-5 bg-card rounded-3xl border border-border focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold shadow-sm" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-10 animate-fade-in">
                      <section className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Travel Type</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: TravelType.Business, icon: Briefcase, label: 'Business' },
                            { id: TravelType.Solo, icon: User, label: 'Solo' },
                            { id: TravelType.Family, icon: Users, label: 'Family' },
                          ].map(type => (
                            <button 
                              key={type.id}
                              onClick={() => setTripType(type.id)}
                              className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${tripType === type.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-50 bg-card text-muted-foreground hover:border-border'}`}
                            >
                              <type.icon size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <div className="flex justify-between items-end px-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Budget</label>
                          <span className="text-2xl font-black text-primary">${budget.toLocaleString()}</span>
                        </div>
                        <div className="relative pt-2">
                          <input 
                            type="range" 
                            min="1000" 
                            max="50000" 
                            step="500"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full h-2.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary" 
                          />
                          <div className="flex justify-between mt-3 px-1 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                            <span>$1k</span>
                            <span>$50k</span>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-scale-in">
                      <div className="w-24 h-24 rounded-[2rem] bg-green-50 text-green-500 flex items-center justify-center shadow-2xl shadow-green-500/10 border border-green-100">
                        <CheckCircle2 size={48} />
                      </div>
                      <div className="text-center">
                        <h4 className="text-2xl font-black text-foreground mb-2">Ready for Departure</h4>
                        <p className="text-muted-foreground font-medium max-w-xs leading-relaxed">
                          We've initialized your itinerary for <span className="text-foreground font-bold">{destination}</span>. 
                          Your dashboard will be ready momentarily.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-8 md:p-10 bg-white/40 border-t border-white/50 flex items-center justify-between">
                <button 
                  onClick={step === 1 ? () => navigate('/dashboard') : prevStep}
                  className="flex items-center gap-2 px-6 py-4 rounded-2xl text-muted-foreground font-bold text-sm hover:bg-muted transition-all active:scale-95"
                >
                  <ChevronLeft size={18} />
                  <span>{step === 1 ? 'Discard' : 'Go Back'}</span>
                </button>
                
                <div className="flex gap-4">
                  <button className="px-6 py-4 rounded-2xl bg-card text-muted-foreground hover:text-foreground font-bold text-sm shadow-sm border border-slate-50 hidden sm:flex items-center gap-2 transition-all active:scale-95">
                    <Save size={18} />
                    <span>Save Draft</span>
                  </button>
                  {step === 3 ? (
                    <button 
                      disabled={isSubmitting}
                      onClick={handleCreateTrip}
                      className="px-10 py-4 bg-primary text-white font-bold text-sm rounded-2xl shadow-2xl shadow-primary/30 hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Initializing...' : 'Confirm Journey'}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={nextStep}
                      className="px-10 py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-2xl shadow-slate-900/30 hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>Continue</span>
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlanTrip;
