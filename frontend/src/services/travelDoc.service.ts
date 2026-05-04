import api from './api';

export const TravelDocumentType = {
  Passport: 'Passport',
  Visa: 'Visa',
  Insurance: 'Insurance',
  NationalID: 'NationalID',
  DriversLicense: 'DriversLicense',
  VaccinationRecord: 'VaccinationRecord',
  Other: 'Other'
} as const;

export type TravelDocumentTypeEnum = typeof TravelDocumentType[keyof typeof TravelDocumentType];

export const LocalInfoCategory = {
  Customs: 'Customs',
  Phrases: 'Phrases',
  EmergencyProcedures: 'EmergencyProcedures',
  Transport: 'Transport',
  FoodAndDining: 'FoodAndDining',
  MoneyAndTipping: 'MoneyAndTipping',
  Other: 'Other'
} as const;

export type LocalInfoCategoryEnum = typeof LocalInfoCategory[keyof typeof LocalInfoCategory];

export interface PackingItem {
  id: string;
  name: string;
  quantity: number;
  isPacked: boolean;
}

export interface PackingList {
  id: string;
  tripId: string;
  title: string;
  category: string;
  items: PackingItem[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface Checklist {
  id: string;
  tripId: string;
  title: string;
  items: ChecklistItem[];
}

export interface EmergencyContact {
  id: string;
  tripId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  isLocal: boolean;
  notes: string;
}

export interface TravelDocument {
  id: string;
  tripId: string;
  title: string;
  type: TravelDocumentTypeEnum;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

export interface LocalInfoNote {
  id: string;
  tripId: string;
  title: string;
  category: LocalInfoCategoryEnum;
  content: string;
}

const travelDocService = {
  // Packing Lists
  getPackingLists: async (tripId: string): Promise<PackingList[]> => {
    const response = await api.get(`/TravelDocs/trips/${tripId}/packing-lists`);
    return response.data;
  },
  createPackingList: async (tripId: string, data: { title: string; category: string }): Promise<PackingList> => {
    const response = await api.post(`/TravelDocs/trips/${tripId}/packing-lists`, data);
    return response.data;
  },
  addPackingItem: async (listId: string, data: { name: string; quantity: number }): Promise<PackingList> => {
    const response = await api.post(`/TravelDocs/packing-lists/${listId}/items`, data);
    return response.data;
  },
  updatePackingItem: async (itemId: string, isPacked: boolean): Promise<void> => {
    await api.put(`/TravelDocs/packing-items/${itemId}`, isPacked, {
        headers: { 'Content-Type': 'application/json' }
    });
  },
  deletePackingList: async (listId: string): Promise<void> => {
    await api.delete(`/TravelDocs/packing-lists/${listId}`);
  },
  deletePackingItem: async (itemId: string): Promise<void> => {
    await api.delete(`/TravelDocs/packing-items/${itemId}`);
  },

  // Checklists
  getChecklists: async (tripId: string): Promise<Checklist[]> => {
    const response = await api.get(`/TravelDocs/trips/${tripId}/checklists`);
    return response.data;
  },
  createChecklist: async (tripId: string, data: { title: string }): Promise<Checklist> => {
    const response = await api.post(`/TravelDocs/trips/${tripId}/checklists`, data);
    return response.data;
  },
  addChecklistItem: async (checklistId: string, data: { task: string; dueDate?: string }): Promise<Checklist> => {
    const response = await api.post(`/TravelDocs/checklists/${checklistId}/items`, data);
    return response.data;
  },
  updateChecklistItem: async (itemId: string, isCompleted: boolean): Promise<void> => {
    await api.put(`/TravelDocs/checklist-items/${itemId}`, isCompleted, {
        headers: { 'Content-Type': 'application/json' }
    });
  },
  deleteChecklist: async (checklistId: string): Promise<void> => {
    await api.delete(`/TravelDocs/checklists/${checklistId}`);
  },
  deleteChecklistItem: async (itemId: string): Promise<void> => {
    await api.delete(`/TravelDocs/checklist-items/${itemId}`);
  },

  // Emergency Contacts
  getContacts: async (tripId: string): Promise<EmergencyContact[]> => {
    const response = await api.get(`/TravelDocs/trips/${tripId}/contacts`);
    return response.data;
  },
  createContact: async (tripId: string, data: Omit<EmergencyContact, 'id' | 'tripId'>): Promise<EmergencyContact> => {
    const response = await api.post(`/TravelDocs/trips/${tripId}/contacts`, data);
    return response.data;
  },
  updateContact: async (id: string, data: Omit<EmergencyContact, 'id' | 'tripId'>): Promise<void> => {
    await api.put(`/TravelDocs/contacts/${id}`, data);
  },
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/TravelDocs/contacts/${id}`);
  },

  // Travel Documents
  getDocuments: async (tripId: string): Promise<TravelDocument[]> => {
    const response = await api.get(`/TravelDocs/trips/${tripId}/documents`);
    return response.data;
  },
  uploadDocument: async (tripId: string, title: string, type: TravelDocumentTypeEnum, file: File): Promise<TravelDocument> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('file', file);
    const response = await api.post(`/TravelDocs/trips/${tripId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  downloadDocument: async (id: string): Promise<void> => {
    const response = await api.get(`/TravelDocs/documents/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'document';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch) fileName = fileNameMatch[1];
    }
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/TravelDocs/documents/${id}`);
  },

  // Local Information
  getLocalInfo: async (tripId: string): Promise<LocalInfoNote[]> => {
    const response = await api.get(`/TravelDocs/trips/${tripId}/local-info`);
    return response.data;
  },
  createLocalInfo: async (tripId: string, data: Omit<LocalInfoNote, 'id' | 'tripId'>): Promise<LocalInfoNote> => {
    const response = await api.post(`/TravelDocs/trips/${tripId}/local-info`, data);
    return response.data;
  },
  updateLocalInfo: async (id: string, data: Omit<LocalInfoNote, 'id' | 'tripId'>): Promise<void> => {
    await api.put(`/TravelDocs/local-info/${id}`, data);
  },
  deleteLocalInfo: async (id: string): Promise<void> => {
    await api.delete(`/TravelDocs/local-info/${id}`);
  }
};

export default travelDocService;
