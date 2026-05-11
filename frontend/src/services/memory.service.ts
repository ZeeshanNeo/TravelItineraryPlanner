import api from './api';

export interface MemoryPhoto {
  id: string;
  tripId: string;
  title: string;
  description: string;
  filePath: string;
  takenAt: string;
  location: string;
  activityId?: string;
  tags: MemoryTag[];
}

export interface JournalEntry {
  id: string;
  tripId: string;
  title: string;
  content: string;
  entryDate: string;
  location: string;
  activityId?: string;
  createdAt: string;
}

export interface MemoryTag {
  id: string;
  name: string;
  category: string;
}

export interface TimelineItem {
  type: 'Photo' | 'Journal';
  date: string;
  data: MemoryPhoto | JournalEntry;
}

export interface TripSummary {
  totalPhotos: number;
  totalJournals: number;
  topLocations: string[];
  topTags: string[];
  totalDays: number;
}

const memoryService = {
  // Photos
  uploadPhoto: async (tripId: string, formData: FormData): Promise<MemoryPhoto> => {
    const response = await api.post(`/Memories/trips/${tripId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getPhotos: async (tripId: string): Promise<MemoryPhoto[]> => {
    const response = await api.get(`/Memories/trips/${tripId}/photos`);
    return response.data;
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/Memories/photos/${photoId}`);
  },

  // Journals
  createJournal: async (tripId: string, data: any): Promise<JournalEntry> => {
    const response = await api.post(`/Memories/trips/${tripId}/journals`, data);
    return response.data;
  },

  getJournals: async (tripId: string): Promise<JournalEntry[]> => {
    const response = await api.get(`/Memories/trips/${tripId}/journals`);
    return response.data;
  },

  deleteJournal: async (journalId: string): Promise<void> => {
    await api.delete(`/Memories/journals/${journalId}`);
  },

  // Insights
  getTimeline: async (tripId: string): Promise<TimelineItem[]> => {
    const response = await api.get(`/Memories/trips/${tripId}/timeline`);
    return response.data;
  },

  getSummary: async (tripId: string): Promise<TripSummary> => {
    const response = await api.get(`/Memories/trips/${tripId}/summary`);
    return response.data;
  },

  getTags: async (): Promise<MemoryTag[]> => {
    const response = await api.get('/Memories/tags');
    return response.data;
  }
};

export default memoryService;
