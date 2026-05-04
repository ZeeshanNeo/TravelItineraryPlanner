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
import { Plus, List, BarChart3, Car } from 'lucide-react';
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
  date
}: TimelineProps) => {
  const [localActivities, setLocalActivities] = useState<ActivityResponse[]>(activities);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    setLocalActivities(activities);
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
    setIsDragging(false);

    if (over && active.id !== over.id) {
      const oldIndex = localActivities.findIndex(activity => activity.id === active.id);
      const newIndex = localActivities.findIndex(activity => activity.id === over.id);
      
      const newActivities = arrayMove(localActivities, oldIndex, newIndex);
      setLocalActivities(newActivities);
      
      // Update order property for each activity
      const updatedActivities = newActivities.map((activity, index) => ({
        ...activity,
        order: index
      }));
      
      // Call the callback with new order
      if (onActivitiesReorder) {
        onActivitiesReorder(updatedActivities.map(activity => activity.id));
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to convert time string to hours for timeline positioning
  const timeToPosition = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + minutes / 60;
  };

  // Calculate activity duration in hours
  const calculateDuration = (startTime: string, endTime: string) => {
    const startPos = timeToPosition(startTime);
    const endPos = timeToPosition(endTime);
    return Math.max(0.5, endPos - startPos); // Minimum 0.5 hour for visibility
  };

  // Get color based on activity type
  const getActivityColor = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'flight': return 'bg-blue-500';
      case 'accommodation': return 'bg-purple-500';
      case 'transportation': return 'bg-indigo-500';
      case 'food': return 'bg-emerald-500';
      case 'sightseeing': return 'bg-amber-500';
      case 'shopping': return 'bg-pink-500';
      case 'entertainment': return 'bg-red-500';
      default: return 'bg-muted0';
    }
  };

  return (
    <div className="space-y-8">
      {(dayTitle || date) && (
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">{dayTitle || 'Day Timeline'}</h2>
              {date && (
                <p className="text-primary-100 mt-2 font-medium">{formatDate(date)}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{localActivities.length}</p>
              <p className="text-primary-100 text-sm font-medium uppercase tracking-widest">Activities</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-foreground">Daily Schedule</h3>
            <div className="flex bg-muted rounded-2xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4 inline mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-sm transition-all ${viewMode === 'timeline' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Timeline
              </button>
            </div>
          </div>
          {onAddActivity && (
            <Button
              variant="primary"
              onClick={onAddActivity}
              className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          )}
        </div>

        {localActivities.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center border-2 border-dashed border-border">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3">No activities planned</h3>
            <p className="text-muted-foreground mb-6">Add your first activity to start building your itinerary</p>
            {onAddActivity && (
              <Button
                variant="primary"
                onClick={onAddActivity}
                className="rounded-2xl px-8 py-4 font-black uppercase tracking-widest"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Activity
              </Button>
            )}
          </div>
        ) : viewMode === 'list' ? (
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
              <div className="space-y-0">
                {localActivities.map((activity, index) => (
                  <div key={activity.id}>
                    {index > 0 && (
                      <div className="flex items-center gap-4 ml-12 py-2">
                        <div className="w-0.5 h-12 bg-slate-200 ml-5" />
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full border border-border">
                          <Car size={12} />
                          Travel: {estimateTravelTime(localActivities[index-1].location, activity.location)} min
                        </div>
                      </div>
                    )}
                    <SortableActivityCard
                      activity={activity}
                      onEdit={onActivityEdit}
                      onDelete={onActivityDelete}
                      isDragging={isDragging}
                      order={index + 1}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          // Visual Timeline View
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="mb-6">
              <h4 className="text-lg font-black text-foreground mb-4">24-Hour Timeline</h4>
              <div className="relative h-8 bg-muted rounded-full">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="absolute top-0 bottom-0 w-px bg-slate-300" style={{ left: `${(hour / 24) * 100}%` }}>
                    <span className="absolute -top-6 text-xs text-muted-foreground font-medium" style={{ left: '-10px' }}>
                      {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative h-96 bg-muted rounded-2xl border border-border p-4">
              {localActivities.map((activity, index) => {
                const startPos = timeToPosition(activity.startTime);
                const duration = calculateDuration(activity.startTime, activity.endTime);
                const topPosition = (startPos / 24) * 100;
                const height = (duration / 24) * 100;
                
                return (
                  <div
                    key={activity.id}
                    className={`absolute rounded-xl p-4 shadow-md border ${getActivityColor(activity.activityType)} border-white text-white`}
                    style={{
                      left: '10px',
                      right: '10px',
                      top: `${topPosition}%`,
                      height: `${height}%`,
                      minHeight: '40px',
                      zIndex: 10 - index
                    }}
                    onClick={() => onActivityEdit?.(activity)}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black">{activity.title}</span>
                          {activity.isFlexible && (
                            <span className="text-xs bg-white/30 px-2 py-1 rounded-full font-black">Flexible</span>
                          )}
                        </div>
                        <div className="text-sm opacity-90 mt-1">
                          {activity.startTime} - {activity.endTime}
                          {activity.travelTimeMinutes && (
                            <span className="ml-2">(+{activity.travelTimeMinutes}min travel)</span>
                          )}
                        </div>
                        {activity.location && (
                          <div className="text-sm opacity-80 mt-1">{activity.location}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black">{activity.activityType}</div>
                        {activity.cost !== undefined && (
                          <div className="text-sm opacity-90">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: activity.currency || 'USD',
                              minimumFractionDigits: 0
                            }).format(activity.cost)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Time markers */}
              {Array.from({ length: 25 }).map((_, hour) => (
                <div
                  key={hour}
                  className="absolute w-full h-px bg-slate-300/50"
                  style={{ top: `${(hour / 24) * 100}%` }}
                >
                  <span className="absolute left-0 -ml-12 text-xs text-muted-foreground font-medium">
                    {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-2xl">
                <div className="text-2xl font-black text-foreground">
                  {localActivities.length}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-2">Total Activities</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-2xl">
                <div className="text-2xl font-black text-foreground">
                  {localActivities.filter(a => a.travelTimeMinutes && a.travelTimeMinutes > 0).length}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-2">With Travel Time</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-2xl">
                <div className="text-2xl font-black text-foreground">
                  {localActivities.filter(a => a.isFlexible).length}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-2">Flexible</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-2xl">
                <div className="text-2xl font-black text-foreground">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(localActivities.reduce((total, activity) => total + (activity.cost || 0), 0))}
                </div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-2">Total Cost</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {localActivities.length > 0 && (
        <div className="bg-muted rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">
                {localActivities.filter(a => a.activityType.toLowerCase() === 'flight').length}
              </p>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-2">Flights</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">
                {localActivities.filter(a => a.activityType.toLowerCase() === 'accommodation').length}
              </p>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-2">Accommodations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">
                {localActivities.reduce((total, activity) => total + (activity.cost || 0), 0).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </p>
              <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest mt-2">Total Cost</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
