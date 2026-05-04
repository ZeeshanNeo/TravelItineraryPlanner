import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SortableActivityCard from './SortableActivityCard';
import type { ActivityResponse } from '../../services/itinerary.service';
import { Plus, List, BarChart3, Clock, Sparkles, ChevronRight, Car } from 'lucide-react';
import Button from '../shared/Button';
import { estimateTravelTime } from '../../utils/travelTime';

interface TimelineProps {
  activities: ActivityResponse[];
  onActivitiesReorder?: (activityIds: string[]) => void;
  onActivityEdit?: (activity: ActivityResponse) => void;
  onActivityDelete?: (activityId: string) => void;
  onAddActivity?: () => void;
  dayTitle?: string;
  date?: string;
}

const Timeline = ({ 
  activities, 
  onActivitiesReorder, 
  onActivityEdit, 
  onActivityDelete,
  onAddActivity,
}: TimelineProps) => {
  const [localActivities, setLocalActivities] = useState<ActivityResponse[]>(activities);
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');

  useEffect(() => {
    // Sort activities by start time for the timeline view
    const sorted = [...activities].sort((a, b) => {
        const timeA = a.startTime.includes('T') ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime.includes('T') ? new Date(b.startTime).getTime() : 0;
        return timeA - timeB;
    });
    setLocalActivities(sorted);
  }, [activities]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localActivities.findIndex(activity => activity.id === active.id);
      const newIndex = localActivities.findIndex(activity => activity.id === over.id);
      
      const newActivities = arrayMove(localActivities, oldIndex, newIndex);
      setLocalActivities(newActivities);
      
      if (onActivitiesReorder) {
        onActivitiesReorder(newActivities.map(activity => activity.id));
      }
    }
  };

  const handleDragStart = () => {
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '09:00 AM';
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getActivityStyles = (activityType: string) => {
    const type = activityType.toLowerCase();
    switch (true) {
      case type.includes('flight'): 
        return { accent: '#3b82f6', iconBg: 'bg-blue-500/10' };
      case type.includes('hotel') || type.includes('accommodation'): 
        return { accent: '#a855f7', iconBg: 'bg-purple-500/10' };
      case type.includes('food') || type.includes('restaurant'): 
        return { accent: '#10b981', iconBg: 'bg-emerald-500/10' };
      default: 
        return { accent: '#6366f1', iconBg: 'bg-indigo-500/10' };
    }
  };

  return (
    <div className="space-y-8 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-3.5 h-3.5" />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Graph
            </button>
          </div>
        </div>
        
        {onAddActivity && (
          <Button
            variant="primary"
            onClick={onAddActivity}
            className="rounded-2xl px-8 py-4 font-black uppercase tracking-[0.1em] text-[11px] shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        )}
      </div>

      {localActivities.length === 0 ? (
        <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Experiences Yet</h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">Ready to map your journey?</p>
          <Button variant="primary" onClick={onAddActivity} className="rounded-xl px-8 py-3 text-xs uppercase tracking-widest">+ Create Activity</Button>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="relative pl-4 md:pl-24 pr-2">
          {/* Main Timeline Line */}
          <div className="absolute left-[30px] md:left-[118px] top-8 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800" />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={localActivities.map(activity => activity.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-12">
                {localActivities.map((activity, index) => {
                  const transitTime = index > 0 ? estimateTravelTime(localActivities[index-1].location, activity.location) : 0;
                  
                  return (
                    <div key={activity.id} className="relative">
                      {/* Transit Indicator */}
                      {index > 0 && (
                        <div className="absolute -top-10 left-[8px] md:left-[96px] right-0 flex items-center justify-center md:justify-start pointer-events-none z-20">
                           <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-sm md:ml-[-10px]">
                              <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center">
                                 <ChevronRight size={10} className="text-indigo-500 rotate-90" />
                              </div>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                {transitTime} min transit
                              </span>
                           </div>
                        </div>
                      )}

                      {/* Time Marker */}
                      <div className="absolute left-[-10px] md:left-[-90px] top-6 flex items-center gap-4 z-10">
                        <span className="hidden md:block text-[11px] font-black text-slate-400 uppercase tracking-widest w-16 text-right">
                           {formatTime(activity.startTime)}
                        </span>
                        <div className="w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.1)] shrink-0" />
                      </div>

                      <div className="ml-12 md:ml-12">
                        <SortableActivityCard
                          activity={activity}
                          onEdit={onActivityEdit}
                          onDelete={onActivityDelete}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Drop Target Placeholder */}
                <div className="relative ml-12 md:ml-12 opacity-40 hover:opacity-100 transition-opacity group">
                   <div className="absolute left-[-42px] md:left-[-102px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
                   <div 
                     className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex items-center justify-center cursor-pointer group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all"
                     onClick={onAddActivity}
                   >
                      <div className="flex flex-col items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                            <Plus size={20} />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-indigo-500 transition-colors">Drop activity here to reschedule</span>
                      </div>
                   </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        // Simplified Grid Graph Mode
        <div className="premium-glass bg-white dark:bg-slate-900/50 rounded-[3rem] p-6 md:p-10 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
           <div className="relative flex gap-6 md:gap-12 min-h-[500px]">
              <div className="w-12 space-y-0 pt-10 shrink-0 border-r border-slate-100 dark:border-white/5">
                {Array.from({ length: 25 }).map((_, hour) => (
                  <div key={hour} className="h-12 flex items-start justify-end pr-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                      {hour === 0 ? '12A' : hour === 12 ? '12P' : hour > 12 ? `${hour - 12}P` : `${hour}A`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex-1 relative mt-10">
                 {Array.from({ length: 25 }).map((_, hour) => (
                    <div key={hour} className="absolute w-full h-px bg-slate-100 dark:bg-white/5" style={{ top: `${(hour / 24) * 100}%` }} />
                 ))}
                 {localActivities.map((activity, index) => {
                    const startH = new Date(activity.startTime).getHours();
                    const startM = new Date(activity.startTime).getMinutes();
                    const endH = new Date(activity.endTime).getHours();
                    const endM = new Date(activity.endTime).getMinutes();
                    
                    const startPos = (startH + startM / 60) / 24 * 100;
                    const endPos = (endH + endM / 60) / 24 * 100;
                    const duration = Math.max(endPos - startPos, 2);
                    const styles = getActivityStyles(activity.activityType);

                    return (
                      <div 
                        key={activity.id}
                        className="absolute left-4 right-4 rounded-2xl p-4 shadow-xl border-l-4 transition-all hover:scale-[1.02] cursor-pointer group backdrop-blur-md"
                        style={{
                          top: `${startPos}%`,
                          height: `${duration}%`,
                          backgroundColor: `${styles.accent}15`,
                          borderColor: styles.accent,
                          zIndex: 10 + index
                        }}
                        onClick={() => onActivityEdit?.(activity)}
                      >
                         <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black tracking-tight truncate" style={{ color: styles.accent }}>{activity.title}</h4>
                            <span className="text-[9px] font-black uppercase opacity-60" style={{ color: styles.accent }}>{formatTime(activity.startTime)}</span>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* Day Footer Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
         {[
           { label: 'Activities', value: localActivities.length, icon: List },
           { label: 'In Transit', value: `${localActivities.length > 1 ? (localActivities.length - 1) * 15 : 0}m`, icon: Car },
           { label: 'Budget', value: `$${localActivities.reduce((s, a) => s + (a.cost || 0), 0)}`, icon: Clock },
           { label: 'Status', value: 'Ready', icon: Sparkles },
         ].map((stat, i) => (
           <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Timeline;
