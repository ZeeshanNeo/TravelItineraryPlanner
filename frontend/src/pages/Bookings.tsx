import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Download, Plus, Filter, Loader2,
  Inbox
} from 'lucide-react';
import Button from '../components/shared/Button';
import Layout from '../components/layout/Layout';
import { bookingService, BookingCategory } from '../services/booking.service';
import type { BookingResponse, CreateBookingRequest, UpdateBookingRequest } from '../services/booking.service';
import BookingCard from '../components/bookings/BookingCard';
import BookingForm from '../components/bookings/BookingForm';
import DocumentList from '../components/bookings/DocumentList';
import { useSearch } from '../context/SearchContext';

const Bookings = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingResponse | undefined>();
  const [showDocuments, setShowDocuments] = useState<string | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<BookingResponse[]>([]);
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchBookings();
  }, [filter, categoryFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (tripId) params.tripId = tripId;
      if (filter !== 'all') params.status = filter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      
      const data = await bookingService.getBookings(params);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = bookings.filter(b => 
        b.title.toLowerCase().includes(query) || 
        (b.provider && b.provider.toLowerCase().includes(query)) ||
        (b.confirmationCode && b.confirmationCode.toLowerCase().includes(query)) ||
        (b.notes && b.notes.toLowerCase().includes(query))
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  }, [searchQuery, bookings]);

  const handleCreateBooking = async (data: CreateBookingRequest | UpdateBookingRequest) => {
    try {
      if (editingBooking) {
        await bookingService.updateBooking(editingBooking.id, data as UpdateBookingRequest);
      } else {
        await bookingService.createBooking(data as CreateBookingRequest);
      }
      setShowForm(false);
      setEditingBooking(undefined);
      fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await bookingService.deleteBooking(id);
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleArchiveBooking = async (id: string, isArchived: boolean) => {
    try {
      await bookingService.archiveBooking(id, isArchived);
      fetchBookings();
    } catch (error) {
      console.error('Error archiving booking:', error);
    }
  };

  const openEditForm = (booking: BookingResponse) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-foreground tracking-tighter leading-none">
              {tripId ? 'Trip Logistics' : 'Your Bookings'}
            </h1>
            <p className="text-muted-foreground mt-4 text-xl font-medium">
              {tripId ? 'Management manifest for your active journey.' : 'Manage tickets, reservations, and confirmations.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="h-16 px-8 rounded-2xl border-border text-muted-foreground font-black uppercase tracking-widest hover:bg-muted"
            >
              <Download className="w-5 h-5 mr-2" />
              Calendar Sync
            </Button>
            <Button 
              variant="primary" 
              className="h-16 px-10 rounded-2xl shadow-2xl shadow-primary/30 flex items-center text-lg font-black uppercase tracking-widest"
              onClick={() => {
                setEditingBooking(undefined);
                setShowForm(true);
              }}
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Booking
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {['all', 'Confirmed', 'Pending', 'Cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                  filter === f 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
                    : 'bg-card text-muted-foreground border-border hover:border-border shadow-sm'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Category:
            </span>
            {['all', ...Object.values(BookingCategory)].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  categoryFilter === cat 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-card text-muted-foreground border-border hover:border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-10 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">Fetching your bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 gap-8 glass rounded-[4rem] border-2 border-dashed border-border">
              <div className="w-32 h-32 bg-muted rounded-[3rem] flex items-center justify-center text-slate-200">
                <Inbox className="w-16 h-16" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-300 uppercase tracking-widest">
                  {searchQuery ? 'No results match' : 'No bookings found'}
                </p>
                <p className="text-muted-foreground font-bold mt-2">
                  {searchQuery ? `Nothing found for "${searchQuery}"` : 'Try adjusting your filters or add a new booking.'}
                </p>
              </div>
              {!searchQuery && (
                <Button 
                  variant="primary" 
                  className="h-16 px-10 rounded-2xl"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Add Your First Booking
                </Button>
              )}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onEdit={openEditForm}
                onDelete={handleDeleteBooking}
                onArchive={handleArchiveBooking}
                onUploadDocument={(bookingId) => setShowDocuments(bookingId)}
                onViewDocuments={(booking) => setShowDocuments(booking.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <BookingForm 
            initialData={editingBooking}
            onSubmit={handleCreateBooking}
            onCancel={() => {
              setShowForm(false);
              setEditingBooking(undefined);
            }}
            tripId={tripId}
          />
        </div>
      )}

      {showDocuments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <DocumentList 
            bookingId={showDocuments}
            onClose={() => setShowDocuments(null)}
          />
        </div>
      )}
    </Layout>
  );
};

export default Bookings;
