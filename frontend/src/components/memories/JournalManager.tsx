import React, { useState } from 'react';
import { Plus, Book, Trash2, MapPin, Calendar, Search } from 'lucide-react';
import memoryService from '../../services/memory.service';
import type { JournalEntry } from '../../services/memory.service';

interface JournalManagerProps {
  tripId: string;
  journals: JournalEntry[];
  onRefresh: () => void;
  activities?: any[];
}

const JournalManager: React.FC<JournalManagerProps> = ({ tripId, journals, onRefresh, activities }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    entryDate: new Date().toISOString().split('T')[0],
    location: '',
    activityId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await memoryService.createJournal(tripId, formData);
    setFormData({ title: '', content: '', entryDate: new Date().toISOString().split('T')[0], location: '', activityId: '' });
    setIsWriting(false);
    onRefresh();
  };

  const filteredJournals = journals.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Book className="text-emerald-400" size={24} />
          Travel Journal
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-48 md:w-64"
            />
          </div>
          <button
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} />
            Write Entry
          </button>
        </div>
      </div>

      {isWriting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWriting(false)} />
          <div className="relative bg-slate-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300">
            <h4 className="text-2xl font-black text-white mb-6">Dear Diary...</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                  <input
                    type="text"
                    placeholder="Where are you?"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Story Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />

              <textarea
                placeholder="Share your experience..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />

              {activities && activities.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Link to Activity</label>
                  <select
                    value={formData.activityId}
                    onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                  onClick={() => setIsWriting(false)}
                  className="flex-1 px-4 py-3 text-gray-400 font-bold hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {filteredJournals.map(journal => (
          <div key={journal.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 glass-effect hover:border-white/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(journal.entryDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {journal.location}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{journal.title}</h4>
              </div>
              <button
                onClick={async () => {
                  if (window.confirm('Delete this entry?')) {
                    await memoryService.deleteJournal(journal.id);
                    onRefresh();
                  }
                }}
                className="p-2 text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
              {journal.content}
            </p>
          </div>
        ))}

        {filteredJournals.length === 0 && (
          <div className="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
            <Book className="mx-auto text-white/10 mb-4" size={64} />
            <p className="text-white/40 font-bold">No journal entries yet. Capture your journey in words!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalManager;
