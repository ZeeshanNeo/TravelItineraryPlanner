import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ActivityCard from './ActivityCard';
import type { ActivityResponse } from '../../services/itinerary.service';

interface SortableActivityCardProps {
  activity: ActivityResponse;
  onEdit?: (activity: ActivityResponse) => void;
  onDelete?: (activityId: string) => void;
}

const SortableActivityCard = ({
  activity,
  onEdit,
  onDelete,
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
    opacity: isSortableDragging ? 0.3 : 1,
    zIndex: isSortableDragging ? 50 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all ${isSortableDragging ? 'scale-95' : 'hover:translate-x-1'}`}
    >
      <div className="flex items-center gap-4">
        {/* Activity content */}
        <div className="flex-grow min-w-0">
          <ActivityCard
            activity={activity}
            onEdit={onEdit}
            onDelete={onDelete}
            draggable={true}
            dragHandleProps={{ ...attributes, ...listeners }}
          />
        </div>
      </div>

      {/* Visual feedback for dragging */}
      {isSortableDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/20 pointer-events-none" />
      )}
    </div>
  );
};

export default SortableActivityCard;
