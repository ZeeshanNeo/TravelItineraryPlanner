import api from './api';

export const BookingCategory = {
  Flight: 'Flight',
  Accommodation: 'Accommodation',
  Transportation: 'Transportation',
  Activity: 'Activity'
} as const;

export type BookingCategory = typeof BookingCategory[keyof typeof BookingCategory];

export const BookingStatus = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
  Completed: 'Completed'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

import type { BookingDocumentResponse } from './bookingDocument.service';

export interface BookingResponse {
  id: string;
  tripId: string;
  activityId?: string;
  category: BookingCategory;
  title: string;
  description?: string;
  status: BookingStatus;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  location?: string;
  address?: string;
  provider?: string;
  confirmationCode?: string;
  cost?: number;
  currency?: string;
  notes?: string;
  contactInfo?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: BookingDocumentResponse[];
}

export interface CreateBookingRequest {
  tripId: string;
  activityId?: string;
  category: BookingCategory;
  title: string;
  description?: string;
  status: BookingStatus;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  location?: string;
  address?: string;
  provider?: string;
  confirmationCode?: string;
  cost?: number;
  currency?: string;
  notes?: string;
  contactInfo?: string;
}

export interface UpdateBookingRequest extends Partial<CreateBookingRequest> {}

export interface BookingSummaryResponse {
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  totalCost: number;
}

class BookingService {
  async getBookings(params: {
    id?: string;
    tripId?: string;
    category?: string;
    status?: string;
    includeArchived?: boolean;
  } = {}): Promise<BookingResponse[]> {
    const response = await api.get<BookingResponse[]>('/bookings', { params });
    return response.data;
  }

  async getBooking(id: string): Promise<BookingResponse> {
    const response = await api.get<BookingResponse[]>('/bookings', { params: { id } });
    if (response.data && response.data.length > 0) {
      return response.data[0];
    }
    throw new Error('Booking not found');
  }

  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    const response = await api.post<BookingResponse>('/bookings', data);
    return response.data;
  }

  async updateBooking(id: string, data: UpdateBookingRequest): Promise<BookingResponse> {
    const response = await api.put<BookingResponse>(`/bookings/${id}`, data);
    return response.data;
  }

  async archiveBooking(id: string, isArchived: boolean): Promise<void> {
    await api.patch(`/bookings/${id}/archive`, { isArchived });
  }

  async deleteBooking(id: string): Promise<void> {
    await api.delete(`/bookings/${id}`);
  }

  async getBookingSummary(tripId: string): Promise<BookingSummaryResponse> {
    const response = await api.get<BookingSummaryResponse>(`/bookings/summary/${tripId}`);
    return response.data;
  }
}

export const bookingService = new BookingService();
