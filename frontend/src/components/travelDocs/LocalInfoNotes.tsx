import React, { useState } from 'react';
import { Plus, Info, Edit3, Trash2, Globe, MessageSquare, AlertTriangle, Bus, Utensils, Coins, ChevronRight } from 'lucide-react';
import type { LocalInfoNote, LocalInfoCategoryEnum } from '../../services/travelDoc.service';
import { LocalInfoCategory } from '../../services/travelDoc.service';
import travelDocService from '../../services/travelDoc.service';

interface LocalInfoNotesProps {
  tripId: string;
  notes: LocalInfoNote[];
  onRefresh: () => void;
}

const CategoryIcons: Record<LocalInfoCategoryEnum, React.ReactNode> = {
  [LocalInfoCategory.Customs]: <Globe size={18} />,
  [LocalInfoCategory.Phrases]: <MessageSquare size={18} />,
  [LocalInfoCategory.EmergencyProcedures]: <AlertTriangle size={18} />,
  [LocalInfoCategory.Transport]: <Bus size={18} />,
  [LocalInfoCategory.FoodAndDining]: <Utensils size={18} />,
  [LocalInfoCategory.MoneyAndTipping]: <Coins size={18} />,
  [LocalInfoCategory.Other]: <Info size={18} />,
};

const CategoryColors: Record<LocalInfoCategoryEnum, string> = {
  [LocalInfoCategory.Customs]: 'text-purple-400 bg-purple-500/20',
  [LocalInfoCategory.Phrases]: 'text-blue-400 bg-blue-500/20',
  [LocalInfoCategory.EmergencyProcedures]: 'text-red-400 bg-red-500/20',
  [LocalInfoCategory.Transport]: 'text-orange-400 bg-orange-500/20',
  [LocalInfoCategory.FoodAndDining]: 'text-green-400 bg-green-500/20',
  [LocalInfoCategory.MoneyAndTipping]: 'text-yellow-400 bg-yellow-500/20',
  [LocalInfoCategory.Other]: 'text-gray-400 bg-gray-500/20',
};

const LocalInfoNotes: React.FC<LocalInfoNotesProps> = ({ tripId, notes, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<LocalInfoNote | null>(notes[0] || null);
  const [formData, setFormData] = useState<Omit<LocalInfoNote, 'id' | 'tripId'>>({
    title: '',
    category: LocalInfoCategory.Other,
    content: ''
  });

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;
    try {
      if (editingId) {
        await travelDocService.updateLocalInfo(editingId, formData);
      } else {
        await travelDocService.createLocalInfo(tripId, formData);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleEdit = (note: LocalInfoNote) => {
    setEditingId(note.id);
    setFormData({
      title: note.title,
      category: note.category,
      content: note.content
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this information note?')) {
      await travelDocService.deleteLocalInfo(id);
      onRefresh();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: LocalInfoCategory.Other,
      content: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
      {/* Sidebar - List of Notes */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Info className="text-purple-400" size={24} />
            Local Info
          </h3>
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => { setActiveNote(note); setIsAdding(false); }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeNote?.id === note.id && !isAdding
                  ? 'bg-purple-500/20 border-purple-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${CategoryColors[note.category]}`}>
                  {CategoryIcons[note.category]}
                </div>
                <div className="max-w-[150px]">
                  <h4 className="font-medium text-white truncate">{note.title}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{note.category}</p>
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className={`transition-all ${activeNote?.id === note.id && !isAdding ? 'text-purple-400 translate-x-1' : 'text-gray-600'}`} 
              />
            </div>
          ))}

          {notes.length === 0 && !isAdding && (
            <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-500 text-sm">No information saved yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl overflow-hidden glass-effect flex flex-col">
        {isAdding ? (
          <div className="p-8 flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white">{editingId ? 'Edit Information' : 'Add Local Information'}</h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-white">Cancel</button>
            </div>
            
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Note Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Tipping Culture"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as LocalInfoCategoryEnum })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            {Object.values(LocalInfoCategory).map(c => (
                                <option key={c} value={c} className="bg-slate-900">{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 min-h-[250px] flex flex-col">
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Content</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write down the details here... (Markdown supported)"
                        className="w-full flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none font-mono text-sm"
                    />
                </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                <button
                    onClick={handleSave}
                    className="px-10 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                >
                    {editingId ? 'Update Info' : 'Save Information'}
                </button>
            </div>
          </div>
        ) : activeNote ? (
          <div className="p-8 flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 ${CategoryColors[activeNote.category]}`}>
                        {CategoryIcons[activeNote.category]}
                        {activeNote.category}
                    </div>
                    <h3 className="text-3xl font-bold text-white">{activeNote.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(activeNote)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"
                    >
                        <Edit3 size={18} />
                    </button>
                    <button
                        onClick={() => handleDelete(activeNote.id)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 rounded-xl border border-white/10 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar text-gray-300 leading-relaxed whitespace-pre-wrap">
                {activeNote.content}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="p-6 bg-white/5 rounded-full mb-6">
                <Info size={64} className="text-gray-600" />
            </div>
            <h4 className="text-white text-xl font-medium mb-2">Local Information & Notes</h4>
            <p className="text-gray-500 max-w-sm">Select a note from the sidebar or add a new one to keep track of customs, phrases, and other local details.</p>
            <button
                onClick={() => setIsAdding(true)}
                className="mt-8 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl border border-purple-500/30 transition-all font-medium"
            >
                Add Your First Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalInfoNotes;
