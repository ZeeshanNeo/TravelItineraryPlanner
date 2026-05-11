import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import memoryService from '../services/memory.service';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('MemoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upload photo with activityId', async () => {
    const mockPhoto = { id: 'photo-1', title: 'Sunset', activityId: 'act-1' };
    (api.post as any).mockResolvedValueOnce({ data: mockPhoto });

    const formData = new FormData();
    formData.append('title', 'Sunset');
    formData.append('activityId', 'act-1');

    const result = await memoryService.uploadPhoto('trip-1', formData);

    expect(api.post).toHaveBeenCalledWith('/Memories/trips/trip-1/photos', formData, expect.any(Object));
    expect(result.activityId).toBe('act-1');
  });

  it('should create journal with activityId', async () => {
    const mockJournal = { id: 'journal-1', title: 'Great Day', activityId: 'act-1' };
    (api.post as any).mockResolvedValueOnce({ data: mockJournal });

    const data = { title: 'Great Day', activityId: 'act-1' };
    const result = await memoryService.createJournal('trip-1', data);

    expect(api.post).toHaveBeenCalledWith('/Memories/trips/trip-1/journals', data);
    expect(result.activityId).toBe('act-1');
  });
});
