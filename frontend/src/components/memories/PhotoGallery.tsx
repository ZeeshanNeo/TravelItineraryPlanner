import React, { useState } from 'react';
import { Plus, Tag, MapPin, Trash2, Camera, X, Image as ImageIcon } from 'lucide-react';
import memoryService from '../../services/memory.service';
import type { MemoryPhoto } from '../../services/memory.service';
import { getAssetUrl } from '../../config';

interface PhotoGalleryProps {
  tripId: string;
  photos: MemoryPhoto[];
  onRefresh: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ tripId, photos, onRefresh }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    title: '',
    location: '',
    tags: ''
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return;

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('location', uploadData.location);
    
    const tagList = uploadData.tags.split(',').map(t => t.trim()).filter(t => t);
    tagList.forEach(t => formData.append('tags', t));

    try {
      await memoryService.uploadPhoto(tripId, formData);
      setUploadData({ file: null, title: '', location: '', tags: '' });
      setIsUploading(false);
      onRefresh();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this photo?')) {
      await memoryService.deletePhoto(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
           <h3 className="text-3xl font-black text-white flex items-center gap-3 tracking-tighter">
             <Camera className="text-primary shrink-0" size={32} />
             Visual Memories
           </h3>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Captured Moments from your Journey</p>
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-[1.25rem] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          <Plus size={18} />
          Upload Photos
        </button>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsUploading(false)} />
          <div className="relative bg-slate-900 border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <div>
                 <h4 className="text-3xl font-black text-white tracking-tight">Capture the Moment</h4>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Add a new photo to your gallery</p>
              </div>
              <button onClick={() => setIsUploading(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="p-12 border-2 border-dashed border-white/10 rounded-[2rem] text-center hover:border-primary/50 transition-all cursor-pointer group relative bg-white/[0.02]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadData.file ? (
                  <div className="space-y-4">
                     <ImageIcon className="mx-auto text-primary" size={48} />
                     <p className="text-primary font-black break-all text-sm">{uploadData.file.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform group-hover:bg-primary/20">
                      <Plus className="text-white/40 group-hover:text-primary transition-colors" size={32} />
                    </div>
                    <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Drop photo or tap to browse</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input
                   type="text"
                   placeholder="Photo Title"
                   value={uploadData.title}
                   onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                 />
                 <input
                   type="text"
                   placeholder="Location"
                   value={uploadData.location}
                   onChange={(e) => setUploadData({ ...uploadData, location: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                 />
              </div>
              
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={uploadData.tags}
                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="flex-1 h-16 rounded-2xl text-slate-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadData.file}
                  className="flex-[2] h-16 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="group relative bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-primary/30 transition-all aspect-[4/5] shadow-2xl">
            <img 
              src={getAssetUrl(photo.filePath)} 
              alt={photo.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&q=80&w=600';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-100 transition-opacity duration-300" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h4 className="text-white font-black text-xl mb-2 truncate tracking-tight">{photo.title}</h4>
              <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{photo.location}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {photo.tags.map(tag => (
                  <span key={tag.id} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={8} className="text-primary" />
                    {tag.name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-8 right-8 p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xl border border-red-500/20"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[3rem]">
            <Camera className="mx-auto text-white/10 mb-6" size={64} />
            <p className="text-slate-400 font-black text-sm uppercase tracking-[0.3em]">No Visual Memories Logged</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
