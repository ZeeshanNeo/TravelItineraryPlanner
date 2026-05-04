import React from 'react';
import { Camera, Book, MapPin } from 'lucide-react';
import type { TimelineItem } from '../../services/memory.service';
import { getAssetUrl } from '../../config';

interface TimelineViewProps {
  timeline: TimelineItem[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  return (
    <div className="relative py-10">
      {/* Vertical Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

      <div className="space-y-12">
        {timeline.map((item, index) => {
          const isPhoto = item.type === 'Photo';
          const data = item.data as any;
          const isEven = index % 2 === 0;

          return (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
              {/* Content Card */}
              <div className="flex-1 w-full md:w-auto">
                <div className={`p-6 bg-white/5 border border-white/10 rounded-3xl glass-effect hover:border-white/20 transition-all ${isEven ? 'text-right' : 'text-left'}`}>
                  <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest mb-4 ${isPhoto ? 'text-indigo-400' : 'text-emerald-400'} ${isEven ? 'justify-end' : 'justify-start'}`}>
                    {isPhoto ? <Camera size={14} /> : <Book size={14} />}
                    {item.type}
                    <span className="text-gray-500 ml-2">•</span>
                    <span className="text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                  </div>

                  {isPhoto ? (
                    <div className="space-y-4">
                      <div className="aspect-video rounded-2xl overflow-hidden border border-white/10">
                        <img 
                          src={getAssetUrl(data.filePath)} 
                          alt={data.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="text-lg font-bold text-white">{data.title}</h4>
                      {data.location && (
                        <div className={`flex items-center gap-2 text-xs text-white/40 ${isEven ? 'justify-end' : ''}`}>
                          <MapPin size={12} />
                          {data.location}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{data.title}</h4>
                      <p className="text-gray-400 line-clamp-3 italic">"{data.content}"</p>
                      {data.location && (
                        <div className={`flex items-center gap-2 text-xs text-white/40 mt-4 ${isEven ? 'justify-end' : ''}`}>
                          <MapPin size={12} />
                          {data.location}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Center Point */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl ${isPhoto ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                  {isPhoto ? <Camera size={20} className="text-white" /> : <Book size={20} className="text-white" />}
                </div>
              </div>

              {/* Empty Space for layout */}
              <div className="flex-1 hidden md:block" />
            </div>
          );
        })}

        {timeline.length === 0 && (
          <div className="text-center py-20 text-white/30 italic">
            Your timeline will appear once you add photos or journal entries.
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
