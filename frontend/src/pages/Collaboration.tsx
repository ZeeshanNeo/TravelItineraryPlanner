import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Users, MessageSquare, CheckSquare, Plus, Mail, Shield, Trash2, Send } from 'lucide-react';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';
import collaborationService from '../services/collaboration.service';
import Button from '../components/shared/Button';

const Collaboration: React.FC = () => {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'comments' | 'tasks'>('members');
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      fetchCollabData();
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

  const fetchCollabData = async () => {
    try {
      const [membersData, commentsData, tasksData] = await Promise.all([
        collaborationService.getMembers(selectedTripId),
        collaborationService.getComments(selectedTripId),
        collaborationService.getTasks(selectedTripId)
      ]);
      setMembers(membersData);
      setComments(commentsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching collab data:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await collaborationService.shareTrip(selectedTripId, inviteEmail, 'Collaborator');
      setInviteEmail('');
      fetchCollabData();
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment) return;
    try {
      await collaborationService.addComment(selectedTripId, newComment);
      setNewComment('');
      fetchCollabData();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      await collaborationService.updateTaskStatus(taskId, nextStatus);
      fetchCollabData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Collaboration</h1>
            <p className="text-muted-foreground font-bold">Plan together with your travel companions.</p>
          </div>
          
          <div className="w-full md:w-80">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">Active Journey</label>
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
                <Users size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 p-2 bg-muted/50 rounded-[2rem] w-fit">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'members' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Users size={18} />
            Members
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'comments' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <MessageSquare size={18} />
            Discussion
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all ${
              activeTab === 'tasks' ? 'bg-card text-primary shadow-lg' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <CheckSquare size={18} />
            Tasks
          </button>
        </div>

        <div className="glass rounded-[3.5rem] p-10 border border-white/20 min-h-[500px]">
          {activeTab === 'members' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-foreground tracking-tight mb-6">Trip Companions</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-6 p-6 bg-muted/50 rounded-[2.5rem] border border-border group">
                        <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center shadow-sm text-primary">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userEmail}`} alt="Avatar" className="w-12 h-12 rounded-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-foreground">{member.userName || member.userEmail.split('@')[0]}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Shield size={12} className="text-primary/60" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{member.role}</span>
                          </div>
                        </div>
                        <button className="p-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-96 bg-card rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-border">
                  <h4 className="text-lg font-black text-foreground tracking-tight mb-2 text-center">Invite Companion</h4>
                  <p className="text-xs text-muted-foreground font-bold mb-8 text-center uppercase tracking-widest">Add more people to your journey</p>
                  <form onSubmit={handleInvite} className="space-y-6">
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input
                        type="email"
                        placeholder="Companion's Email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 bg-muted rounded-2xl font-bold text-foreground placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      />
                    </div>
                    <Button variant="primary" className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-xs">
                      Send Invitation
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="flex flex-col h-[600px]">
              <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar mb-8">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center text-slate-200">
                      <MessageSquare size={40} />
                    </div>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No discussions yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 max-w-[80%]">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} alt="User" className="w-10 h-10 rounded-xl bg-card shadow-sm" />
                      <div className="bg-muted rounded-[1.5rem] rounded-tl-none p-6 border border-border">
                        <p className="text-sm text-foreground font-bold">{comment.content}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-2">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handleAddComment} className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full h-16 pl-8 pr-32 bg-muted rounded-[1.5rem] font-bold text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 h-10 px-6 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                  <Send size={14} />
                  Post
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-foreground tracking-tight">Planning Tasks</h3>
                <Button variant="outline" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-border">
                  <Plus size={16} /> New Task
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-6 p-6 bg-card rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-shadow group">
                    <button 
                      onClick={() => handleUpdateTaskStatus(task.id, task.status)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                        task.status === 'Completed' ? 'bg-primary border-primary text-white' : 'border-border hover:border-primary'
                      }`}
                    >
                      {task.status === 'Completed' && <CheckSquare size={16} />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-bold transition-all ${task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      {task.assignedTo && (
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Assigned to Companion</p>
                      )}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      task.priority === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.priority || 'Medium'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Collaboration;
