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
    switch (category) {
      case BookingCategory.Flight: return 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=800';
      case BookingCategory.Accommodation: return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
      case BookingCategory.Transportation: return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800';
      case BookingCategory.Activity: return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800';
      default: return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800';
    }
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
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Confirmation No.</p>
            <p className="text-2xl font-black text-primary tracking-tight leading-none">{booking.confirmationCode || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-12 p-8 bg-muted/50 rounded-[2.5rem] border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</p>
              <p className="text-sm font-black text-foreground">{formatDate(booking.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
              <Clock3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time</p>
              <p className="text-sm font-black text-foreground">{formatTime(booking.startDate)}</p>
            </div>
          </div>
          {booking.cost && (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                <span className="text-lg font-black text-primary">{booking.currency === 'EUR' ? '€' : '$'}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cost</p>
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
            
            {/* Actions Menu */}
            <div className="relative group/menu">
              <button className="p-3 text-slate-300 hover:text-primary transition-colors">
                <MoreVertical className="w-6 h-6" />
              </button>
              <div className="absolute right-0 bottom-full mb-4 w-56 bg-card rounded-3xl shadow-2xl border border-border py-4 opacity-0 scale-95 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all z-20">
                <button 
                  onClick={() => onUploadDocument(booking.id)}
                  className="w-full px-6 py-3 text-left flex items-center gap-4 hover:bg-muted transition-colors"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Add Document</span>
                </button>
                <button 
                  onClick={() => onArchive(booking.id, !booking.isArchived)}
                  className="w-full px-6 py-3 text-left flex items-center gap-4 hover:bg-muted transition-colors"
                >
                  <Archive className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                    {booking.isArchived ? 'Restore' : 'Archive'}
                  </span>
                </button>
                <button 
                  onClick={() => onDelete(booking.id)}
                  className="w-full px-6 py-3 text-left flex items-center gap-4 hover:bg-muted transition-colors text-rose-500"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
