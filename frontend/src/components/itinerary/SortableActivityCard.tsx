import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActivityCard from './ActivityCard';
import type { ActivityResponse } from '../../services/itinerary.service';

interface SortableActivityCardProps {
  activity: ActivityResponse;
  onEdit?: (activity: ActivityResponse) => void;
  onDelete?: (activityId: string) => void;
  isDragging?: boolean;
  order: number;
}

const SortableActivityCard = ({
  activity,
  onEdit,
  onDelete,
  isDragging = false,
  order
}: SortableActivityCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    cursor: isSortableDragging ? 'grabbing' : 'grab'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-10' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div
          className="flex-shrink-0 mt-6 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-slate-200 transition-colors">
            <svg 
              className="w-4 h-4 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
        </div>

        {/* Order indicator */}
        <div className="flex-shrink-0 mt-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-black text-sm">{order}</span>
          </div>
        </div>

        {/* Activity card */}
        <div className="flex-grow">
          <ActivityCard
            activity={activity}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Visual feedback for dragging */}
      {isSortableDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/30" />
      )}
    </div>
  );
};

export default SortableActivityCard;
