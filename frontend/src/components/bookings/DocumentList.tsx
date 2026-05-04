import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Trash2, X, Plus, 
  File as FileIcon, Loader2 
} from 'lucide-react';
import { bookingDocumentService } from '../../services/bookingDocument.service';
import type { BookingDocumentResponse } from '../../services/bookingDocument.service';

interface DocumentListProps {
  bookingId: string;
  onClose: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ bookingId, onClose }) => {
  const [documents, setDocuments] = useState<BookingDocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [bookingId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await bookingDocumentService.getDocuments(bookingId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      await bookingDocumentService.downloadDocument(bookingId, docId);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await bookingDocumentService.deleteDocument(bookingId, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const newDoc = await bookingDocumentService.uploadDocument(bookingId, file);
      setDocuments(prev => [...prev, newDoc]);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-card rounded-[2.5rem] p-8 max-w-2xl w-full mx-auto shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Booking Documents</h2>
          <p className="text-muted-foreground text-sm font-bold mt-1">Manage confirmation tickets and receipts.</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-muted rounded-2xl transition-colors">
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-bold">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6 bg-muted rounded-[2rem] border-2 border-dashed border-border">
            <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center shadow-sm">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-muted-foreground font-bold">No documents uploaded yet.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-6 p-6 bg-muted/50 hover:bg-muted rounded-[2rem] border border-border transition-colors group">
              <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center shadow-sm text-primary">
                <FileIcon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground truncate">{doc.fileName}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                  {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDownload(doc.id)}
                  className="p-3 bg-card hover:bg-primary hover:text-white rounded-xl text-muted-foreground shadow-sm transition-all"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-3 bg-card hover:bg-rose-500 hover:text-white rounded-xl text-muted-foreground shadow-sm transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="relative">
        <input 
          type="file" 
          id="doc-upload" 
          className="hidden" 
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label 
          htmlFor="doc-upload"
          className={`flex items-center justify-center gap-4 w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest transition-all cursor-pointer ${
            uploading 
              ? 'bg-muted text-muted-foreground pointer-events-none' 
              : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
          {uploading ? 'Uploading...' : 'Upload New Document'}
        </label>
      </div>
    </div>
  );
};

export default DocumentList;
