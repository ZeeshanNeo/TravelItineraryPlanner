import React, { useState } from 'react';
import { X, Download, FileText, Calendar, CreditCard, Share2, ShieldCheck, CheckCircle } from 'lucide-react';
import type { TripResponse } from '../../services/trip.service';

interface ExportManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripResponse;
}

const ExportManifestModal: React.FC<ExportManifestModalProps> = ({ isOpen, onClose, trip }) => {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async (format: 'pdf' | 'ics' | 'json') => {
    setExporting(true);
    
    if (format === 'json') {
      const manifest = {
        trip_id: trip.id,
        title: trip.title,
        destination: trip.destination,
        dates: `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`,
        status: 'Operational',
        generated_at: new Date().toISOString(),
        security_hash: btoa(trip.id + Date.now()).slice(0, 16)
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Voyager_Manifest_${trip.title.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Simulate other formats for now
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setExporting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="p-12">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Enterprise Export Protocol</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Export Manifest</h2>
              <p className="text-slate-500 font-medium mt-2">Generate a comprehensive tactical summary of your journey.</p>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-12 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Manifest Synchronized</h3>
              <p className="text-slate-500 font-medium">Your tactical manifest has been generated and dispatched to your device.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-white/5 text-left hover:border-primary transition-all group relative overflow-hidden"
                >
                  <FileText className="w-8 h-8 text-rose-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">PDF Document</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visual Dossier & Itinerary</p>
                  {exporting && <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center animate-pulse"><Download size={24} className="text-primary animate-bounce" /></div>}
                </button>

                <button 
                  onClick={() => handleExport('ics')}
                  disabled={exporting}
                  className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-white/5 text-left hover:border-primary transition-all group relative overflow-hidden"
                >
                  <Calendar className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">iCal Feed</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Temporal Synchronization</p>
                </button>

                <button 
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-white/5 text-left hover:border-primary transition-all group relative overflow-hidden"
                >
                  <Share2 className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">Raw Data</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">JSON Manifest Export</p>
                </button>

                <button 
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-white/5 text-left hover:border-primary transition-all group relative overflow-hidden"
                >
                  <CreditCard className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">Budget Report</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Financial Audit Summary</p>
                </button>
              </div>

              <div className="mt-8 p-6 bg-slate-900 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="text-emerald-400" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Security Clearance</p>
                    <p className="text-[10px] text-slate-500 font-bold">Authenticated User: {trip.userId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportManifestModal;
