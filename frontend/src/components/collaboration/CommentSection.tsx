import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Clock } from 'lucide-react';
import collaborationService from '../../services/collaboration.service';
import type { Comment } from '../../services/collaboration.service';

interface CommentSectionProps {
  tripId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ tripId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [tripId]);

  const fetchComments = async () => {
    try {
      const data = await collaborationService.getComments(tripId);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await collaborationService.addComment(tripId, newComment);
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to send comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/5 border border-white/10 rounded-[2.5rem] glass-effect overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-primary" size={20} />
          Group Discussion
        </h4>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" ref={scrollRef}>
        {comments.map((comment) => (
          <div key={comment.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {comment.userName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{comment.userName}</span>
                  <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                  <p className="text-gray-300 text-sm leading-relaxed">{comment.text || (comment as any).content || (comment as any).message}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
            <MessageSquare size={48} />
            <p className="font-bold">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-[1.5rem] pl-6 pr-14 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
