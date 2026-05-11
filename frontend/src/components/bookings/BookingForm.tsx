import React, { useState, useEffect } from 'react';
import { Plane, Hotel, Car, Activity as ActivityIcon, X } from 'lucide-react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import { BookingCategory, BookingStatus } from '../../services/booking.service';
import type { CreateBookingRequest, UpdateBookingRequest, BookingResponse } from '../../services/booking.service';
import { tripService } from '../../services/trip.service';
import type { TripResponse } from '../../services/trip.service';
import itineraryService from '../../services/itinerary.service';
import type { ActivityResponse } from '../../services/itinerary.service';

interface BookingFormProps {
  initialData?: BookingResponse;
  onSubmit: (data: CreateBookingRequest | UpdateBookingRequest) => Promise<void>;
  onCancel: () => void;
  tripId?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ initialData, onSubmit, onCancel, tripId: initialTripId }) => {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateBookingRequest>>({
    tripId: initialTripId || initialData?.tripId || '',
    activityId: initialData?.activityId || '',
    category: initialData?.category || BookingCategory.Flight,
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || BookingStatus.Pending,
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    timeZone: initialData?.timeZone || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    provider: initialData?.provider || '',
    confirmationCode: initialData?.confirmationCode || '',
    cost: initialData?.cost || 0,
    currency: initialData?.currency || 'USD',
    notes: initialData?.notes || '',
    contactInfo: initialData?.contactInfo || '',
  });

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const fetchedTrips = await tripService.getTrips();
        setTrips(fetchedTrips);
        if (!formData.tripId && fetchedTrips.length > 0) {
          setFormData(prev => ({ ...prev, tripId: fetchedTrips[0].id }));
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!formData.tripId) return;
      try {
        // Fetch itineraries for the trip, then days, then activities
        // Simplified for now: just fetch itineraries and flatten activities
        const itineraries = await itineraryService.getItinerariesByTrip(formData.tripId);
        const allActivities: ActivityResponse[] = [];
        for (const itinerary of itineraries) {
          const fullItinerary = await itineraryService.getItinerary(itinerary.id);
          fullItinerary.days.forEach(day => {
            allActivities.push(...day.activities);
          });
        }
        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };
    fetchActivities();
  }, [formData.tripId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) : value
    }));
  };

  const handleCategoryChange = (category: BookingCategory) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData as CreateBookingRequest);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    [BookingCategory.Flight]: <Plane className="w-5 h-5" />,
    [BookingCategory.Accommodation]: <Hotel className="w-5 h-5" />,
    [BookingCategory.Transportation]: <Car className="w-5 h-5" />,
    [BookingCategory.Activity]: <ActivityIcon className="w-5 h-5" />,
  };

  return (
    <div className="bg-white dark:bg-card rounded-[2.5rem] p-8 max-w-4xl w-full mx-auto shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          {initialData ? 'Edit Booking' : 'Add New Booking'}
        </h2>
        <button onClick={onCancel} className="p-3 hover:bg-muted rounded-2xl transition-colors">
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Category Selector */}
        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 block">Select Category</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(BookingCategory).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all ${
                  formData.category === cat
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                    : 'border-border bg-muted/50 text-muted-foreground hover:border-border'
                }`}
              >
                {categoryIcons[cat]}
                <span className="text-xs font-black uppercase tracking-widest">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trip Selection */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Trip</label>
            <div className="relative">
              <select
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                className="w-full h-14 bg-muted border-2 border-border rounded-2xl px-6 font-bold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-card outline-none transition-all duration-300 appearance-none shadow-sm"
                required
              >
                <option value="">Select a trip</option>
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>{trip.title}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Activity Link (Optional) */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Link to Activity (Optional)</label>
            <div className="relative">
              <select
                name="activityId"
                value={formData.activityId}
                onChange={handleChange}
                className="w-full h-14 bg-muted border-2 border-border rounded-2xl px-6 font-bold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-card outline-none transition-all duration-300 appearance-none shadow-sm"
              >
                <option value="">None</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>{activity.title}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Booking Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={
              formData.category === BookingCategory.Flight ? "e.g. Flight to London (BA123)" :
              formData.category === BookingCategory.Accommodation ? "e.g. Hilton Paris Suite" :
              formData.category === BookingCategory.Transportation ? "e.g. Hertz Car Rental" :
              "e.g. Wine Tasting Tour"
            }
            required
          />
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Booking Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-14 bg-muted border-none rounded-2xl px-6 font-bold text-foreground focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              {Object.values(BookingStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Provider / Company"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            placeholder={
              formData.category === BookingCategory.Flight ? "e.g. British Airways" :
              formData.category === BookingCategory.Accommodation ? "e.g. Marriott" :
              "e.g. Enterprise, Viator"
            }
          />
          <Input
            label="Confirmation / Booking Ref"
            name="confirmationCode"
            value={formData.confirmationCode}
            onChange={handleChange}
            placeholder="e.g. ABC123XYZ"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label={
              formData.category === BookingCategory.Flight ? "Departure Time" :
              formData.category === BookingCategory.Accommodation ? "Check-in Date" :
              "Start Date & Time"
            }
            name="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={handleChange}
          />
          <Input
            label={
              formData.category === BookingCategory.Flight ? "Arrival Time" :
              formData.category === BookingCategory.Accommodation ? "Check-out Date" :
              "End Date & Time"
            }
            name="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Location / Address"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Heathrow Terminal 5, 123 Baker St"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="w-28">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full h-14 bg-muted border-none rounded-2xl px-4 font-bold text-foreground focus:ring-2 focus:ring-primary/20 appearance-none text-center"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Notes & Special Requests</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full bg-muted border-none rounded-[2rem] p-6 font-bold text-foreground focus:ring-2 focus:ring-primary/20"
            placeholder="Any additional details, seat numbers, or meal preferences..."
          />
        </div>

        <div className="flex items-center gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest border-border text-muted-foreground"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-[2] h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            disabled={loading}
          >
            {loading ? 'Saving...' : initialData ? 'Update Booking' : 'Create Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
