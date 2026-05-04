import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { 
  FolderOpen, Shield, Phone, Info, ListChecks, 
  Plus, Download, Trash2, FileText,
  User, Globe, AlertTriangle, Mail
} from 'lucide-react';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';
import travelDocService from '../services/travelDoc.service';
import type { TravelDocument, EmergencyContact, LocalInfoNote, PackingList, Checklist } from '../services/travelDoc.service';
import Button from '../components/shared/Button';

const Vault: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfoNote[]>([]);
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [activeTab, setActiveTab] = useState<'docs' | 'contacts' | 'info' | 'lists'>('docs');

  useEffect(() => {
    if (tripId) {
      setSelectedTripId(tripId);
    } else {
      fetchTrips();
    }
  }, [tripId]);

  useEffect(() => {
    if (selectedTripId) {
      fetchVaultData();
    }
  }, [selectedTripId]);

  const fetchTrips = async () => {
    try {
      const data = await tripService.getTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTripId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const fetchVaultData = async () => {
    try {
      const [docs, cons, info, packs, checks] = await Promise.all([
        travelDocService.getDocuments(selectedTripId),
        travelDocService.getContacts(selectedTripId),
        travelDocService.getLocalInfo(selectedTripId),
        travelDocService.getPackingLists(selectedTripId),
        travelDocService.getChecklists(selectedTripId)
      ]);
      setDocuments(docs);
      setContacts(cons);
      setLocalInfo(info);
      setPackingLists(packs);
      setChecklists(checks);
    } catch (error) {
      console.error('Error fetching vault data:', error);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      await travelDocService.downloadDocument(docId);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await travelDocService.deleteDocument(id);
      fetchVaultData();
    } catch (error) {
      console.error('Error deleting doc:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
              {tripId ? 'Trip Vault' : 'Secure Vault'}
            </h1>
            <p className="text-muted-foreground font-bold">
              {tripId ? 'Essential documents and intelligence for your current journey.' : 'Your essential travel documents and local intelligence.'}
            </p>
          </div>
          
          {!tripId && (
            <div className="w-full md:w-80">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Journey Focus</label>
              <div className="relative">
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full h-14 bg-card border-2 border-border rounded-2xl px-6 font-bold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none shadow-sm"
                >
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.title}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                  <FolderOpen size={18} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 p-2 bg-muted/50 rounded-[2rem] w-fit">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'docs' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Shield size={18} />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'contacts' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Phone size={18} />
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'info' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Info size={18} />
            Local Info
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'lists' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <ListChecks size={18} />
            Lists
          </button>
        </div>

        <div className="glass rounded-[3.5rem] p-10 border border-white/20 min-h-[500px]">
          {activeTab === 'docs' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Identity & Travel Docs</h3>
                <Button variant="primary" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Plus size={16} /> Upload Doc
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-8 bg-card rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <FileText size={28} />
                    </div>
                    <h4 className="font-black text-foreground text-lg mb-1">{doc.title}</h4>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">{doc.type}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-bold text-muted-foreground">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownload(doc.id)}
                          className="p-3 bg-muted hover:bg-primary hover:text-white rounded-xl text-muted-foreground transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-3 bg-muted hover:bg-rose-500 hover:text-white rounded-xl text-muted-foreground transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Emergency Contacts</h3>
                <Button variant="outline" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-border">
                  <Plus size={16} /> Add Contact
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center shadow-sm text-primary">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-foreground text-lg">{contact.name}</h4>
                        {contact.isLocal && (
                          <span className="px-3 py-1 bg-green-50 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest">Local Service</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-bold mb-4 uppercase tracking-widest">{contact.relationship}</p>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-foreground flex items-center gap-3">
                          <Phone size={14} className="text-slate-300" /> {contact.phoneNumber}
                        </p>
                        <p className="text-sm font-bold text-foreground flex items-center gap-3">
                          <Mail size={14} className="text-slate-300" /> {contact.email || 'No email provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Local Intelligence</h3>
                <Button variant="outline" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-border">
                  <Plus size={16} /> Add Note
                </Button>
              </div>

              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {localInfo.map((note) => (
                  <div key={note.id} className="break-inside-avoid p-8 bg-card rounded-[2.5rem] border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe size={16} className="text-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{note.category}</span>
                    </div>
                    <h4 className="font-black text-foreground text-lg mb-4">{note.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed bg-muted/50 p-6 rounded-2xl border border-slate-50">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-8">Packing Collections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packingLists.map((list) => (
                    <div key={list.id} className="p-8 bg-card rounded-[2.5rem] border border-border shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-black text-foreground text-lg mb-1">{list.title}</h4>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{list.category}</span>
                        </div>
                        <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {list.items.filter(i => i.isPacked).length}/{list.items.length} Packed
                        </span>
                      </div>
                      <div className="space-y-3">
                        {list.items.slice(0, 3).map(item => (
                          <div key={item.id} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                            <div className={`w-2 h-2 rounded-full ${item.isPacked ? 'bg-green-500' : 'bg-slate-200'}`} />
                            {item.name}
                          </div>
                        ))}
                        {list.items.length > 3 && (
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-4">+ {list.items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-foreground tracking-tight mb-8">Pre-Travel Checklists</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {checklists.map((checklist) => (
                    <div key={checklist.id} className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <AlertTriangle size={18} className="text-yellow-400" />
                        </div>
                        <h4 className="font-black text-lg tracking-tight">{checklist.title}</h4>
                      </div>
                      <div className="space-y-4">
                        {checklist.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className={`text-sm font-bold ${item.isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                              {item.task}
                            </span>
                            <div className={`w-5 h-5 rounded-lg border-2 ${item.isCompleted ? 'bg-primary border-primary' : 'border-white/20'}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Vault;
