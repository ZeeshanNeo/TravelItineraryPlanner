import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { 
  FolderOpen, Shield, Phone, Info, ListChecks, 
  Plus, Download, Trash2, FileText,
  User, Globe, AlertTriangle, Mail, X, Upload
} from 'lucide-react';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';
import travelDocService, { TravelDocumentType, LocalInfoCategory } from '../services/travelDoc.service';
import type { TravelDocument, EmergencyContact, LocalInfoNote, PackingList, Checklist, TravelDocumentTypeEnum, LocalInfoCategoryEnum } from '../services/travelDoc.service';

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

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Form States
  const [uploadData, setUploadData] = useState({ title: '', type: 'Passport' as TravelDocumentTypeEnum, file: null as File | null });
  const [contactData, setContactData] = useState({ name: '', relationship: '', phoneNumber: '', email: '', isLocal: false, notes: '' });
  const [noteData, setNoteData] = useState({ title: '', category: 'Customs' as LocalInfoCategoryEnum, content: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setDocuments(docs || []);
      setContacts(cons || []);
      setLocalInfo(info || []);
      setPackingLists(packs || []);
      setChecklists(checks || []);
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

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await travelDocService.deleteContact(id);
      fetchVaultData();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await travelDocService.deleteLocalInfo(id);
      fetchVaultData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) return;
    try {
      await travelDocService.uploadDocument(selectedTripId, uploadData.title, uploadData.type, uploadData.file);
      setIsUploadModalOpen(false);
      setUploadData({ title: '', type: 'Passport', file: null });
      fetchVaultData();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactData.name || !contactData.phoneNumber) return;
    try {
      await travelDocService.createContact(selectedTripId, contactData);
      setIsContactModalOpen(false);
      setContactData({ name: '', relationship: '', phoneNumber: '', email: '', isLocal: false, notes: '' });
      fetchVaultData();
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteData.title || !noteData.content) return;
    try {
      await travelDocService.createLocalInfo(selectedTripId, noteData);
      setIsNoteModalOpen(false);
      setNoteData({ title: '', category: 'Customs', content: '' });
      fetchVaultData();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2 uppercase">Secure Vault</h1>
            <p className="text-muted-foreground font-bold">Encrypted intelligence and mission-critical travel manifests.</p>
          </div>
          
          {!tripId && (
            <div className="w-full md:w-80">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Journey Manifest Focus</label>
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
        <div className="flex flex-wrap gap-4 p-2 bg-muted/30 rounded-[2rem] w-fit border border-border">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${
              activeTab === 'docs' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Shield size={18} />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${
              activeTab === 'contacts' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Phone size={18} />
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${
              activeTab === 'info' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Info size={18} />
            Local Info
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${
              activeTab === 'lists' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <ListChecks size={18} />
            Lists
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] p-12 min-h-[600px] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] text-white">
          <div className="absolute -top-48 -right-48 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

          {activeTab === 'docs' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-8">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-1">Identity Manifests</h3>
                  <p className="text-slate-400 font-medium">Secured travel authorizations and credentials.</p>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20"
                >
                  <Plus size={18} /> UPLOAD DOC
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm hover:border-primary/30 transition-all group backdrop-blur-xl">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-6 border border-white/5 shadow-inner">
                      <FileText size={28} />
                    </div>
                    <h4 className="font-black text-white text-lg mb-1">{doc.title}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">{doc.type}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownload(doc.id)}
                          className="p-3 bg-white/5 hover:bg-primary text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-3 bg-white/5 hover:bg-rose-500 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <Shield size={64} />
                    <p className="font-black uppercase tracking-[0.3em] text-xs text-white">No documents secured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-8">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-1">Emergency Operatives</h3>
                  <p className="text-slate-400 font-medium">Critical contacts for mission-support and local coordination.</p>
                </div>
                <button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="h-14 px-8 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/20"
                >
                  <Plus size={18} /> ADD CONTACT
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-start gap-6 backdrop-blur-xl relative group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner text-primary border border-white/5 shrink-0">
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-white text-lg">{contact.name}</h4>
                        {contact.isLocal && (
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">Local Unit</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-black mb-4 uppercase tracking-widest">{contact.relationship}</p>
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-300 flex items-center gap-3">
                          <Phone size={14} className="text-slate-500" /> {contact.phoneNumber}
                        </p>
                        <p className="text-sm font-bold text-slate-300 flex items-center gap-3">
                          <Mail size={14} className="text-slate-500" /> {contact.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteContact(contact.id)}
                      className="absolute top-8 right-8 p-3 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <Phone size={64} />
                    <p className="font-black uppercase tracking-[0.3em] text-xs text-white">No contacts registered</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-8">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-1">Local Intelligence</h3>
                  <p className="text-slate-400 font-medium">Critical insights on customs, procedures, and logistics.</p>
                </div>
                <button 
                  onClick={() => setIsNoteModalOpen(true)}
                  className="h-14 px-8 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/20"
                >
                  <Plus size={18} /> ADD NOTE
                </button>
              </div>

              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {localInfo.map((note) => (
                  <div key={note.id} className="break-inside-avoid p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-sm backdrop-blur-xl relative group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Globe size={16} className="text-primary" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{note.category}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4 className="font-black text-white text-lg mb-4">{note.title}</h4>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/5">
                      {note.content}
                    </p>
                  </div>
                ))}
                {localInfo.length === 0 && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <Info size={64} />
                    <p className="font-black uppercase tracking-[0.3em] text-xs text-white">No local intelligence gathered</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="space-y-12">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-8">Supply Manifests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packingLists.map((list) => (
                    <div key={list.id} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-black text-white text-lg mb-1">{list.title}</h4>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{list.category}</span>
                        </div>
                        <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                          {list.items.filter(i => i.isPacked).length}/{list.items.length} Ready
                        </span>
                      </div>
                      <div className="space-y-3">
                        {list.items.slice(0, 3).map(item => (
                          <div key={item.id} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                            <div className={`w-2 h-2 rounded-full ${item.isPacked ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`} />
                            {item.name}
                          </div>
                        ))}
                        {list.items.length > 3 && (
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">+ {list.items.length - 3} more assets</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-8">Pre-Mission Checks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {checklists.map((checklist) => (
                    <div key={checklist.id} className="p-8 bg-slate-900 rounded-[3rem] border border-white/5 shadow-2xl">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                          <AlertTriangle size={20} className="text-amber-500" />
                        </div>
                        <h4 className="font-black text-xl tracking-tight text-white">{checklist.title}</h4>
                      </div>
                      <div className="space-y-4">
                        {checklist.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                            <span className={`text-sm font-bold ${item.isCompleted ? 'text-slate-600 line-through' : 'text-white'}`}>
                              {item.task}
                            </span>
                            <div className={`w-6 h-6 rounded-lg border-2 transition-all ${item.isCompleted ? 'bg-primary border-primary' : 'border-white/10 group-hover:border-primary/50'}`}>
                              {item.isCompleted && <ListChecks size={14} className="text-white mx-auto mt-0.5" />}
                            </div>
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <form onSubmit={handleUploadSubmit} className="w-full max-w-lg bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">Secure Manifest Upload</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Encrypt and store travel credentials</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-3 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-primary/50 outline-none transition-all"
                  placeholder="e.g. Passport Main Page"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Manifest Type</label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value as TravelDocumentTypeEnum })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-primary/50 outline-none transition-all appearance-none"
                >
                  {Object.values(TravelDocumentType).map(type => (
                    <option key={type} value={type} className="bg-slate-900">{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Target File</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-white/[0.07] transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  />
                  <Upload className="text-slate-500 group-hover:text-primary transition-colors" size={24} />
                  <span className="text-xs font-bold text-slate-400">
                    {uploadData.file ? uploadData.file.name : 'Select or drop manifest file'}
                  </span>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all">
              Initialize Security Transfer
            </button>
          </form>
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <form onSubmit={handleContactSubmit} className="w-full max-w-lg bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">New Emergency Operative</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Register mission support contact</p>
              </div>
              <button onClick={() => setIsContactModalOpen(false)} className="p-3 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Relationship</label>
                <input
                  type="text"
                  value={contactData.relationship}
                  onChange={(e) => setContactData({ ...contactData, relationship: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                  placeholder="e.g. Next of Kin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Comms Line</label>
                <input
                  type="text"
                  required
                  value={contactData.phoneNumber}
                  onChange={(e) => setContactData({ ...contactData, phoneNumber: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                  placeholder="+X XXX XXX XXXX"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Secure Email</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-4 px-2 col-span-2">
                 <button 
                  type="button"
                  onClick={() => setContactData({ ...contactData, isLocal: !contactData.isLocal })}
                  className={`w-12 h-6 rounded-full transition-all relative ${contactData.isLocal ? 'bg-green-500' : 'bg-slate-700'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${contactData.isLocal ? 'left-7' : 'left-1'}`} />
                 </button>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designate as Local Support Unit</span>
              </div>
            </div>

            <button type="submit" className="w-full h-16 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
              Establish Operative Connection
            </button>
          </form>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <form onSubmit={handleNoteSubmit} className="w-full max-w-lg bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-black text-white tracking-tight mb-1 uppercase">Add Local Intelligence</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Record critical destination insights</p>
              </div>
              <button onClick={() => setIsNoteModalOpen(false)} className="p-3 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Intelligence Title</label>
                <input
                  type="text"
                  required
                  value={noteData.title}
                  onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
                  placeholder="e.g. Arrival Procedures"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Category Sector</label>
                <select
                  value={noteData.category}
                  onChange={(e) => setNoteData({ ...noteData, category: e.target.value as LocalInfoCategoryEnum })}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-indigo-500/50 outline-none transition-all appearance-none"
                >
                  {Object.values(LocalInfoCategory).map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Insight Content</label>
                <textarea
                  required
                  rows={4}
                  value={noteData.content}
                  onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold focus:border-indigo-500/50 outline-none transition-all resize-none"
                  placeholder="Record tactical details here..."
                />
              </div>
            </div>

            <button type="submit" className="w-full h-16 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
              Commit Intelligence to Vault
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default Vault;
