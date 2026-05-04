import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Trash2, ShieldCheck, File, HardDrive, X } from 'lucide-react';
import type { TravelDocument, TravelDocumentTypeEnum } from '../../services/travelDoc.service';
import { TravelDocumentType } from '../../services/travelDoc.service';
import travelDocService from '../../services/travelDoc.service';

interface DocumentVaultProps {
  tripId: string;
  documents: TravelDocument[];
  onRefresh: () => void;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ tripId, documents, onRefresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TravelDocumentTypeEnum>(TravelDocumentType.Passport);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!title || !file) return;
    setIsUploading(true);
    try {
      await travelDocService.uploadDocument(tripId, title, type, file);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Error uploading document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await travelDocService.downloadDocument(id);
    } catch (err) {
      console.error('Error downloading document:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Permanently delete this document from the vault?')) {
      await travelDocService.deleteDocument(id);
      onRefresh();
    }
  };

  const resetForm = () => {
    setTitle('');
    setType(TravelDocumentType.Passport);
    setFile(null);
    setIsModalOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
                <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white">Digital Document Vault</h3>
                <p className="text-xs text-gray-500">Securely store and access your travel essentials</p>
            </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all"
        >
          <Upload size={20} />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col group hover:bg-white/10 transition-all glass-effect border-l-4 border-l-blue-500/50">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl text-blue-400">
                <FileText size={24} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-white mb-1 line-clamp-1">{doc.title}</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
                  {doc.type}
                </span>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <HardDrive size={10} />
                    {formatFileSize(doc.fileSize)}
                </p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                    <File size={10} />
                    Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <button
                onClick={() => handleDownload(doc.id)}
                className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-lg border border-white/5 transition-all"
            >
                View / Download
            </button>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <FileText className="mx-auto text-gray-600 mb-4" size={64} />
            <h4 className="text-white font-medium mb-1">Vault is empty</h4>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">Upload copies of your passport, visas, and insurance for safe keeping during your journey.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Upload New Document</h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Passport Copy - Main Page"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Document Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TravelDocumentTypeEnum)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {Object.values(TravelDocumentType).map(t => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-4 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-2">
                      <FileText className="mx-auto text-blue-400" size={40} />
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-gray-500" size={40} />
                      <p className="text-white font-medium">Click to select a file</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG supported (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !title || !file}
                  className="flex-2 px-10 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Securely Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVault;
