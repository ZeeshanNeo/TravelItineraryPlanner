import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import timezoneService from '../../../services/timezone.service';

const TimeZoneCalculator: React.FC = () => {
  const [destinationTz, setDestinationTz] = useState<string>('UTC');
  const [localTime, setLocalTime] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const timeZones = [
    'UTC',
    'GMT Standard Time',
    'Central Europe Standard Time',
    'Eastern Standard Time',
    'Pacific Standard Time',
    'India Standard Time',
    'China Standard Time',
    'Tokyo Standard Time',
    'AUS Eastern Standard Time'
  ];

  const fetchTimes = async () => {
    setIsLoading(true);
    try {
      const time = await timezoneService.getLocalTime(destinationTz);
      setLocalTime(new Date(time).toLocaleTimeString());
      
      // Assume source is local for this simple calculator
      const difference = await timezoneService.getTimeDifference('UTC', destinationTz);
      setDiff(difference);
    } catch (error) {
      console.error('Timezone fetch failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimes();
    const interval = setInterval(fetchTimes, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [destinationTz]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 shadow-xl enterprise-surface">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Clock size={20} />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Time Alignment</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Destination Zone</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={destinationTz} 
              onChange={(e) => setDestinationTz(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
            >
              {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Local Time</p>
          
          {isLoading && !localTime ? (
            <div className="h-12 w-48 bg-slate-100 animate-pulse rounded-2xl"></div>
          ) : (
            <div className="space-y-1">
              <div className="text-4xl font-black text-indigo-600 tracking-tighter">
                {localTime}
              </div>
              <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.15em] px-4 py-1.5 rounded-full mt-4">
                Offset: {diff || 'Calculating...'}
              </div>
            </div>
          )}
          
          <p className="text-[8px] font-bold text-slate-300 mt-6 uppercase tracking-widest px-8">Synchronized with Global Atomic Clock Standards</p>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneCalculator;
