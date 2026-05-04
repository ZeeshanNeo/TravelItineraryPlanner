import React, { useState, useEffect } from 'react';
import {
  Plane, Hotel, Car, Activity as ActivityIcon, X,
  ShieldCheck, Globe, CreditCard
} from 'lucide-react';
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
      [name]: name === 'cost' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleCategoryChange = (category: BookingCategory) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sanitize data: ensure empty strings for IDs are sent as null
      const submissionData = {
        ...formData,
        activityId: formData.activityId === '' ? null : formData.activityId,
        tripId: formData.tripId === '' ? null : formData.tripId,
      };
      await onSubmit(submissionData as CreateBookingRequest);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    [BookingCategory.Flight]: <Plane className="w-6 h-6" />,
    [BookingCategory.Accommodation]: <Hotel className="w-6 h-6" />,
    [BookingCategory.Transportation]: <Car className="w-6 h-6" />,
    [BookingCategory.Activity]: <ActivityIcon className="w-6 h-6" />,
  };

  return (
    <div className="relative w-full max-w-6xl flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 dark:border-white/5">
      {/* Modal Sidebar - Visual Context */}
      <div className="hidden lg:flex lg:w-96 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-white/5 p-14 flex-col justify-between shrink-0">
        <div>
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-primary shadow-[0_10px_25px_rgba(0,0,0,0.8)] mb-10 rotate-[-6deg]">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-6">
            {initialData ? 'Update Logistics' : 'Secure Booking'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">
            Consolidate your travel logistics in one secure place. Link bookings to your itinerary for a seamless journey.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Status</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Global Repository</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Tracking</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Active Budget Link</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Content - Form Fields */}
      <div className="flex-1 flex flex-col min-w-0 max-h-[90vh]">
        {/* Header for Mobile/Tablet */}
        <div className="lg:hidden p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {initialData ? 'Edit Booking' : 'Add Booking'}
          </h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-14 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Category Selector */}
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 block ml-1">Logistics Classification</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {Object.values(BookingCategory).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${formData.category === cat
                      ? 'border-primary bg-primary/5 text-primary shadow-2xl shadow-primary/10'
                      : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    <div className={`transition-transform duration-500 ${formData.category === cat ? 'scale-110' : ''}`}>
                      {categoryIcons[cat]}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Trip Selection */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Associate with Trip</label>
                  <select
                    name="tripId"
                    value={formData.tripId}
                    onChange={handleChange}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                    required
                  >
                    <option value="">Select a journey</option>
                    {trips.map(trip => (
                      <option key={trip.id} value={trip.id}>{trip.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Connect to Activity</label>
                  <select
                    name="activityId"
                    value={formData.activityId}
                    onChange={handleChange}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                  >
                    <option value="">Standalone Booking</option>
                    {activities.map(activity => (
                      <option key={activity.id} value={activity.id}>{activity.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <Input
                    label={`${formData.category} Name / Title`}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={
                      formData.category === BookingCategory.Flight ? "e.g. Flight to Tokyo" :
                        formData.category === BookingCategory.Accommodation ? "e.g. Park Hyatt Tokyo" :
                          formData.category === BookingCategory.Transportation ? "e.g. Shinkansen to Osaka" :
                            "e.g. Mount Fuji Tour"
                    }
                    required
                  />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Confirmation Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                    >
                      {Object.values(BookingStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <Input
                    label={
                      formData.category === BookingCategory.Flight ? "Airline / Operator" :
                        formData.category === BookingCategory.Accommodation ? "Hotel Chain" :
                          formData.category === BookingCategory.Transportation ? "Transit Company" :
                            "Service Provider"
                    }
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    placeholder="e.g. Japan Airlines"
                  />
                  <Input
                    label={
                      formData.category === BookingCategory.Flight ? "Flight Number" :
                        "Confirmation Reference"
                    }
                    name="confirmationCode"
                    value={formData.confirmationCode}
                    onChange={handleChange}
                    placeholder="e.g. JAL-987X"
                  />
                </div>

                {/* Dynamic Category Specific Section */}
                <div className="p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Category Intelligence</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Input
                      label={
                        formData.category === BookingCategory.Flight ? "Departure Terminal / Gate" :
                          formData.category === BookingCategory.Accommodation ? "Property Location / Area" :
                            formData.category === BookingCategory.Transportation ? "Pick-up Point" :
                              "Meeting Point"
                      }
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Narita Terminal 2"
                    />
                    <Input
                      label={
                        formData.category === BookingCategory.Flight ? "Arrival Terminal" :
                          formData.category === BookingCategory.Accommodation ? "Full Address" :
                            formData.category === BookingCategory.Transportation ? "Destination" :
                              "Activity Address"
                      }
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Shinjuku City, Tokyo"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Input
                      label={
                        formData.category === BookingCategory.Flight ? "Seat Assignment" :
                          formData.category === BookingCategory.Accommodation ? "Room Category / Number" :
                            formData.category === BookingCategory.Transportation ? "Vehicle / Seat Details" :
                              "Participants / Tier"
                      }
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={
                        formData.category === BookingCategory.Flight ? "e.g. 14A, 14B" :
                          formData.category === BookingCategory.Accommodation ? "e.g. Deluxe King Suite" :
                            "e.g. Private Tesla Model 3"
                      }
                    />
                    <Input
                      label="Contact Details"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      placeholder="e.g. +81 3-3344-1234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <Input
                    label={
                      formData.category === BookingCategory.Accommodation ? "Check-in" :
                        formData.category === BookingCategory.Activity ? "Commencement" :
                          "Departure / Start"
                    }
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                  <Input
                    label={
                      formData.category === BookingCategory.Accommodation ? "Check-out" :
                        formData.category === BookingCategory.Activity ? "Conclusion" :
                          "Arrival / End"
                    }
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        label="Incurred Cost"
                        name="cost"
                        type="number"
                        value={formData.cost}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Currency</label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-center"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Logistics Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={1}
                      className="w-full h-16 bg-slate-50 dark:bg-slate-800/30 border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none overflow-hidden"
                      placeholder="Special instructions or reminders..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row justify-end gap-6 border-t border-slate-100 dark:border-white/5 pt-12">
              <button
                type="button"
                onClick={onCancel}
                className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all active:scale-95"
              >
                Discard Changes
              </button>
              <Button
                type="submit"
                variant="primary"
                className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-600 shadow-[0_10px_30px_rgba(0,0,0,0.7)] transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? 'Processing...' : initialData ? 'Update Logistics' : 'Finalize Booking'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
