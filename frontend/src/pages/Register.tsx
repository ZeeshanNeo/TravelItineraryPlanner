import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Map, ArrowRight, Shield, Globe, HelpCircle, User, Phone } from 'lucide-react';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { authService } from '../services/auth.service';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
      navigate('/dashboard');
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans overflow-hidden">
      {/* Immersive Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000" 
          alt="Cinematic Travel" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-xl px-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-white">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-4 border border-white/20 shadow-2xl">
            <Map className="w-9 h-9 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Voyager Pro</h1>
          <p className="text-slate-300 font-medium tracking-wide uppercase text-[10px]">Luxury performance for the modern traveler</p>
        </div>

        {/* Central Glass Card */}
        <div className="glass-dark p-1 rounded-[3rem] shadow-2xl border border-white/10 relative">
          {/* Tabs */}
          <div className="flex p-2 bg-black/20 rounded-[2.5rem] mb-8">
            <Link to="/login" className="flex-1 py-4 px-6 rounded-[2rem] text-muted-foreground text-sm font-bold text-center hover:text-white transition-all">
              Sign In
            </Link>
            <button className="flex-1 py-4 px-6 rounded-[2rem] bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-600/20 transition-all">
              Create Account
            </button>
          </div>

          <div className="px-10 pb-12 pt-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {generalError && (
                <div className="bg-rose-500/20 border border-rose-500/30 text-rose-200 px-6 py-4 rounded-2xl text-sm font-medium">
                  {generalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">First Name</label>
                  <Input
                    name="firstName"
                    type="text"
                    required
                    placeholder="Alex"
                    value={formData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    fullWidth
                    leftIcon={<User className="h-4 w-4 text-indigo-400" />}
                    className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Last Name</label>
                  <Input
                    name="lastName"
                    type="text"
                    required
                    placeholder="Rivera"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    fullWidth
                    className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="alex@voyager.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  fullWidth
                  leftIcon={<Mail className="h-5 w-5 text-indigo-400" />}
                  className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Phone Number</label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  fullWidth
                  leftIcon={<Phone className="h-5 w-5 text-indigo-400" />}
                  className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Password</label>
                    <Input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      fullWidth
                      leftIcon={<Lock className="h-4 w-4 text-indigo-400" />}
                      className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/50"
                    />
                  </div>
                  
                  {/* Password Requirement Hints */}
                  <div className="px-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${formData.password.length >= 8 ? 'bg-indigo-400' : 'bg-white/10'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${formData.password.length >= 8 ? 'text-indigo-300' : 'text-muted-foreground'}`}>Min. 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${/[A-Z]/.test(formData.password) ? 'bg-indigo-400' : 'bg-white/10'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${/[A-Z]/.test(formData.password) ? 'text-indigo-300' : 'text-muted-foreground'}`}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${/[0-9]/.test(formData.password) ? 'bg-indigo-400' : 'bg-white/10'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${/[0-9]/.test(formData.password) ? 'text-indigo-300' : 'text-muted-foreground'}`}>One number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-indigo-400' : 'bg-white/10'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-indigo-300' : 'text-muted-foreground'}`}>One special character</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 self-start">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-4">Confirm</label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    fullWidth
                    className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground focus:bg-black/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                fullWidth
                className="h-16 text-lg rounded-[2rem] font-black shadow-xl shadow-indigo-600/30 mt-4 group"
              >
                Join Voyager Pro
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-12 flex items-center justify-center gap-12 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500/50" />
            <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500/50" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Concierge</span>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <button className="absolute bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
        <HelpCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Need assistance?
        </span>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate ease-in-out;
        }
      `}} />
    </div>
  );
};

export default Register;
