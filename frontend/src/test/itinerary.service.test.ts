import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import itineraryService from '../services/itinerary.service';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('ItineraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch itinerary weather', async () => {
    const mockWeatherData = { temperature: 25, description: 'Sunny' };
    (api.get as any).mockResolvedValueOnce({ data: mockWeatherData });

    const result = await itineraryService.getItineraryWeather('itin-id', '2026-05-10');

    expect(api.get).toHaveBeenCalledWith('/itineraries/itin-id/weather?date=2026-05-10');
    expect(result).toEqual(mockWeatherData);
  });

  it('should generate share link', async () => {
    const mockToken = { shareToken: 'secure-token' };
    (api.post as any).mockResolvedValueOnce({ data: mockToken });

    const result = await itineraryService.generateShareLink('itin-id');

    expect(api.post).toHaveBeenCalledWith('/itineraries/itin-id/share');
    expect(result).toBe('secure-token');
  });

  it('should revoke share link', async () => {
    (api.delete as any).mockResolvedValueOnce({});

    await itineraryService.revokeShareLink('itin-id');

    expect(api.delete).toHaveBeenCalledWith('/itineraries/itin-id/share');
  });

  it('should fetch public itinerary', async () => {
    const mockItinerary = { id: 'itin-id', title: 'Shared Trip' };
    (api.get as any).mockResolvedValueOnce({ data: mockItinerary });

    const result = await itineraryService.getPublicItinerary('secure-token');

    expect(api.get).toHaveBeenCalledWith('/public/itineraries/secure-token');
    expect(result).toEqual(mockItinerary);
  });
});
