import { useState } from 'react';
import {
  Clock, MapPin, DollarSign,
  MoreVertical, Edit, Trash2,
  Plane, Hotel, Car, Utensils, Eye, ShoppingBag, Music
} from 'lucide-react';
import type { ActivityResponse } from '../../services/itinerary.service';

interface ActivityCardProps {
  activity: ActivityResponse;
  onEdit?: (activity: ActivityResponse) => void;
  onDelete?: (activityId: string) => void;
  draggable?: boolean;
  isDragging?: boolean;
}

const ActivityCard = ({ activity, onEdit, onDelete, draggable = false, isDragging = false }: ActivityCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'flight': return <Plane className="w-4 h-4" />;
      case 'accommodation': return <Hotel className="w-4 h-4" />;
      case 'transportation': return <Car className="w-4 h-4" />;
      case 'food': return <Utensils className="w-4 h-4" />;
      case 'sightseeing': return <Eye className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'entertainment': return <Music className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (cost?: number, currency?: string) => {
    if (!cost) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost);
  };

  return (
    <div 
      className={`bg-card rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-border transition-all hover:shadow-xl hover:shadow-slate-300/50 ${
        isDragging ? 'opacity-50' : ''
      } ${draggable ? 'cursor-move' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            activity.activityType.toLowerCase() === 'flight' ? 'bg-blue-100 text-blue-600' :
            activity.activityType.toLowerCase() === 'accommodation' ? 'bg-purple-100 text-purple-600' :
            activity.activityType.toLowerCase() === 'food' ? 'bg-emerald-100 text-emerald-600' :
            activity.activityType.toLowerCase() === 'sightseeing' ? 'bg-amber-100 text-amber-600' :
            'bg-muted text-muted-foreground'
          }`}>
            {getActivityIcon(activity.activityType)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-foreground">{activity.title}</h3>
              {activity.isFlexible && (
                <span className="px-2 py-1 text-xs font-black uppercase tracking-widest bg-yellow-100 text-yellow-700 rounded-full">
                  Flexible
                </span>
              )}
            </div>
            
            {activity.description && (
              <p className="text-muted-foreground mt-2">{activity.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                  {activity.travelTimeMinutes && (
                    <span className="text-muted-foreground ml-2">
                      (+{activity.travelTimeMinutes}min travel)
                    </span>
                  )}
                </span>
              </div>
              
              {activity.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{activity.location}</span>
                </div>
              )}
              
              {activity.cost !== undefined && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatCurrency(activity.cost, activity.currency)}</span>
                </div>
              )}
            </div>
            
            {activity.bookingReference && (
              <div className="mt-3">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Booking Ref:</span>
                <span className="text-sm font-medium text-foreground ml-2">{activity.bookingReference}</span>
              </div>
            )}
          </div>
        </div>
        
        {(onEdit || onDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl shadow-2xl shadow-slate-300/50 border border-border z-10">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(activity);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted rounded-t-xl transition-colors"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">Edit Activity</span>
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(activity.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 rounded-b-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium">Delete Activity</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {activity.notes && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground italic">{activity.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
