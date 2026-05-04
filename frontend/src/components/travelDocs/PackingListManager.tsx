import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Package, Tag, ChevronRight, ChevronDown } from 'lucide-react';
import type { PackingList } from '../../services/travelDoc.service';
import travelDocService from '../../services/travelDoc.service';

interface PackingListManagerProps {
  tripId: string;
  lists: PackingList[];
  onRefresh: () => void;
}

const PackingListManager: React.FC<PackingListManagerProps> = ({ tripId, lists, onRefresh }) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListCategory, setNewListCategory] = useState('Clothing');
  const [addingItemToList, setAddingItemToList] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({});


  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      await travelDocService.createPackingList(tripId, { title: newListTitle, category: newListCategory });
      setNewListTitle('');
      setIsAddingList(false);
      onRefresh();
    } catch (err) {
      console.error('Error adding list:', err);
    }
  };

  const handleAddItem = async (listId: string) => {
    if (!newItemName.trim()) return;
    try {
      await travelDocService.addPackingItem(listId, { name: newItemName, quantity: 1 });
      setNewItemName('');
      setAddingItemToList(null);
      onRefresh();
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    try {
      await travelDocService.updatePackingItem(itemId, !currentStatus);
      onRefresh();
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const deleteList = async (id: string) => {
    if (window.confirm('Delete this packing list?')) {
      await travelDocService.deletePackingList(id);
      onRefresh();
    }
  };

  const deleteItem = async (id: string) => {
    await travelDocService.deletePackingItem(id);
    onRefresh();
  };

  const toggleExpand = (id: string) => {
    setExpandedLists(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Package className="text-indigo-400" size={24} />
          Packing Lists
        </h3>
        <button
          onClick={() => setIsAddingList(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg border border-indigo-500/30 transition-all text-sm"
        >
          <Plus size={18} />
          Add List
        </button>
      </div>

      {isAddingList && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">List Title</label>
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="e.g., Beach Gear"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Category</label>
              <select
                value={newListCategory}
                onChange={(e) => setNewListCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Clothing">Clothing</option>
                <option value="Gear">Gear</option>
                <option value="Toiletries">Toiletries</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsAddingList(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddList}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all"
            >
              Create List
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {lists.map(list => {
          const packedCount = list.items.filter(i => i.isPacked).length;
          const totalCount = list.items.length;
          const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;
          const isExpanded = expandedLists[list.id] !== false; // Default to true

          return (
            <div key={list.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden glass-effect">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(list.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Tag className="text-indigo-400" size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{list.title}</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-tighter">{list.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    {packedCount}/{totalCount}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronDown size={20} className="text-gray-500" /> : <ChevronRight size={20} className="text-gray-500" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                  <div className="space-y-2 pt-4">
                    {list.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div 
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => toggleItem(item.id, item.isPacked)}
                        >
                          {item.isPacked ? (
                            <CheckCircle2 className="text-green-400" size={20} />
                          ) : (
                            <Circle className="text-gray-600" size={20} />
                          )}
                          <span className={`${item.isPacked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                            {item.name}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {addingItemToList === list.id ? (
                      <div className="flex gap-2 pt-2">
                        <input
                          autoFocus
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem(list.id)}
                          placeholder="What else to pack?"
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                        <button
                          onClick={() => handleAddItem(list.id)}
                          className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingItemToList(null)}
                          className="px-2 py-1.5 text-gray-400 hover:text-white text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingItemToList(list.id)}
                        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors pt-2"
                      >
                        <Plus size={14} />
                        Add item
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {lists.length === 0 && !isAddingList && (
          <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
            <Package className="mx-auto text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">No packing lists yet. Start by creating one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingListManager;
