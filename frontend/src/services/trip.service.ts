import api from './api';

export const TravelType = {
  Business: 0,
  Leisure: 1,
  Family: 2,
  Solo: 3
} as const;

export type TravelTypeEnum = typeof TravelType[keyof typeof TravelType];

export interface CreateTripRequest {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelType: TravelTypeEnum;
  purpose?: string;
  notes?: string;
  travelCompanions?: string[];
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {}

export interface TripResponse {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelType: string;
  purpose?: string;
  notes?: string;
  travelCompanions?: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

class TripService {
  async getTrips(includeArchived: boolean = false): Promise<TripResponse[]> {
    const response = await api.get<TripResponse[]>(`/trips?includeArchived=${includeArchived}`);
    return response.data;
  }

  async getTrip(id: string): Promise<TripResponse> {
    const response = await api.get<TripResponse>(`/trips/${id}`);
    return response.data;
  }

  async createTrip(data: CreateTripRequest): Promise<TripResponse> {
    const response = await api.post<TripResponse>('/trips', data);
    return response.data;
  }

  async updateTrip(id: string, data: UpdateTripRequest): Promise<TripResponse> {
    const response = await api.put<TripResponse>(`/trips/${id}`, data);
    return response.data;
  }

  async archiveTrip(id: string, isArchived: boolean): Promise<void> {
    await api.patch(`/trips/${id}/archive`, { isArchived });
  }

  async deleteTrip(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  }
}

export const tripService = new TripService();
