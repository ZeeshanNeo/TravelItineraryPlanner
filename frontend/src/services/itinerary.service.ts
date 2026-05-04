import api from './api';

export const ActivityType = {
  Flight: 0,
  Accommodation: 1,
  Transportation: 2,
  Food: 3,
  Sightseeing: 4,
  Shopping: 5,
  Entertainment: 6,
  Other: 7
} as const;

export type ActivityTypeEnum = typeof ActivityType[keyof typeof ActivityType];

// Itinerary DTOs
export interface CreateItineraryRequest {
  tripId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  timeZone?: string;
  tags?: string[];
  isPublic: boolean;
}

export interface UpdateItineraryRequest extends Partial<CreateItineraryRequest> {
  isPublic?: boolean;
}

export interface ItineraryResponse {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  timeZone?: string;
  tags?: string[];
  isPublic: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  days: ItineraryDayResponse[];
}

// ItineraryDay DTOs
export interface CreateItineraryDayRequest {
  itineraryId: string;
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
}

export interface UpdateItineraryDayRequest extends Partial<CreateItineraryDayRequest> {}

export interface ItineraryDayResponse {
  id: string;
  itineraryId: string;
  dayNumber: number;
  date: string;
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  activities: ActivityResponse[];
}

// Activity DTOs
export interface CreateActivityRequest {
  itineraryDayId: string;
  title: string;
  description?: string;
  activityType: ActivityTypeEnum;
  startTime: string;
  endTime: string;
  location?: string;
  address?: string;
  cost?: number;
  currency?: string;
  notes?: string;
  order: number;
  travelTimeMinutes?: number;
  isFlexible: boolean;
  bookingReference?: string;
  contactInfo?: string;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {}

export interface ActivityResponse {
  id: string;
  itineraryDayId: string;
  title: string;
  description?: string;
  activityType: string;
  startTime: string;
  endTime: string;
  location?: string;
  address?: string;
  cost?: number;
  currency?: string;
  notes?: string;
  order: number;
  travelTimeMinutes?: number;
  isFlexible: boolean;
  bookingReference?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

class ItineraryService {
  // Itinerary operations
  async getItineraries(includeArchived: boolean = false): Promise<ItineraryResponse[]> {
    const response = await api.get<ItineraryResponse[]>(`/itineraries?includeArchived=${includeArchived}`);
    return response.data;
  }

  async getItinerariesByTrip(tripId: string, includeArchived: boolean = false): Promise<ItineraryResponse[]> {
    const response = await api.get<ItineraryResponse[]>(`/itineraries/trip/${tripId}?includeArchived=${includeArchived}`);
    return response.data;
  }

  async getItinerary(id: string): Promise<ItineraryResponse> {
    const response = await api.get<ItineraryResponse>(`/itineraries/${id}`);
    return response.data;
  }

  async createItinerary(request: CreateItineraryRequest): Promise<ItineraryResponse> {
    const response = await api.post<ItineraryResponse>('/itineraries', request);
    return response.data;
  }

  async updateItinerary(id: string, request: UpdateItineraryRequest): Promise<ItineraryResponse> {
    const response = await api.put<ItineraryResponse>(`/itineraries/${id}`, request);
    return response.data;
  }

  async archiveItinerary(id: string): Promise<void> {
    await api.patch(`/itineraries/${id}/archive`);
  }

  async deleteItinerary(id: string): Promise<void> {
    await api.delete(`/itineraries/${id}`);
  }

  // ItineraryDay operations
  async getItineraryDays(itineraryId: string): Promise<ItineraryDayResponse[]> {
    const response = await api.get<ItineraryDayResponse[]>(`/itineraries/${itineraryId}/days`);
    return response.data;
  }

  async getItineraryDay(dayId: string): Promise<ItineraryDayResponse> {
    const response = await api.get<ItineraryDayResponse>(`/itineraries/days/${dayId}`);
    return response.data;
  }

  async createItineraryDay(request: CreateItineraryDayRequest): Promise<ItineraryDayResponse> {
    const response = await api.post<ItineraryDayResponse>('/itineraries/days', request);
    return response.data;
  }

  async updateItineraryDay(dayId: string, request: UpdateItineraryDayRequest): Promise<ItineraryDayResponse> {
    const response = await api.put<ItineraryDayResponse>(`/itineraries/days/${dayId}`, request);
    return response.data;
  }

  async deleteItineraryDay(dayId: string): Promise<void> {
    await api.delete(`/itineraries/days/${dayId}`);
  }

  // Activity operations
  async getActivitiesByDay(dayId: string): Promise<ActivityResponse[]> {
    const response = await api.get<ActivityResponse[]>(`/itineraries/days/${dayId}/activities`);
    return response.data;
  }

  async getActivity(activityId: string): Promise<ActivityResponse> {
    const response = await api.get<ActivityResponse>(`/itineraries/activities/${activityId}`);
    return response.data;
  }

  async createActivity(request: CreateActivityRequest): Promise<ActivityResponse> {
    const response = await api.post<ActivityResponse>('/itineraries/activities', request);
    return response.data;
  }

  async updateActivity(activityId: string, request: UpdateActivityRequest): Promise<ActivityResponse> {
    const response = await api.put<ActivityResponse>(`/itineraries/activities/${activityId}`, request);
    return response.data;
  }

  async deleteActivity(activityId: string): Promise<void> {
    await api.delete(`/itineraries/activities/${activityId}`);
  }

  async reorderActivities(dayId: string, activityIdsInOrder: string[]): Promise<void> {
    await api.post(`/itineraries/days/${dayId}/reorder`, activityIdsInOrder);
  }
}

export default new ItineraryService();