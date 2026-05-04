import React, { useState, useEffect } from 'react';
import { Package, ClipboardList, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import type { PackingList, Checklist, EmergencyContact, TravelDocument, LocalInfoNote } from '../../services/travelDoc.service';
import travelDocService from '../../services/travelDoc.service';
import PackingListManager from './PackingListManager';
import ChecklistManager from './ChecklistManager';
import EmergencyContacts from './EmergencyContacts';
import DocumentVault from './DocumentVault';
import LocalInfoNotes from './LocalInfoNotes';

interface TravelDocModuleProps {
  tripId: string;
}

type TabType = 'packing' | 'checklist' | 'contacts' | 'vault' | 'info';

const TravelDocModule: React.FC<TravelDocModuleProps> = ({ tripId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('packing');
  const [data, setData] = useState<{
    packingLists: PackingList[];
    checklists: Checklist[];
    contacts: EmergencyContact[];
    documents: TravelDocument[];
    notes: LocalInfoNote[];
  }>({
    packingLists: [],
    checklists: [],
    contacts: [],
    documents: [],
    notes: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [tripId, refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [packing, checks, contacts, docs, notes] = await Promise.all([
        travelDocService.getPackingLists(tripId),
        travelDocService.getChecklists(tripId),
        travelDocService.getContacts(tripId),
        travelDocService.getDocuments(tripId),
        travelDocService.getLocalInfo(tripId)
      ]);
      setData({
        packingLists: packing,
        checklists: checks,
        contacts: contacts,
        documents: docs,
        notes: notes
      });
    } catch (err) {
      console.error('Error fetching travel docs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'packing', label: 'Packing', icon: <Package size={18} /> },
    { id: 'checklist', label: 'Checklists', icon: <ClipboardList size={18} /> },
    { id: 'contacts', label: 'Contacts', icon: <ShieldAlert size={18} /> },
    { id: 'vault', label: 'Vault', icon: <ShieldCheck size={18} /> },
    { id: 'info', label: 'Local Info', icon: <Info size={18} /> },
  ];

  if (loading && refreshKey === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse">Organizing your documentation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Travel Documentation</h2>
          <p className="text-gray-400">Essential details and resources for your journey</p>
        </div>
        
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl self-stretch md:self-auto overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'packing' && (
          <PackingListManager 
            tripId={tripId} 
            lists={data.packingLists} 
            onRefresh={() => setRefreshKey(prev => prev + 1)} 
          />
        )}
        {activeTab === 'checklist' && (
          <ChecklistManager 
            tripId={tripId} 
            checklists={data.checklists} 
            onRefresh={() => setRefreshKey(prev => prev + 1)} 
          />
        )}
        {activeTab === 'contacts' && (
          <EmergencyContacts 
            tripId={tripId} 
            contacts={data.contacts} 
            onRefresh={() => setRefreshKey(prev => prev + 1)} 
          />
        )}
        {activeTab === 'vault' && (
          <DocumentVault 
            tripId={tripId} 
            documents={data.documents} 
            onRefresh={() => setRefreshKey(prev => prev + 1)} 
          />
        )}
        {activeTab === 'info' && (
          <LocalInfoNotes 
            tripId={tripId} 
            notes={data.notes} 
            onRefresh={() => setRefreshKey(prev => prev + 1)} 
          />
        )}
      </div>
    </div>
  );
};

export default TravelDocModule;
