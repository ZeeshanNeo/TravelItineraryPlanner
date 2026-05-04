import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Mail, Lock, Globe,
  ShieldCheck, ChevronRight,
  Plane, User, Phone
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { useToast } from '../components/shared/Toast';

interface LoginProps {
  initialMode?: 'login' | 'signup';
}

const Login = ({ initialMode = 'login' }: LoginProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  useEffect(() => {
    if (location.pathname === '/register') setMode('signup');
    else if (location.pathname === '/login') setMode('login');
  }, [location.pathname]);

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await authService.login({ email: formData.email, password: formData.password });
        showToast('Successfully logged in!', 'success');
        navigate('/dashboard');
      } else {
        await authService.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        });
        showToast('Account created successfully!', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Authentication failed', 'error');
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

      <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side: Branding & Value Prop */}
        <div className="hidden lg:flex flex-col space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div>
            <div className="flex items-center gap-5 mb-10 group">
              <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-[0_20px_50px_rgba(var(--primary),0.4)] rotate-[-6deg] group-hover:rotate-0 transition-transform duration-500">
                <Plane className="text-white w-10 h-10 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-5xl font-black text-white tracking-tighter">Voyager Pro</h1>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mt-1 italic">Enterprise Intelligence</span>
              </div>
            </div>
            <h2 className="text-6xl font-black text-white leading-[1.1] mb-8 tracking-tight">
              Master Your <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient">Global Footprint.</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-md font-medium leading-relaxed">
              The premier ecosystem for the modern explorer. Secure, collaborative, and precision-engineered for excellence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="group space-y-4 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-white text-lg font-black tracking-tight">Elite Vault</h3>
              <p className="text-slate-500 text-sm font-medium">AES-256 military-grade encryption for total document security.</p>
            </div>
            <div className="group space-y-4 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-white text-lg font-black tracking-tight">Global Grid</h3>
              <p className="text-slate-500 text-sm font-medium">Real-time intelligence across 190+ sovereign territories.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-1000 slide-in-from-bottom-12">
          <div className="premium-glass-dark p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.7)] relative overflow-hidden group">
            {/* Ambient Background Glow inside form */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors duration-1000"></div>
            
            {/* Form Header */}
            <div className="mb-14 relative z-10">
              <div className="lg:hidden flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
                  <Plane className="text-white w-6 h-6 -rotate-45" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tighter">Voyager Pro</h1>
              </div>
              <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">
                {mode === 'login' ? 'Authentication' : 'Registration'}
              </h3>
              <p className="text-slate-400 font-medium">
                {mode === 'login' ? 'Secure access to your enterprise hub.' : 'Join the elite tier of global travelers.'}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-2 bg-white/[0.03] rounded-2xl mb-12 border border-white/10 relative z-10">
              <button 
                onClick={() => { setMode('login'); navigate('/login', { replace: true }); }}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${
                  mode === 'login' ? 'bg-white text-slate-950 shadow-2xl scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMode('signup'); navigate('/register', { replace: true }); }}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${
                  mode === 'signup' ? 'bg-white text-slate-950 shadow-2xl scale-100' : 'text-slate-500 hover:text-slate-300 scale-95'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Given Name</label>
                      <div className="relative group/input">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                        <input 
                          name="firstName"
                          type="text" 
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm" 
                          placeholder="Alex" 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Surname</label>
                      <div className="relative group/input">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                        <input 
                          name="lastName"
                          type="text" 
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm" 
                          placeholder="Voyager" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Terminal Contact</label>
                    <div className="relative group/input">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                      <input 
                        name="phoneNumber"
                        type="tel" 
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm" 
                        placeholder="+1 (555) 000-0000" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Identification Key</label>
                <div className="relative group/input">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                  <input 
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm"
                    placeholder="agent@voyager.pro"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Code</label>
                  {mode === 'login' && (
                    <Link to="/forgot-password" title="Recovery" className="text-[10px] font-black text-primary hover:text-blue-400 uppercase tracking-widest transition-colors">Recovery</Link>
                  )}
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-primary transition-colors" />
                  <input 
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.25rem] py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/[0.06] transition-all placeholder:text-slate-600 font-bold text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-blue-600 text-white font-black py-6 rounded-[1.5rem] shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] disabled:opacity-50 mt-12 overflow-hidden relative"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
                    <span className="text-sm uppercase tracking-[0.3em] relative z-10">{mode === 'login' ? 'Login' : 'Sign Up'}</span>
                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform relative z-10" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-14 text-center relative z-10">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-loose">
                Authorized Personnel Only <br />
                <a href="#" className="text-slate-300 hover:text-primary transition-colors">Compliance Protocol</a> & <a href="#" className="text-slate-300 hover:text-primary transition-colors">Privacy Shield</a>
              </p>
            </div>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-10 text-slate-500 animate-in fade-in duration-1000 delay-700">
             <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">AES-256 SECURED</span>
             </div>
             <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
             <div className="flex items-center gap-3">
                <Globe size={18} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Intelligence</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
