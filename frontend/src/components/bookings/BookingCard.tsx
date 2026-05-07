import React from 'react';
import { 
  Plane, Hotel, Car, Activity as ActivityIcon,
  MapPin, Calendar, Clock3, MoreVertical, 
  Archive, Trash2, Plus
} from 'lucide-react';
import { BookingCategory } from '../../services/booking.service';
import type { BookingResponse } from '../../services/booking.service';
import Button from '../shared/Button';

interface BookingCardProps {
  booking: BookingResponse;
  onEdit: (booking: BookingResponse) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onUploadDocument: (bookingId: string) => void;
  onViewDocuments: (booking: BookingResponse) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, onEdit, onDelete, onArchive, onUploadDocument, onViewDocuments 
}) => {
  const getCategoryIcon = (category: BookingCategory) => {
    switch (category) {
      case BookingCategory.Flight: return <Plane className="w-6 h-6" />;
      case BookingCategory.Accommodation: return <Hotel className="w-6 h-6" />;
      case BookingCategory.Transportation: return <Car className="w-6 h-6" />;
      case BookingCategory.Activity: return <ActivityIcon className="w-6 h-6" />;
      default: return <ActivityIcon className="w-6 h-6" />;
    }
  };

  const getCategoryImage = (category: BookingCategory) => {
    const fallbacks: Record<string, string[]> = {
      Flight: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=1200'
      ],
      Accommodation: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1200'
      ],
      Transportation: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200'
      ],
      Activity: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&q=80&w=1200'
      ]
    };

    const categoryList = fallbacks[category] || [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200'
    ];

    return categoryList[0];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="group glass rounded-[3.5rem] p-8 border border-border card-hover flex flex-col lg:flex-row gap-10">
      <div className="w-full lg:w-80 h-56 rounded-[2.5rem] overflow-hidden flex-shrink-0 relative border border-border">
        <img 
          src={getCategoryImage(booking.category)} 
          alt={booking.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200';
          }}
        />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-6 left-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg">
            {getCategoryIcon(booking.category)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between py-2">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h3 className="text-3xl font-black text-foreground tracking-tight">{booking.title}</h3>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                booking.status === 'Confirmed' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : booking.status === 'Cancelled'
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
                {booking.status}
              </span>
            </div>
            <p className="text-xl font-bold text-muted-foreground flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-primary/60" />
              {booking.location || 'No location set'}
              {booking.address && (
                <span className="ml-2 text-slate-300 dark:text-slate-600 font-medium text-sm">• {booking.address}</span>
              )}
            </p>
            {booking.description && (
               <div className="mt-4 flex items-center gap-3">
                  <div className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {booking.category === BookingCategory.Flight ? 'Seat' : 
                         booking.category === BookingCategory.Accommodation ? 'Room' : 
                         booking.category === BookingCategory.Transportation ? 'Vehicle' : 
                         'Detail'}: {booking.description}
                     </span>
                  </div>
                  {booking.contactInfo && (
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {booking.contactInfo}
                     </span>
                  )}
               </div>
            )}
          </div>
          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
               {booking.category === BookingCategory.Flight ? 'Flight Number' : 'Confirmation No.'}
            </p>
            <p className="text-2xl font-black text-primary tracking-tight leading-none">{booking.confirmationCode || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-12 p-8 bg-muted/50 rounded-[2.5rem] border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {booking.category === BookingCategory.Accommodation ? 'Check-in' : 
                 booking.category === BookingCategory.Activity ? 'Event Date' : 'Departure'}
              </p>
              <p className="text-sm font-black text-foreground">{formatDate(booking.startDate)}</p>
            </div>
          </div>
          
          {booking.category === BookingCategory.Accommodation ? (
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-12">
               <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                  <Clock3 className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Check-out</p>
                  <p className="text-sm font-black text-foreground">{formatDate(booking.endDate)}</p>
               </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-12">
               <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                  <Clock3 className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time</p>
                  <p className="text-sm font-black text-foreground">{formatTime(booking.startDate)}</p>
               </div>
            </div>
          )}

          {booking.cost && (
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-12">
              <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                <span className="text-lg font-black text-primary">{booking.currency === 'EUR' ? '€' : '$'}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   {booking.category === BookingCategory.Accommodation ? 'Total Stay' : 'Incurred Cost'}
                </p>
                <p className="text-sm font-black text-foreground">{booking.cost} {booking.currency}</p>
              </div>
            </div>
          )}
          <div className="ml-auto flex items-center gap-5">
            <Button 
              variant="outline" 
              className="rounded-2xl border-border text-muted-foreground font-black uppercase tracking-widest hover:bg-card h-14 px-8 text-xs"
              onClick={() => onViewDocuments(booking)}
            >
              Documents ({booking.documents?.length || 0})
            </Button>
            <Button 
              variant="primary" 
              className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-10 font-black uppercase tracking-widest text-xs"
              onClick={() => onEdit(booking)}
            >
              Modify
            </Button>
            
            {/* Premium Action Console - Hardened Mission Control */}
            <div className="relative group/menu">
              <button className="h-14 w-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 transition-all active:scale-95 shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-xl">
                <MoreVertical className="w-6 h-6" />
              </button>
              
              <div className="absolute right-0 top-full mt-0.5 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-[40px] rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 py-4 opacity-0 scale-95 translate-y-2 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-50 overflow-hidden ring-1 ring-black/10">
                <div className="px-8 py-3 border-b border-slate-100 dark:border-white/5 mb-3 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">Mission Control</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                  </div>
                </div>
                
                <div className="px-3 space-y-1">
                  <button 
                    onClick={() => onUploadDocument(booking.id)}
                    className="w-full px-5 py-4 text-left flex items-center gap-5 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-[1.5rem] transition-all group/item"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 shadow-sm border border-indigo-500/5">
                      <Plus className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest">Add Document</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Upload manifest or tickets</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => onArchive(booking.id, !booking.isArchived)}
                    className="w-full px-5 py-4 text-left flex items-center gap-5 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-[1.5rem] transition-all group/item"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 shadow-sm border border-emerald-500/5">
                      <Archive className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {booking.isArchived ? 'Restore Record' : 'Archive Entry'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Move to historical manifest</span>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-white/5 my-3 mx-5" />

                  <button 
                    onClick={() => onDelete(booking.id)}
                    className="w-full px-5 py-4 text-left flex items-center gap-5 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 rounded-[1.5rem] transition-all group/item"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300 shadow-sm border border-rose-500/5">
                      <Trash2 className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase tracking-widest">Delete Record</span>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Permanent data removal</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
