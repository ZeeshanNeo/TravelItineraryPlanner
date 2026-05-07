import React, { useState, useEffect } from 'react';
import { Shield, UserX, UserCheck, Search, Activity } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/shared/Toast';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/Admin/users');
      setUsers(response.data);
    } catch (err) {
      showToast('Security Breach: Access Denied or Network Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    try {
      await api.post(`/Admin/users/${user.id}/${action}`);
      showToast(`User ${user.email} ${user.isActive ? 'deactivated' : 'activated'}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Command Execution Failed', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-primary" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Voyager Pro // Security Protocol</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">Command Console</h1>
            <p className="text-slate-400 mt-4 font-medium max-w-xl">Enterprise-grade user management and system oversight. Maintain operational integrity across all sectors.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex items-center gap-8 backdrop-blur-xl">
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Entities</p>
               <p className="text-3xl font-black text-white">{users.length}</p>
             </div>
             <div className="w-px h-12 bg-white/10" />
             <div className="text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Active Nodes</p>
               <p className="text-3xl font-black text-primary">{users.filter(u => u.isActive).length}</p>
             </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="relative group">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search entities by name or email alias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-8 text-white text-xl font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Users Table/List */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Entity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access Level</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-10 py-12">
                        <div className="h-8 bg-white/5 rounded-xl w-3/4" />
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.map(user => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {user.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        user.role === 'Admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                          {user.isActive ? 'Operational' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(user)}
                          className={`p-3 rounded-xl transition-all ${
                            user.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title={user.isActive ? 'Deactivate Node' : 'Activate Node'}
                        >
                          {user.isActive ? <UserX size={20} /> : <UserCheck size={20} />}
                        </button>
                        <button className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all">
                          <Activity size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
