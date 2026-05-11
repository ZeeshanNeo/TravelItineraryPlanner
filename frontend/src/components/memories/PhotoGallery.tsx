import React, { useState } from 'react';
import { Plus, Tag, MapPin, Trash2, Camera, X } from 'lucide-react';
import memoryService from '../../services/memory.service';
import type { MemoryPhoto } from '../../services/memory.service';
import { useIsSmallScreen } from '../../hooks/useMediaQuery';
import { getAssetUrl } from '../../config';

interface PhotoGalleryProps {
  tripId: string;
  photos: MemoryPhoto[];
  onRefresh: () => void;
  activities?: any[];
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ tripId, photos, onRefresh, activities }) => {
  const isSmallScreen = useIsSmallScreen();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null as File | null,
    title: '',
    location: '',
    tags: '',
    activityId: ''
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
    if (uploadData.activityId) {
      formData.append('activityId', uploadData.activityId);
    }

    try {
      await memoryService.uploadPhoto(tripId, formData);
      setUploadData({ file: null, title: '', location: '', tags: '', activityId: '' });
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Camera className="text-indigo-400 shrink-0" size={24} />
          Visual Memories
        </h3>
        <button
          onClick={() => setIsUploading(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl border border-indigo-500/30 transition-all text-sm font-bold"
        >
          <Plus size={18} />
          Upload Photos
        </button>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsUploading(false)} />
          <div className="relative bg-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl md:text-2xl font-black text-white">Capture the Moment</h4>
              <button onClick={() => setIsUploading(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="p-6 md:p-8 border-2 border-dashed border-white/10 rounded-2xl text-center hover:border-indigo-500/50 transition-colors cursor-pointer group relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadData.file ? (
                  <p className="text-indigo-400 font-bold break-all">{uploadData.file.name}</p>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Plus className="text-white/40" />
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm">Drop your photo here or tap to browse</p>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Photo Title"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Location"
                value={uploadData.location}
                onChange={(e) => setUploadData({ ...uploadData, location: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={uploadData.tags}
                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />

              {activities && activities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Link to Activity</p>
                  <select
                    value={uploadData.activityId}
                    onChange={(e) => setUploadData({ ...uploadData, activityId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">No specific activity</option>
                    {activities.map((act: any) => (
                      <option key={act.id} value={act.id}>{act.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="flex-1 px-4 py-3 text-gray-400 font-bold hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadData.file}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all aspect-square md:aspect-[4/5]">
            <img 
              src={getAssetUrl(photo.filePath)} 
              alt={photo.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h4 className="text-white font-bold text-base md:text-lg mb-1 truncate">{photo.title}</h4>
                <div className="flex items-center gap-2 text-white/60 text-[10px] md:text-xs mb-3">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{photo.location}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-12 md:max-h-none">
                  {photo.tags.map((tag: any) => (
                    <span key={tag.id} className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[8px] md:text-[10px] text-white flex items-center gap-1">
                      <Tag size={8} />
                      {tag.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-red-500/80 text-white rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className="col-span-full py-16 md:py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
            <Camera className="mx-auto text-white/10 mb-4" size={isSmallScreen ? 48 : 64} />
            <p className="text-white/40 font-bold text-sm md:text-base">No visual memories yet. Start uploading!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
