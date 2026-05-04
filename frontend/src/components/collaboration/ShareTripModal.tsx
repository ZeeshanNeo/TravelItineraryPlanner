import React, { useState } from 'react';
import { X, Mail, Shield, UserPlus } from 'lucide-react';
import collaborationService from '../../services/collaboration.service';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess: () => void;
}

const ShareTripModal: React.FC<ShareTripModalProps> = ({ isOpen, onClose, tripId, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Collaborator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await collaborationService.shareTrip(tripId, email, role);
      setEmail('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-black text-white">Invite Members</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Friend's Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                placeholder="travel-buddy@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Level</label>
            <div className="grid grid-cols-2 gap-3">
              {['Collaborator', 'Viewer'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all font-bold ${
                    role === r 
                      ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  <Shield size={16} />
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? 'Sending...' : (
              <>
                <UserPlus size={20} />
                Send Invitation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShareTripModal;
