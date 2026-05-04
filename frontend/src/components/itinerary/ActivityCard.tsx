import { useState } from 'react';
import {
  Clock, MapPin, DollarSign,
  MoreVertical, Edit, Trash2,
  Plane, Hotel, Car, Utensils, Eye, ShoppingBag, Music, GripVertical, CheckCircle2
} from 'lucide-react';
import type { ActivityResponse } from '../../services/itinerary.service';

interface ActivityCardProps {
  activity: ActivityResponse;
  onEdit?: (activity: ActivityResponse) => void;
  onDelete?: (activityId: string) => void;
  draggable?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const ActivityCard = ({ 
  activity, 
  onEdit, 
  onDelete, 
  draggable = false, 
  isDragging = false,
  dragHandleProps 
}: ActivityCardProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const getActivityStyles = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'flight': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Plane className="w-5 h-5" />, border: 'border-blue-100', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109c055?auto=format&fit=crop&q=80&w=300' };
      case 'accommodation': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Hotel className="w-5 h-5" />, border: 'border-purple-100', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=300' };
      case 'transportation': return { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: <Car className="w-5 h-5" />, border: 'border-indigo-100', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=300' };
      case 'food': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <Utensils className="w-5 h-5" />, border: 'border-emerald-100', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=300' };
      case 'sightseeing': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Eye className="w-5 h-5" />, border: 'border-amber-100', img: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=300' };
      case 'shopping': return { bg: 'bg-pink-50', text: 'text-pink-600', icon: <ShoppingBag className="w-5 h-5" />, border: 'border-pink-100', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300' };
      case 'entertainment': return { bg: 'bg-red-50', text: 'text-red-600', icon: <Music className="w-5 h-5" />, border: 'border-red-100', img: 'https://images.unsplash.com/photo-1514525253361-bee24387052b?auto=format&fit=crop&q=80&w=300' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: <Clock className="w-5 h-5" />, border: 'border-slate-100', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=300' };
    }
  };

  const styles = getActivityStyles(activity.activityType);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '09:00 AM';
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
      className={`group/card premium-glass bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Visual Element (Image) */}
        <div className="relative w-full md:w-48 h-32 md:h-auto overflow-hidden shrink-0">
           <img 
             src={styles.img} 
             alt={activity.title}
             className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
           <div className="absolute top-4 left-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-xl shadow-lg ${styles.bg} ${styles.text}`}>
                 {styles.icon}
              </div>
           </div>
           
           {/* Drag Handle Overlay */}
           {draggable && (
             <div 
               {...dragHandleProps}
               className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
             >
                <GripVertical className="text-white w-8 h-8" />
             </div>
           )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6 md:p-8">
           <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                 <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                      {activity.title}
                    </h3>
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-full border border-blue-100 dark:border-blue-500/20">
                       <CheckCircle2 size={12} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Confirmed</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14} className="text-rose-500" />
                    <span className="text-xs font-bold truncate max-w-[200px]">{activity.location || 'Location TBD'}</span>
                 </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 z-20 overflow-hidden py-1">
                    {onEdit && (
                      <button
                        onClick={() => { onEdit(activity); setShowMenu(false); }}
                        className="flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-bold text-sm text-slate-700 dark:text-slate-200"
                      >
                        <Edit className="w-4 h-4 text-indigo-500" />
                        Edit Experience
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => { onDelete(activity.id); setShowMenu(false); }}
                        className="flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-rose-50 text-rose-600 transition-colors font-bold text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Archive Activity
                      </button>
                    )}
                  </div>
                )}
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-50 dark:border-white/5">
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                       {formatTime(activity.startTime)}
                    </span>
                 </div>
              </div>

              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget</span>
                 <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                       {formatCurrency(activity.cost, activity.currency)}
                    </span>
                 </div>
              </div>

              <div className="flex flex-col gap-1 hidden sm:flex">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification</span>
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit ${styles.bg} ${styles.text}`}>
                    {activity.activityType}
                 </span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
