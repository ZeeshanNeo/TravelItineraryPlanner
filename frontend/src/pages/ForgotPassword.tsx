import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ChevronRight, ShieldCheck, Globe } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useToast } from '../components/shared/Toast';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
      showToast('Reset link sent to your email', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send reset email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#0a0c12] selection:bg-primary/30">
      {/* Cinematic Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0a0c12]"></div>
        <div className="absolute inset-0 bg-mesh opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0c12] via-[#0f172a]/40 to-[#0a0c12]"></div>

        {/* Parallax / Floating Intelligence */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <Globe className="absolute -top-32 -left-32 w-[600px] h-[600px] text-primary/10 animate-pulse-slow" />
          <div className="absolute top-[20%] right-[10%] w-px h-64 bg-gradient-to-b from-transparent via-primary/40 to-transparent"></div>
          <div className="absolute bottom-[20%] left-[20%] w-px h-96 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"></div>
        </div>

        {/* Animated Enterprise Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[130px] animate-pulse duration-[8000ms]" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 animate-in fade-in zoom-in-95 duration-1000">
        <div className="premium-glass-dark p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.7)] relative overflow-hidden group">
          {/* Ambient Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-1000"></div>

          <div className="mb-14 relative z-10 text-center">
            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_20px_50px_rgba(var(--primary),0.4)] rotate-[-6deg] group-hover:rotate-0 transition-transform duration-500">
                <Mail className="text-white w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Account Recovery</h1>
            <p className="text-slate-400 font-medium">
              Initiate the secure password restoration protocol.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 font-bold leading-relaxed">
                  Transmission successful. A restoration link has been dispatched to <strong>{email}</strong>.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-white font-black py-5 rounded-2xl transition-all"
                >
                  Request New Link
                </button>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors py-4 font-bold text-sm"
                >
                  <ArrowLeft size={18} />
                  Back to Terminal
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Identification Email</label>
                <div className="relative group/input">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm"
                    placeholder="agent@voyager.pro"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-white hover:bg-blue-600 hover:text-white font-black py-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
                    <span className="text-sm uppercase tracking-[0.3em] relative z-10">Send Restoration Link</span>
                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform relative z-10" />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-black uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft size={16} />
                  Return to Login
                </Link>
              </div>
            </form>
          )}

          <div className="mt-14 text-center relative z-10 border-t border-white/5 pt-8">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              Voyager Pro Security Protocol v4.0 <br />
              <ShieldCheck size={14} className="inline mr-2 text-primary" />
              Secured Endpoint
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
