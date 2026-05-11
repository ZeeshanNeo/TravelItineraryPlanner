import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../services/api';
import travelDocService from '../services/travelDoc.service';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('TravelDocService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should auto-generate checklist', async () => {
    const mockChecklist = { id: 'check-id', title: 'Auto Checklist' };
    (api.post as any).mockResolvedValueOnce({ data: mockChecklist });

    const result = await travelDocService.autoGenerateChecklist('trip-id');

    expect(api.post).toHaveBeenCalledWith('/TravelDocs/trips/trip-id/checklists/auto-generate');
    expect(result).toEqual(mockChecklist);
  });

  it('should get packing templates', async () => {
    const mockTemplates = [{ id: 'temp-1', title: 'Beach Pack' }];
    (api.get as any).mockResolvedValueOnce({ data: mockTemplates });

    const result = await travelDocService.getPackingTemplates('Beach');

    expect(api.get).toHaveBeenCalledWith('/TravelDocs/packing-templates?category=Beach');
    expect(result).toEqual(mockTemplates);
  });

  it('should create packing list from template', async () => {
    const mockList = { id: 'list-id', title: 'My Beach Pack' };
    (api.post as any).mockResolvedValueOnce({ data: mockList });

    const result = await travelDocService.createPackingListFromTemplate('trip-id', 'temp-1');

    expect(api.post).toHaveBeenCalledWith('/TravelDocs/trips/trip-id/packing-lists/from-template/temp-1');
    expect(result).toEqual(mockList);
  });
});
