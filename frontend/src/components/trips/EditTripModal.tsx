import { useState, useEffect } from 'react';
import { tripService, TravelType, type TripResponse, type TravelTypeEnum } from '../../services/trip.service';

interface EditTripModalProps {
  trip: TripResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTripModal = ({ trip, onClose, onSuccess }: EditTripModalProps) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelType, setTravelType] = useState<TravelTypeEnum>(TravelType.Leisure);
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setTitle(trip.title || '');
      setDestination(trip.destination || '');
      setStartDate(trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '');
      setEndDate(trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '');
      
      let initialType: TravelTypeEnum = TravelType.Leisure;
      if (trip.travelType === 'Business' || trip.travelType === '1') initialType = TravelType.Business;
      if (trip.travelType === 'Family' || trip.travelType === '2') initialType = TravelType.Family;
      if (trip.travelType === 'Solo' || trip.travelType === '3') initialType = TravelType.Solo;
      setTravelType(initialType);
      
      setPurpose(trip.purpose || '');
      setNotes(trip.notes || '');
    }
  }, [trip]);

  if (!trip) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await tripService.updateTrip(trip.id, {
        title,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        travelType,
        purpose,
        notes
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900">Edit Journey</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <form id="edit-trip-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Journey Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-card"
                  placeholder="E.g., Summer in Paris"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-card"
                  placeholder="E.g., Paris, France"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-card"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-card"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Travel Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: TravelType.Leisure, icon: 'beach_access', label: 'Leisure' },
                  { id: TravelType.Business, icon: 'business_center', label: 'Business' },
                  { id: TravelType.Family, icon: 'family_restroom', label: 'Family' },
                  { id: TravelType.Solo, icon: 'person', label: 'Solo' },
                ].map(type => (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => setTravelType(type.id as TravelTypeEnum)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      travelType === type.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-gray-100 hover:border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-symbols-outlined mb-2 text-[28px]">{type.icon}</span>
                    <span className="text-xs font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Purpose / Budget Notes</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-card"
                placeholder="E.g., Honeymoon, Conference"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-card min-h-[100px]"
                placeholder="Any other details..."
              ></textarea>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="edit-trip-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTripModal;
