import React from 'react';
import { Camera, Book, MapPin, Tag, Calendar, Trophy } from 'lucide-react';
import type { TripSummary as TripSummaryType } from '../../services/memory.service';

interface TripSummaryProps {
  summary: TripSummaryType;
}

const TripSummary: React.FC<TripSummaryProps> = ({ summary }) => {
  const stats = [
    { label: 'Photos Captured', value: summary.totalPhotos, icon: Camera, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Journal Entries', value: summary.totalJournals, icon: Book, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Days Traveled', value: summary.totalDays, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 glass-effect text-center relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon className={stat.color} size={32} />
            </div>
            <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Locations */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 glass-effect">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <MapPin className="text-rose-400" size={24} />
            Frequent Spots
          </h4>
          <div className="space-y-4">
            {summary.topLocations.map((loc, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <span className="text-gray-300 font-bold">{loc}</span>
                <span className="text-rose-400/50 font-black">#0{i + 1}</span>
              </div>
            ))}
            {summary.topLocations.length === 0 && <p className="text-gray-500 text-center py-4">Add photo locations to see insights.</p>}
          </div>
        </div>

        {/* Top Tags */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 glass-effect">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Tag className="text-indigo-400" size={24} />
            Popular Tags
          </h4>
          <div className="flex flex-wrap gap-3">
            {summary.topTags.map((tag, i) => (
              <div key={i} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-colors flex items-center gap-3">
                <Tag size={16} className="text-indigo-400" />
                {tag}
              </div>
            ))}
            {summary.topTags.length === 0 && <p className="text-gray-500 text-center py-4 w-full">Tag your photos to see insights.</p>}
          </div>
        </div>
      </div>

      {/* Achievement / Conclusion */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-[3rem] p-12 text-center relative overflow-hidden">
        <div className="relative z-10">
          <Trophy className="text-amber-400 mx-auto mb-6 drop-shadow-lg" size={64} />
          <h3 className="text-3xl font-black text-white mb-4">Journey Well Traveled</h3>
          <p className="text-gray-400 max-w-lg mx-auto text-lg">
            You've successfully documented another chapter of your life. These memories are now safely stored in your digital vault.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      </div>
    </div>
  );
};

export default TripSummary;
