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
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import SortableActivityCard from './SortableActivityCard';
import type { ActivityResponse } from '../../services/itinerary.service';
import { Plus, List, BarChart3, Clock, Sparkles, ChevronRight, Car, Calendar, DollarSign } from 'lucide-react';
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
  dayTitle,
  date,
}: TimelineProps) => {
  const [localActivities, setLocalActivities] = useState<ActivityResponse[]>(activities);
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');
  const [isCompact, setIsCompact] = useState(false);
  const [viewMoreGraph, setViewMoreGraph] = useState(false);

  useEffect(() => {
    // Sort activities by Order primarily, then by start time
    const sorted = [...activities].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;

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
      const activeActivity = localActivities.find(a => a.id === active.id);

      // If dropped on the reschedule placeholder, trigger edit
      if (over.id === 'drop-placeholder' && activeActivity) {
        onActivityEdit?.(activeActivity);
        return;
      }

      const oldIndex = localActivities.findIndex(activity => activity.id === active.id);
      let newIndex = localActivities.findIndex(activity => activity.id === over.id);

      if (newIndex !== -1 && oldIndex !== -1) {
        const newActivities = arrayMove(localActivities, oldIndex, newIndex);
        setLocalActivities(newActivities);

        if (onActivitiesReorder) {
          onActivitiesReorder(newActivities.map(activity => activity.id));
        }
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
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2">
        <div className="flex flex-col gap-2">
          {dayTitle && (
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{dayTitle}</h2>
          )}
          {date && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          )}

          {/* Integrated Toolbar */}
          <div className="flex items-center gap-2 mt-6">
            <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-inner">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-3.5 h-3.5" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${viewMode === 'graph' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Graph
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2 self-center" />

              <button
                onClick={() => setIsCompact(!isCompact)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${isCompact
                  ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 scale-105'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Compact
              </button>
            </div>
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
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Experiences Yet</h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">Ready to map your journey?</p>
          <Button variant="primary" onClick={onAddActivity} className="rounded-xl px-8 py-3 text-xs uppercase tracking-widest">+ Create Activity</Button>
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="relative pl-4 md:pl-28 pr-2">
          {/* Main Timeline Line with Gradient */}
          <div className="absolute left-[30px] md:left-[118px] top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 rounded-full" />

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
              <div className={isCompact ? "space-y-4" : "space-y-12"}>
                {localActivities.map((activity, index) => {
                  const transitTime = index > 0 ? estimateTravelTime(localActivities[index - 1].location, activity.location) : 0;

                  return (
                    <div key={activity.id} className="relative group/time">
                      {/* Transit Indicator */}
                      {index > 0 && !isCompact && (
                        <div className="absolute -top-10 left-[8px] md:left-[96px] right-0 flex items-center justify-center md:justify-start pointer-events-none z-20">
                          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-xl md:ml-[-10px] transform transition-transform group-hover/time:scale-105">
                            <div className="w-5 h-5 bg-indigo-500/10 rounded-full flex items-center justify-center">
                              <ChevronRight size={10} className="text-indigo-500 rotate-90" />
                            </div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                              {transitTime} min transit
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Time Marker - Enhanced Visibility */}
                      <div className={`absolute left-[-10px] md:left-[-90px] flex items-center gap-4 z-30 ${isCompact ? 'top-1/2 -translate-y-1/2' : 'top-6'}`}>
                        <div className="hidden md:flex flex-col items-end w-20">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {formatTime(activity.startTime).split(' ')[0]}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] -mt-1">
                            {formatTime(activity.startTime).split(' ')[1]}
                          </span>
                        </div>
                        <div className={`rounded-full border-[4px] border-white dark:border-slate-900 shadow-xl transition-all duration-300 group-hover/time:scale-125 ${isCompact ? 'w-4 h-4 bg-indigo-500' : 'w-6 h-6 bg-primary'}`} />
                      </div>

                      <div className={`ml-12 md:ml-12 ${isCompact ? 'scale-[0.98] origin-left' : ''}`}>
                        <SortableActivityCard
                          activity={activity}
                          onEdit={onActivityEdit}
                          onDelete={onActivityDelete}
                          isCompact={isCompact}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Robust Reschedule Drop Target */}
                <div className="pt-8">
                  <ReschedulePlaceholder onAdd={onAddActivity} />
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        // Premium High-Density Graph Mode
        <div className="premium-glass bg-white dark:bg-slate-900/50 rounded-[3rem] p-6 md:p-8 shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
          <div className="relative flex flex-col gap-6">
            <div className={`overflow-y-auto transition-all duration-700 ${viewMoreGraph ? 'max-h-[800px]' : 'max-h-[400px]'} custom-scrollbar`}>
              <div className="relative flex gap-6 md:gap-10">
                <div className="w-10 space-y-0 pt-2 shrink-0 border-r border-slate-100 dark:border-white/5">
                  {(viewMoreGraph ? Array.from({ length: 25 }) : Array.from({ length: 13 })).map((_, i) => {
                    const hour = viewMoreGraph ? i : (i + 8) % 24;
                    return (
                      <div key={hour} className="h-16 flex items-start justify-end pr-4">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                          {hour === 0 ? '12A' : hour === 12 ? '12P' : hour > 12 ? `${hour - 12}P` : `${hour}A`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex-1 relative pt-2 min-h-[400px]">
                  {(viewMoreGraph ? Array.from({ length: 25 }) : Array.from({ length: 25 })).map((_, i) => (
                    <div key={i} className="absolute w-full h-px bg-slate-100 dark:bg-white/5" style={{ top: `${(i / 24) * 100}%` }} />
                  ))}

                  {/* Real-Time Marker */}
                  <div 
                    className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] z-30 flex items-center"
                    style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%` }}
                  >
                    <div className="absolute -left-2 w-4 h-4 rounded-full bg-rose-500 shadow-xl" />
                    <span className="ml-4 px-3 py-1 bg-rose-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest shadow-lg">Current Time</span>
                  </div>

                  {localActivities.map((activity, index) => {
                    const start = new Date(activity.startTime);
                    const end = new Date(activity.endTime);
                    const startH = start.getHours();
                    const startM = start.getMinutes();
                    const endH = end.getHours();
                    const endM = end.getMinutes();

                    const startPos = (startH + startM / 60) / 24 * 100;
                    const endPos = (endH + endM / 60) / 24 * 100;
                    const duration = Math.max(endPos - startPos, 2);
                    const styles = getActivityStyles(activity.activityType);

                    return (
                      <div
                        key={activity.id}
                        className="absolute left-2 right-2 rounded-xl p-3 shadow-lg border-l-4 transition-all hover:scale-[1.01] cursor-pointer group backdrop-blur-md overflow-hidden ring-1 ring-white/10"
                        style={{
                          top: `${startPos}%`,
                          height: `${duration}%`,
                          backgroundColor: `${styles.accent}20`,
                          borderColor: styles.accent,
                          zIndex: 10 + index
                        }}
                        onClick={() => onActivityEdit?.(activity)}
                      >
                        <div className="flex flex-col h-full justify-center">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-[10px] font-black tracking-tight truncate uppercase" style={{ color: styles.accent }}>{activity.title}</h4>
                            <span className="text-[8px] font-black opacity-60 shrink-0" style={{ color: styles.accent }}>{formatTime(activity.startTime)}</span>
                          </div>
                          {(duration > 5 || !viewMoreGraph) && (
                            <p className="text-[8px] font-bold opacity-60 truncate mt-1" style={{ color: styles.accent }}>{activity.location}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewMoreGraph(!viewMoreGraph)}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 mt-4"
            >
              {viewMoreGraph ? 'Compress Timeline Intelligence' : 'Maximize 24h Intelligence Grid'}
              <ChevronRight className={`w-4 h-4 transition-transform ${viewMoreGraph ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Day Footer Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-2">
        {[
          { label: 'Experiences', value: localActivities.length, icon: List },
          { label: 'Est. Commute', value: `${localActivities.length > 1 ? localActivities.slice(1).reduce((total, a, i) => total + estimateTravelTime(localActivities[i].location, a.location), 0) : 0}m`, icon: Car },
          { label: 'Total Budget', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(localActivities.reduce((s, a) => s + (a.cost || 0), 0)), icon: DollarSign },
          { label: 'Trip Status', value: localActivities.length > 0 ? 'Verified' : 'Planning', icon: Sparkles },
          { label: 'Mission Day', value: dayTitle?.split(' ')[1] || '1', icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 text-center flex flex-col justify-center transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-xl">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReschedulePlaceholder = ({ onAdd }: { onAdd?: () => void }) => {
  const {
    setNodeRef,
    isOver,
  } = useSortable({ id: 'drop-placeholder' });

  return (
    <div
      ref={setNodeRef}
      className={`relative ml-12 md:ml-12 transition-all duration-500 ${isOver ? 'scale-105 opacity-100' : 'opacity-100 hover:opacity-100'}`}
    >
      <div className={`absolute left-[-42px] md:left-[-102px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-4 border-dashed transition-all duration-500 ${isOver ? 'border-primary bg-primary/20 scale-125 animate-pulse' : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900 shadow-xl'}`} />
      <div
        className={`border-4 border-dashed rounded-[3rem] p-10 flex items-center justify-center cursor-pointer transition-all duration-500 ${isOver
          ? 'border-primary bg-primary/20 shadow-2xl shadow-primary/20'
          : 'border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/80 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:shadow-2xl'}`}
        onClick={onAdd}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${isOver ? 'bg-primary text-white scale-110 rotate-90' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
            <Plus size={28} />
          </div>
          <div className="text-center">
            <span className={`text-[12px] font-black uppercase tracking-[0.3em] block transition-colors ${isOver ? 'text-primary' : 'text-slate-500'}`}>
              {isOver ? 'Initiating Reschedule' : 'Drop activity here to reschedule'}
            </span>
            {!isOver && (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block opacity-60">Opens Edit Terminal</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
