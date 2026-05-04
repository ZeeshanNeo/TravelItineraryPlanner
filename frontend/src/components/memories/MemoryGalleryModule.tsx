import React, { useState, useEffect } from 'react';
import { Camera, Book, Clock, BarChart3 } from 'lucide-react';
import PhotoGallery from './PhotoGallery.tsx';
import JournalManager from './JournalManager.tsx';
import TimelineView from './TimelineView.tsx';
import TripSummary from './TripSummary.tsx';
import memoryService from '../../services/memory.service';
import type { MemoryPhoto, JournalEntry, TimelineItem, TripSummary as TripSummaryType } from '../../services/memory.service';

interface MemoryGalleryModuleProps {
  tripId: string;
}

const MemoryGalleryModule: React.FC<MemoryGalleryModuleProps> = ({ tripId }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'journals' | 'timeline' | 'summary'>('photos');
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [summary, setSummary] = useState<TripSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [tripId, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [photoData, journalData, timelineData, summaryData] = await Promise.all([
        memoryService.getPhotos(tripId),
        memoryService.getJournals(tripId),
        memoryService.getTimeline(tripId),
        memoryService.getSummary(tripId)
      ]);
      setPhotos(photoData);
      setJournals(journalData);
      setTimeline(timelineData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'photos', label: 'Photo Gallery', icon: Camera },
    { id: 'journals', label: 'Travel Journal', icon: Book },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'summary', label: 'Trip Summary', icon: BarChart3 },
  ];

  if (loading && refreshKey === 0) {
    return <div className="text-white/50 animate-pulse text-center py-20">Loading memories...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Sub-tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'photos' && (
          <PhotoGallery tripId={tripId} photos={photos} onRefresh={() => setRefreshKey(k => k + 1)} />
        )}
        {activeTab === 'journals' && (
          <JournalManager tripId={tripId} journals={journals} onRefresh={() => setRefreshKey(k => k + 1)} />
        )}
        {activeTab === 'timeline' && (
          <TimelineView timeline={timeline} />
        )}
        {activeTab === 'summary' && summary && (
          <TripSummary summary={summary} />
        )}
      </div>
    </div>
  );
};

export default MemoryGalleryModule;
