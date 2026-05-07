import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck, Globe, ChevronRight, ArrowLeft } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useToast } from '../components/shared/Toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (!token) {
      showToast('Invalid or missing reset token', 'error');
    }
  }, [token, showToast]);

  useEffect(() => {
    const validations = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
    setPasswordValidations(validations);
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showToast('Invalid reset token', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    const allValid = Object.values(passwordValidations).every(Boolean);
    if (!allValid) {
      showToast('Please meet all password requirements', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
      showToast('Password reset successful!', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-[#0a0c12]">
        <div className="relative z-10 w-full max-w-lg px-6 animate-in fade-in zoom-in-95 duration-1000">
          <div className="premium-glass-dark p-12 rounded-[3rem] border border-white/10 text-center space-y-8 shadow-2xl">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-500/20">
              <ShieldCheck className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Access Denied</h1>
            <p className="text-slate-400 font-medium">
              The restoration link is invalid or has expired. For security, please request a new link.
            </p>
            <Link
              to="/forgot-password"
              className="w-full bg-primary hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              Request New Link
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 animate-in fade-in zoom-in-95 duration-1000">
        <div className="premium-glass-dark p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.7)] relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-1000"></div>
          
          <div className="mb-14 relative z-10 text-center">
            <div className="flex justify-center mb-10">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.4)] rotate-[-6deg] group-hover:rotate-0 transition-transform duration-500">
                <Lock className="text-white w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Security Reset</h1>
            <p className="text-slate-400 font-medium">
              Configure your new enterprise-grade access code.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 font-bold leading-relaxed">
                  Restoration complete. Redirecting to terminal for authentication...
                </p>
              </div>
              <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-progress origin-left"></div>
              </div>
              <Link
                to="/login"
                className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl"
              >
                Go to Terminal
                <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">New Access Code</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                    <input 
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-3">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Complexity Metrics</p>
                   <div className="grid grid-cols-1 gap-3">
                      <ValidationItem valid={passwordValidations.length} text="8+ Characters Required" />
                      <ValidationItem valid={passwordValidations.uppercase} text="Uppercase Identifier" />
                      <ValidationItem valid={passwordValidations.lowercase} text="Lowercase Identifier" />
                      <ValidationItem valid={passwordValidations.number} text="Numerical Component" />
                      <ValidationItem valid={passwordValidations.special} text="Special Operator" />
                   </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Verify Access Code</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full bg-primary hover:bg-blue-600 text-white font-black py-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
                    <span className="text-sm uppercase tracking-[0.3em] relative z-10">Authorize Restoration</span>
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
                  Abort Operation
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ValidationItem = ({ valid, text }: { valid: boolean; text: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-500 ${
      valid ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/[0.05] border border-white/10'
    }`}>
      {valid && <CheckCircle size={12} className="text-white" />}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
      valid ? 'text-emerald-400' : 'text-slate-600'
    }`}>
      {text}
    </span>
  </div>
);

export default ResetPassword;
