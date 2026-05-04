import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Trash2, UserPlus, DollarSign } from 'lucide-react';
import collaborationService from '../../services/collaboration.service';
import type { TripMember } from '../../services/collaboration.service';
import ShareTripModal from './ShareTripModal';
import CommentSection from './CommentSection';
import TaskBoard from './TaskBoard';
import SharedExpenses from './SharedExpenses';

interface CollaborationModuleProps {
// ... existing props ...

  tripId: string;
}

const CollaborationModule: React.FC<CollaborationModuleProps> = ({ tripId }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'discussions' | 'tasks'>('members');
  const [members, setMembers] = useState<TripMember[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const memberData = await collaborationService.getMembers(tripId);
      setMembers(memberData);
    } catch (err) {
      console.error('Error fetching collaboration data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (window.confirm('Remove this member?')) {
      await collaborationService.removeMember(id);
      fetchData();
    }
  };

  // Custom CheckSquare for tabs
  const CheckSquareIcon = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );

  if (loading) return <div className="text-white/50 animate-pulse text-center py-20">Loading group...</div>;

  return (
    <div className="space-y-8">
      {/* Sub-tab Navigation */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'members' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={18} />
            Trip Members
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'discussions' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={18} />
            Group Chat
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'tasks' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckSquareIcon size={18} />
            Planning Tasks
          </button>
          <button
            onClick={() => setActiveTab('expenses' as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === ('expenses' as any)
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <DollarSign size={18} />
            Group Expenses
          </button>
        </div>
        
        {activeTab === 'members' && (
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-all text-xs font-black uppercase tracking-widest"
          >
            <UserPlus size={16} />
            Invite
          </button>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => (
              <div key={member.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 glass-effect flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                    {member.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{member.userName}</h4>
                    <p className="text-xs text-gray-500 font-medium">{member.role}</p>
                  </div>
                </div>
                {member.role !== 'Owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
                <Users className="mx-auto text-white/10 mb-4" size={64} />
                <p className="text-white/40 font-bold">No members yet. Invite your travel buddies!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discussions' && (
          <CommentSection tripId={tripId} />
        )}

        {activeTab === 'tasks' && (
          <TaskBoard tripId={tripId} members={members} />
        )}

        {activeTab === ('expenses' as any) && (
          <SharedExpenses tripId={tripId} />
        )}
      </div>

      <ShareTripModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        tripId={tripId}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default CollaborationModule;
