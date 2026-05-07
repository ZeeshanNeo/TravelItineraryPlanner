import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { Users, MessageSquare, CheckSquare, Plus, Mail, Shield, Trash2, Send } from 'lucide-react';
import { tripService } from '../services/trip.service';
import type { TripResponse } from '../services/trip.service';
import collaborationService from '../services/collaboration.service';

const Collaboration: React.FC = () => {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'members' | 'comments' | 'tasks'>('members');
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium' });

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
    const nextStatus = currentStatus === 'Completed' ? 'ToDo' : 'Completed';
    try {
      await collaborationService.updateTaskStatus(taskId, nextStatus);
      fetchCollabData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await collaborationService.createTask(selectedTripId, {
        ...newTask,
        status: 'ToDo'
      });
      setIsAddingTask(false);
      setNewTask({ title: '', description: '', priority: 'Medium' });
      fetchCollabData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2 uppercase">Collaboration Hub</h1>
            <p className="text-muted-foreground font-bold">Synchronize journey manifests and mission objectives with your elite team.</p>
          </div>

          <div className="w-full md:w-80">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block ml-1">Active Journey Manifest</label>
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

        {/* Navigation Tabs */}
        <div className="flex gap-4 p-2 bg-muted/30 rounded-[2rem] w-fit border border-border">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'members' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
              }`}
          >
            <Users size={18} />
            Members
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'comments' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
              }`}
          >
            <MessageSquare size={18} />
            Discussion
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'tasks' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'text-muted-foreground hover:bg-muted/50'
              }`}
          >
            <CheckSquare size={18} />
            Checklist
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] p-12 min-h-[600px] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] text-white">
          <div className="absolute -top-48 -right-48 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

          {activeTab === 'members' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="flex-1 space-y-8">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Team Manifest</h3>
                    <p className="text-slate-400 font-medium">Authorized personnel currently assigned to this operation.</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-primary/30 transition-all group backdrop-blur-xl">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner text-primary overflow-hidden border border-white/5">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userEmail}`} alt="Avatar" className="w-14 h-14 rounded-xl" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-white text-lg">{member.userName || member.userEmail.split('@')[0]}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Shield size={12} className="text-primary/80" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role}</span>
                          </div>
                        </div>
                        <button className="p-3 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-[400px] bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/10">
                  <h4 className="text-xl font-black text-white tracking-tight mb-2 text-center">Add Operative</h4>
                  <p className="text-[10px] text-slate-400 font-bold mb-10 text-center uppercase tracking-[0.2em]">Authorize new mission companions</p>
                  <form onSubmit={handleInvite} className="space-y-8">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type="email"
                        required
                        placeholder=" operative@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl font-bold text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                      />
                    </div>
                    <button type="submit" className="w-full h-16 bg-white/9 text-white rounded-2xl shadow-2xl shadow-primary/30 font-white uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all">
                      Dispatch Invitation
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="flex flex-col h-[650px] space-y-8">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Comms Channel</h3>
                <p className="text-slate-400 font-medium">Secured terminal for mission-critical discussion.</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-6 space-y-6 custom-scrollbar no-scrollbar scroll-smooth">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
                      <MessageSquare size={48} />
                    </div>
                    <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Frequency Silent</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-6 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} alt="User" className="w-10 h-10 rounded-xl" />
                      </div>
                      <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] rounded-tl-none p-6 border border-white/10 max-w-[80%] shadow-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-black text-primary/80 uppercase tracking-widest">{comment.userName || 'Agent'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 font-medium leading-relaxed">{comment.text || (comment as any).content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="relative group">
                <input
                  type="text"
                  placeholder="Initiate comms stream..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full h-20 pl-10 pr-40 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] font-bold text-white placeholder:text-slate-600 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all shadow-2xl"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 h-12 px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:scale-105 transition-all active:scale-95 shadow-xl shadow-primary/30">
                  <Send size={16} />
                  Transmit
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-8">
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Operation Checklist</h3>
                  <p className="text-slate-400 font-medium">Critical objectives and tactical milestones.</p>
                </div>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="h-14 px-8 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-amber-500/20"
                >
                  <Plus size={18} /> New Objective
                </button>
              </div>

              {isAddingTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
                  <form onSubmit={handleCreateTask} className="w-full max-w-lg bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-3xl space-y-8 animate-in zoom-in-95 duration-300">
                    <div>
                      <h4 className="text-2xl font-black text-white tracking-tight mb-2">New Mission Objective</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Define your next tactical milestone</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Objective Title</label>
                        <input
                          type="text"
                          required
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-amber-500/50 outline-none transition-all"
                          placeholder="e.g. Confirm Flight Manifest"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Priority Level</label>
                        <select
                          value={newTask.priority}
                          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                          className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold focus:border-amber-500/50 outline-none transition-all appearance-none"
                        >
                          <option value="Low" className="bg-slate-900">Low Clearance</option>
                          <option value="Medium" className="bg-slate-900">Standard</option>
                          <option value="High" className="bg-slate-900">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setIsAddingTask(false)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-white/5 transition-all">Cancel</button>
                      <button type="submit" className="flex-1 h-16 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 active:scale-95 transition-all">Establish Objective</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasks.map((task) => (
                  <div key={task.id} className={`flex items-start gap-6 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-xl hover:border-amber-500/30 transition-all group backdrop-blur-xl ${task.status === 'Completed' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <button
                      onClick={() => handleUpdateTaskStatus(task.id, task.status)}
                      className={`w-10 h-10 rounded-2xl border-2 shrink-0 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/10 hover:border-amber-500/50'
                        }`}
                    >
                      {task.status === 'Completed' && <CheckSquare size={20} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-lg font-bold transition-all truncate ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-white/5 text-slate-400 border border-white/10'
                          }`}>
                          {task.priority || 'Standard'}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Assigned / Active</span>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && !isAddingTask && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 opacity-30 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <CheckSquare size={64} />
                    <p className="font-black uppercase tracking-[0.3em] text-xs text-white">No active objectives</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Collaboration;
