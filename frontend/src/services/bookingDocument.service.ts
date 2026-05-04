import api from './api';

export interface BookingDocumentResponse {
  id: string;
  bookingId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  downloadUrl: string;
}

class BookingDocumentService {
  async getDocuments(bookingId: string): Promise<BookingDocumentResponse[]> {
    const response = await api.get<BookingDocumentResponse[]>(`/bookings/${bookingId}/documents`);
    return response.data;
  }

  async uploadDocument(bookingId: string, file: File): Promise<BookingDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<BookingDocumentResponse>(
      `/bookings/${bookingId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteDocument(bookingId: string, documentId: string): Promise<void> {
    await api.delete(`/bookings/${bookingId}/documents/${documentId}`);
  }

  async downloadDocument(bookingId: string, documentId: string): Promise<void> {
    const response = await api.get(`/bookings/${bookingId}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    
    // Get filename from content-disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'download';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch.length > 1) {
        fileName = fileNameMatch[1];
      }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const bookingDocumentService = new BookingDocumentService();
