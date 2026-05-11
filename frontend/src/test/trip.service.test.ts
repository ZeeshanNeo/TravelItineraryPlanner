import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import { tripService } from '../services/trip.service';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('TripService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all trips', async () => {
    const mockTrips = [{ id: '1', title: 'Japan' }];
    (api.get as any).mockResolvedValueOnce({ data: mockTrips });

    const result = await tripService.getTrips();

    expect(api.get).toHaveBeenCalledWith('/trips?includeArchived=false');
    expect(result).toEqual(mockTrips);
  });

  it('should create a new trip', async () => {
    const tripData = { title: 'Japan', destination: 'Tokyo', startDate: '2026-05-10', endDate: '2026-05-20', travelType: 0 };
    (api.post as any).mockResolvedValueOnce({ data: { ...tripData, id: '1' } });

    const result = await tripService.createTrip(tripData as any);

    expect(api.post).toHaveBeenCalledWith('/trips', tripData);
    expect(result.id).toBe('1');
  });

  it('should archive a trip', async () => {
    (api.patch as any).mockResolvedValueOnce({});

    await tripService.archiveTrip('1', true);

    expect(api.patch).toHaveBeenCalledWith('/trips/1/archive', { isArchived: true });
  });

  it('should delete a trip', async () => {
    (api.delete as any).mockResolvedValueOnce({});

    await tripService.deleteTrip('1');

    expect(api.delete).toHaveBeenCalledWith('/trips/1');
  });
});
