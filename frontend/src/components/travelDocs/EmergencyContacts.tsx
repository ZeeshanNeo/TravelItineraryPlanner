import React, { useState } from 'react';
import { Plus, Phone, Mail, User, Trash2, ShieldAlert, MapPin, MoreVertical } from 'lucide-react';
import type { EmergencyContact } from '../../services/travelDoc.service';
import travelDocService from '../../services/travelDoc.service';

interface EmergencyContactsProps {
  tripId: string;
  contacts: EmergencyContact[];
  onRefresh: () => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ tripId, contacts, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<EmergencyContact, 'id' | 'tripId'>>({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    isLocal: false,
    notes: ''
  });

  const handleSave = async () => {
    if (!formData.name || !formData.phoneNumber) return;
    try {
      if (editingId) {
        await travelDocService.updateContact(editingId, formData);
      } else {
        await travelDocService.createContact(tripId, formData);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Error saving contact:', err);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber,
      email: contact.email,
      isLocal: contact.isLocal,
      notes: contact.notes
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this contact?')) {
      await travelDocService.deleteContact(id);
      onRefresh();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      phoneNumber: '',
      email: '',
      isLocal: false,
      notes: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="text-rose-400" size={24} />
          Emergency Contacts
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg border border-rose-500/30 transition-all text-sm"
          >
            <Plus size={18} />
            Add Contact
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 glass-effect">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Relationship</label>
                <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Spouse, Friend, Embassy..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <input
                  type="checkbox"
                  id="isLocal"
                  checked={formData.isLocal}
                  onChange={(e) => setFormData({ ...formData, isLocal: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/5 border-white/20 text-rose-500 focus:ring-rose-500/50"
                />
                <label htmlFor="isLocal" className="text-sm text-gray-300 flex items-center gap-2">
                  <MapPin size={14} className="text-rose-400" />
                  Local Contact (at destination)
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+1 234 567 890"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 text-gray-500" size={16} />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Additional Notes</label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Policy numbers, office hours, etc."
                    rows={1}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-rose-500/20"
            >
              {editingId ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group relative overflow-hidden glass-effect">
            {contact.isLocal && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl border-b border-l border-rose-500/30">
                Local
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <User className="text-rose-400" size={20} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h4 className="font-bold text-white text-lg">{contact.name}</h4>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{contact.relationship}</p>
            </div>

            <div className="space-y-3">
              <a 
                href={`tel:${contact.phoneNumber}`}
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors group/link"
              >
                <div className="p-1.5 bg-white/5 rounded-lg group-hover/link:bg-rose-500/10 transition-colors">
                    <Phone size={14} />
                </div>
                {contact.phoneNumber}
              </a>
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors group/link"
                >
                  <div className="p-1.5 bg-white/5 rounded-lg group-hover/link:bg-rose-500/10 transition-colors">
                    <Mail size={14} />
                  </div>
                  {contact.email}
                </a>
              )}
            </div>

            {contact.notes && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 italic line-clamp-2">{contact.notes}</p>
              </div>
            )}
          </div>
        ))}

        {contacts.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-16 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <ShieldAlert className="mx-auto text-gray-600 mb-4" size={56} />
            <h4 className="text-white font-medium mb-1">No emergency contacts</h4>
            <p className="text-gray-400 text-sm">Better safe than sorry! Add important contacts for your trip.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;
