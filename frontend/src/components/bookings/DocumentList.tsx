import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Trash2, X, Plus,
  File as FileIcon, Loader2, ShieldCheck,
  Clock, HardDrive
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
  const [dragActive, setDragActive] = useState(false);

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
    if (!window.confirm('Archive this legal instrument?')) return;
    try {
      await bookingDocumentService.deleteDocument(bookingId, docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const newDoc = await bookingDocumentService.uploadDocument(bookingId, file);
      setDocuments(prev => [...prev, newDoc]);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      alert(error.response?.status === 413 ? "File too large. Maximum 20MB allowed." : "Upload failed. Verify server status.");
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
    <div className="bg-slate-900 rounded-[3rem] p-0 max-w-2xl w-full mx-auto shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Segment */}
      <div className="p-10 pb-6 flex items-start justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} className="text-primary" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Secure Vault</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Booking Manifest</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Encrypted document storage for itinerary instruments.</p>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white relative z-10">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-10 pt-4 space-y-6">
        <div className="space-y-4 mb-2 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing Repository...</p>
            </div>
          ) : documents.length === 0 ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files[0]); }}
              className={`flex flex-col items-center justify-center py-24 gap-8 rounded-[2.5rem] border-2 border-dashed transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-800 bg-slate-800/30'}`}
            >
              <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-2xl text-slate-700">
                <FileText className="w-12 h-12" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-black uppercase tracking-widest text-sm mb-2">No documents detected</p>
                <p className="text-slate-500 text-xs">Drop files here or use the append action below.</p>
              </div>
            </div>
          ) : (
            documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-6 p-6 bg-slate-800/30 hover:bg-slate-800/50 rounded-[2rem] border border-slate-800 transition-all group">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg text-primary group-hover:scale-110 transition-transform">
                  <FileIcon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-100 truncate">{doc.fileName}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <HardDrive size={10} /> {formatFileSize(doc.fileSize)}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <Clock size={10} /> {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="p-3 bg-slate-800 hover:bg-primary text-slate-400 hover:text-white rounded-xl shadow-lg transition-all"
                    title="Download Instrument"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-3 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-xl shadow-lg transition-all"
                    title="Archive Instrument"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Action */}
        <div className="relative pt-4">
          <input
            type="file"
            id="doc-upload"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            disabled={uploading}
          />
          <label
            htmlFor="doc-upload"
            className={`flex items-center justify-center gap-4 w-full h-18 rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer ${uploading
              ? 'bg-slate-800 text-slate-500 pointer-events-none'
              : 'bg-white text-slate-900 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-slate-50 hover:-translate-y-1 active:scale-95'
              }`}
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
            {uploading ? 'Processing Data...' : 'Append New Document'}
          </label>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-10 py-6 bg-slate-950/50 border-t border-slate-800 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>Encrypted Connection Active</span>
        </div>
        <span>Max Payload: 20MB</span>
      </div>
    </div>
  );
};

export default DocumentList;
