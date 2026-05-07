import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Clock, User } from 'lucide-react';
import collaborationService from '../../services/collaboration.service';
import type { TripTask, TripMember } from '../../services/collaboration.service';

interface TaskBoardProps {
  tripId: string;
  members: TripMember[];
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tripId, members }) => {
  const [tasks, setTasks] = useState<TripTask[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToUserId: '', dueDate: '' });

  useEffect(() => {
    fetchTasks();
  }, [tripId]);

  const fetchTasks = async () => {
    const data = await collaborationService.getTasks(tripId);
    setTasks(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await collaborationService.createTask(tripId, {
      title: newTask.title,
      description: newTask.description || newTask.title,
      assignedToUserId: newTask.assignedToUserId || null,
      dueDate: newTask.dueDate || null
    });
    setNewTask({ title: '', description: '', assignedToUserId: '', dueDate: '' });
    setIsAdding(false);
    fetchTasks();
  };

  const toggleStatus = async (task: TripTask) => {
    const nextStatus = task.status === 'Completed' ? 'ToDo' : 'Completed';
    await collaborationService.updateTaskStatus(task.id, nextStatus);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckSquareIcon className="text-amber-400" size={24} />
          Planning Checklist
        </h4>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/30 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white/5 border border-amber-500/30 p-6 rounded-[2rem] glass-effect space-y-4 animate-in zoom-in-95 duration-300">
          <input
            type="text"
            required
            placeholder="What needs to be done?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full bg-transparent text-white text-lg font-bold border-none focus:ring-0 placeholder:text-gray-600"
          />
          <textarea
            placeholder="Add some details..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none min-h-[100px]"
          />
          <div className="flex flex-wrap gap-4">
            <select
              value={newTask.assignedToUserId}
              onChange={(e) => setNewTask({ ...newTask, assignedToUserId: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-400 focus:outline-none"
            >
              <option value="">Assign to...</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId} className="bg-slate-900">{m.userName}</option>
              ))}
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-amber-500 text-white rounded-xl font-black">Save Task</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-[1.5rem] glass-effect transition-all ${task.status === 'Completed' ? 'opacity-50 grayscale' : ''}`}
          >
            <button onClick={() => toggleStatus(task)} className="shrink-0 transition-transform hover:scale-110">
              {task.status === 'Completed' ? (
                <CheckCircle2 size={28} className="text-emerald-500" />
              ) : (
                <Circle size={28} className="text-gray-500" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h5 className={`text-lg font-bold text-white truncate ${task.status === 'Completed' ? 'line-through' : ''}`}>
                {task.title}
              </h5>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <User size={12} />
                  {task.assignedToUserName}
                </span>
                {task.dueDate && (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-500/60 uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && !isAdding && (
          <div className="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
            <CheckSquareIcon className="mx-auto text-white/10 mb-4" size={64} />
            <p className="text-white/40 font-bold">No tasks assigned yet. Start planning!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal icon fix
const CheckSquareIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export default TaskBoard;
