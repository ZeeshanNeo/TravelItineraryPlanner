import React, { useState } from 'react';
import { Plus, CheckSquare, Square, Trash2, ClipboardList, Calendar } from 'lucide-react';
import type { Checklist } from '../../services/travelDoc.service';
import travelDocService from '../../services/travelDoc.service';

interface ChecklistManagerProps {
  tripId: string;
  checklists: Checklist[];
  onRefresh: () => void;
}

const ChecklistManager: React.FC<ChecklistManagerProps> = ({ tripId, checklists, onRefresh }) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemTask, setNewItemTask] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState('');

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    await travelDocService.createChecklist(tripId, { title: newListTitle });
    setNewListTitle('');
    setIsAddingList(false);
    onRefresh();
  };

  const handleAddItem = async (checklistId: string) => {
    if (!newItemTask.trim()) return;
    await travelDocService.addChecklistItem(checklistId, { 
      task: newItemTask, 
      dueDate: newItemDueDate || undefined 
    });
    setNewItemTask('');
    setNewItemDueDate('');
    setAddingItemTo(null);
    onRefresh();
  };

  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    await travelDocService.updateChecklistItem(itemId, !currentStatus);
    onRefresh();
  };

  const deleteList = async (id: string) => {
    if (window.confirm('Delete this checklist?')) {
      await travelDocService.deleteChecklist(id);
      onRefresh();
    }
  };

  const deleteItem = async (id: string) => {
    await travelDocService.deleteChecklistItem(id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <ClipboardList className="text-emerald-400" size={24} />
          Pre-Travel Checklists
        </h3>
        <button
          onClick={() => setIsAddingList(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-all text-sm"
        >
          <Plus size={18} />
          New Checklist
        </button>
      </div>

      {isAddingList && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-4 animate-in fade-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="e.g., Visa & Travel Docs"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleAddList}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all"
          >
            Create
          </button>
          <button
            onClick={() => setIsAddingList(false)}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checklists.map(list => (
          <div key={list.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden glass-effect flex flex-col">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-semibold text-white">{list.title}</h4>
              <button
                onClick={() => deleteList(list.id)}
                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="p-4 flex-1 space-y-3">
              {list.items.map(item => (
                <div key={item.id} className="flex items-start justify-between group gap-3">
                  <div 
                    className="flex items-start gap-3 cursor-pointer flex-1"
                    onClick={() => toggleItem(item.id, item.isCompleted)}
                  >
                    <div onClick={(e) => { e.stopPropagation(); toggleItem(item.id, item.isCompleted); }} className="mt-0.5">
                      {item.isCompleted ? (
                        <CheckSquare className="text-emerald-400" size={20} />
                      ) : (
                        <Square className="text-gray-600" size={20} />
                      )}
                    </div>
                    <div>
                      <p className={`${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {item.task}
                      </p>
                      {item.dueDate && (
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={10} />
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {addingItemTo === list.id ? (
                <div className="space-y-2 pt-2 border-t border-white/5 animate-in fade-in">
                  <input
                    autoFocus
                    type="text"
                    value={newItemTask}
                    onChange={(e) => setNewItemTask(e.target.value)}
                    placeholder="Task description..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newItemDueDate}
                      onChange={(e) => setNewItemDueDate(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddItem(list.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingItemTo(null)}
                      className="px-2 py-1.5 text-gray-400 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingItemTo(list.id)}
                  className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors pt-2"
                >
                  <Plus size={14} />
                  Add task
                </button>
              )}
            </div>
          </div>
        ))}

        {checklists.length === 0 && !isAddingList && (
          <div className="col-span-full text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
            <ClipboardList className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No checklists created. Keep your planning organized!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistManager;
