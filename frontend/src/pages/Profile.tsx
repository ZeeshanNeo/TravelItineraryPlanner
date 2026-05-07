import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Globe, FileText, Calendar, Edit2, X,
  LogOut, Clock, Settings, Lock, Shield, MessageSquare,
  CheckCircle2, AlertCircle, ChevronRight, Zap
} from 'lucide-react';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Card from '../components/shared/Card';
import Layout from '../components/layout/Layout';
import { authService } from '../services/auth.service';
import type { UserProfileResponse, UpdateProfileRequest } from '../services/auth.service';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<'passport' | 'password' | 'privacy' | 'preference' | 'support' | null>(null);

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    travelPreferences: {},
    passportDetails: {},
  });

  // Security Form States
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [privacyData, setPrivacyData] = useState({ publicProfile: false, dataSharing: true, marketing: false });
  const [supportMessage, setSupportMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || '',
        travelPreferences: data.travelPreferences || {},
        passportDetails: data.passportDetails || {},
      });
    } catch (err: any) {
      setError('Failed to load mission profile.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePassportUpdate = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      passportDetails: { ...prev.passportDetails, [field]: value }
    }));
  };

  const handlePreferenceUpdate = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      travelPreferences: { ...prev.travelPreferences, [field]: value }
    }));
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const updatedProfile = await authService.updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess('Operational profile synchronized successfully.');
      setIsEditing(false);
      setModalType(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Synchronization failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setError('Password mismatch detected.');
      return;
    }
    setUpdating(true);
    try {
      setSuccess('Security credentials updated.');
      setModalType(null);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Security update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('Support request dispatched to HQ.');
    setModalType(null);
    setSupportMessage('');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Extraction failed:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Decrypting Profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) return null;

  const modalInputClass = "!bg-slate-950/40 !border-white/10 !text-white placeholder:text-slate-600 !focus:bg-slate-950/60 !focus:border-indigo-500/50 shadow-inner h-14";
  const modalLabelClass = "text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 ml-1";

  return (
    <Layout>
      <div className="space-y-10 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
                <User size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">{profile.firstName} {profile.lastName}</h1>
                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                  <Zap size={12} className="fill-indigo-600" />
                  Verified Agent / Level 5 Clearance
                </p>
              </div>
            </div>
            <p className="text-muted-foreground font-bold ml-1">Manage your operative identity and tactical preferences.</p>
          </div>
          <Button variant="danger" onClick={handleLogout} className="h-14 px-10 rounded-2xl flex items-center font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-500/20 active:scale-95 transition-all">
            <LogOut className="w-5 h-5 mr-3" />
            Abort Session
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-10">
            <Card className="p-10 border-none shadow-2xl shadow-slate-900/5 bg-card relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <Shield size={200} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Identity Manifest</h2>
                  <p className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-widest">Base identification and contact routing</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                  >
                    <Edit2 size={14} />
                    Modify Manifest
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-foreground">Cancel</button>
                    <button onClick={handleSave} disabled={updating} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50">
                      {updating ? 'Syncing...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {success && (
                <div className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">{success}</p>
                </div>
              )}

              {error && (
                <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-shake">
                  <AlertCircle className="text-rose-500" size={20} />
                  <p className="text-rose-500 text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Input
                  label="Agent First Name"
                  value={isEditing ? formData.firstName : profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<User className="w-5 h-5 text-indigo-500" />}
                />
                <Input
                  label="Agent Last Name"
                  value={isEditing ? formData.lastName : profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<User className="w-5 h-5 text-indigo-500" />}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Secure Email address</label>
                  <div className="h-14 bg-muted/50 border-2 border-transparent rounded-2xl px-6 flex items-center gap-4 text-muted-foreground opacity-60">
                    <Mail size={18} />
                    <span className="font-bold">{profile.email}</span>
                  </div>
                </div>
                <Input
                  label="Comms Line (Phone)"
                  value={isEditing ? formData.phoneNumber : profile.phoneNumber || 'Not provided'}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Phone className="w-5 h-5 text-indigo-500" />}
                />
              </div>

              <div className="mt-12 pt-10 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center p-6 bg-muted/30 rounded-3xl border border-border">
                  <Calendar className="w-10 h-10 text-slate-400 mr-5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activation Date</p>
                    <p className="font-black text-foreground uppercase mt-1">{new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center p-6 bg-muted/30 rounded-3xl border border-border">
                  <Clock className="w-10 h-10 text-slate-400 mr-5" />
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Sync</p>
                    <p className="font-black text-foreground uppercase mt-1">{new Date(profile.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Travel Preferences */}
            <Card className="p-10 border-none shadow-2xl shadow-slate-900/5 bg-card relative">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Tactical Preferences</h2>
                  <p className="text-muted-foreground text-xs font-bold mt-1 uppercase tracking-widest">Mission parameters and logistical requirements</p>
                </div>
                <button
                  onClick={() => setModalType('preference')}
                  className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 px-5 py-3 rounded-xl transition-all"
                >
                  <Settings size={14} />
                  Configure
                </button>
              </div>

              {profile.travelPreferences && Object.keys(profile.travelPreferences).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(profile.travelPreferences).map(([key, value]) => (
                    <div key={key} className="p-5 bg-muted/30 rounded-2xl border border-border flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-black text-indigo-600 uppercase text-xs">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border group hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => setModalType('preference')}>
                  <Globe className="w-16 h-16 text-slate-300 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-black text-foreground uppercase tracking-tight">No parameters set</h4>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm font-medium leading-relaxed">Establish your operational requirements for personalized mission data.</p>
                  <button className="mt-8 px-10 py-4 bg-white text-indigo-600 border border-border rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/5 active:scale-95 transition-all">
                    Set Preferences
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-10">
            <Card className="p-10 border-none shadow-2xl shadow-slate-900/5 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 p-20 opacity-5 pointer-events-none">
                <FileText size={300} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Passport</h2>
              {profile.passportDetails && Object.keys(profile.passportDetails).length > 0 ? (
                <div className="space-y-4 relative z-10">
                  {Object.entries(profile.passportDetails).map(([key, value]) => (
                    <div key={key} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-black text-white uppercase text-sm">{String(value)}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => setModalType('passport')}
                    className="w-full h-14 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] mt-6 transition-all"
                  >
                    Update Passport
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 relative z-10">
                  <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <Shield className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 mb-8 font-bold text-sm leading-relaxed uppercase tracking-widest">Add credentials for accelerated mission clearance.</p>
                  <button
                    onClick={() => setModalType('passport')}
                    className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all"
                  >
                    Add Passport Details
                  </button>
                </div>
              )}
            </Card>

            <Card className="p-10 border-none shadow-2xl shadow-slate-900/5 bg-card">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-8">Security Hub</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setModalType('password')}
                  className="w-full h-14 flex items-center justify-between px-6 bg-muted/50 rounded-2xl border border-border group hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Lock size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-foreground transition-colors">Change Credentials</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => setModalType('privacy')}
                  className="w-full h-14 flex items-center justify-between px-6 bg-muted/50 rounded-2xl border border-border group hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Settings size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-foreground transition-colors">Privacy Protocol</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                </button>
              </div>
            </Card>

            <div className="p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group cursor-pointer" onClick={() => setModalType('support')}>
              <div className="absolute -top-10 -right-10 p-20 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                <MessageSquare size={160} />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight relative z-10">Need HQ Support?</h3>
              <p className="text-indigo-100 text-xs font-bold mb-10 relative z-10 leading-relaxed uppercase tracking-widest">
                Our support operatives are active 24/7 for mission-critical assistance.
              </p>
              <button className="w-full h-14 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-900/20 group-hover:bg-indigo-50 active:scale-95 transition-all relative z-10">
                Establish Connection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}

      {modalType === 'passport' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-500 border-t-indigo-500/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Credential Sync</h4>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Operational ID Synchronization</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-white/10"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              <div>
                <label className={modalLabelClass}>Passport Registry Number</label>
                <Input
                  value={formData.passportDetails?.passportNumber || ''}
                  onChange={(e) => handlePassportUpdate('passportNumber', e.target.value)}
                  className={modalInputClass}
                />
              </div>
              <div>
                <label className={modalLabelClass}>Nationality / Sector Origin</label>
                <Input
                  value={formData.passportDetails?.nationality || ''}
                  onChange={(e) => handlePassportUpdate('nationality', e.target.value)}
                  className={modalInputClass}
                />
              </div>
              <div>
                <label className={modalLabelClass}>Exfiltration Deadline (Expiry)</label>
                <Input
                  type="date"
                  value={formData.passportDetails?.expiryDate || ''}
                  onChange={(e) => handlePassportUpdate('expiryDate', e.target.value)}
                  className={modalInputClass}
                />
              </div>
            </div>

            <button onClick={handleSave} disabled={updating} className="w-full h-18 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_35px_rgba(79,70,229,0.3)] active:scale-95 transition-all disabled:opacity-50 hover:bg-indigo-500 flex items-center justify-center gap-3">
              <Zap size={16} className="fill-white" />
              {updating ? 'Initializing Sync...' : 'Commit Synchronize'}
            </button>
          </div>
        </div>
      )}

      {modalType === 'password' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
          <form onSubmit={handlePasswordChange} className="w-full max-w-lg bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-500 border-t-rose-500/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Security Override</h4>
                <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.3em] mt-1">Credential Mutation Protocol</p>
              </div>
              <button type="button" onClick={() => setModalType(null)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-white/10"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              <div>
                <label className={modalLabelClass}>Current Access Credentials</label>
                <Input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className={modalInputClass}
                />
              </div>
              <div>
                <label className={modalLabelClass}>New Access Credentials</label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className={modalInputClass}
                />
              </div>
              <div>
                <label className={modalLabelClass}>Verify New Credentials</label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className={modalInputClass}
                />
              </div>
            </div>

            <button type="submit" disabled={updating} className="w-full h-18 bg-rose-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_35px_rgba(244,63,94,0.3)] active:scale-95 transition-all disabled:opacity-50 hover:bg-rose-400 flex items-center justify-center gap-3">
              <Shield size={16} className="fill-white" />
              {updating ? 'Mutating...' : 'Commit Security Update'}
            </button>
          </form>
        </div>
      )}

      {modalType === 'preference' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-500 border-t-indigo-500/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Mission Parameters</h4>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Logistical Requirement Calibration</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-white/10"><X size={24} /></button>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className={modalLabelClass}>Dietary Constraint</label>
                <select
                  value={formData.travelPreferences?.dietary || ''}
                  onChange={(e) => handlePreferenceUpdate('dietary', e.target.value)}
                  className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-2xl px-8 text-white font-black text-sm outline-none focus:border-indigo-500/50 appearance-none shadow-inner"
                >
                  <option value="" className="bg-slate-900">Standard Issue</option>
                  <option value="Vegan" className="bg-slate-900">Vegan Protocol</option>
                  <option value="Vegetarian" className="bg-slate-900">Vegetarian Protocol</option>
                  <option value="Halal" className="bg-slate-900">Halal Protocol</option>
                  <option value="Kosher" className="bg-slate-900">Kosher Protocol</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className={modalLabelClass}>Preferred Sector (Seating)</label>
                <select
                  value={formData.travelPreferences?.seating || ''}
                  onChange={(e) => handlePreferenceUpdate('seating', e.target.value)}
                  className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-2xl px-8 text-white font-black text-sm outline-none focus:border-indigo-500/50 appearance-none shadow-inner"
                >
                  <option value="Aisle" className="bg-slate-900">Aisle Sector</option>
                  <option value="Window" className="bg-slate-900">Window Sector</option>
                  <option value="ExtraLegroom" className="bg-slate-900">Enhanced Legroom</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className={modalLabelClass}>Accommodation Tier</label>
                <select
                  value={formData.travelPreferences?.hotelType || ''}
                  onChange={(e) => handlePreferenceUpdate('hotelType', e.target.value)}
                  className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-2xl px-8 text-white font-black text-sm outline-none focus:border-indigo-500/50 appearance-none shadow-inner"
                >
                  <option value="Modern" className="bg-slate-900">Modern Operative</option>
                  <option value="Classic" className="bg-slate-900">Classic Luxury</option>
                  <option value="Boutique" className="bg-slate-900">Discrete Boutique</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className={modalLabelClass}>Aviation Logistics Tier</label>
                <select
                  value={formData.travelPreferences?.airlineTier || ''}
                  onChange={(e) => handlePreferenceUpdate('airlineTier', e.target.value)}
                  className="w-full h-16 bg-slate-950/40 border border-white/10 rounded-2xl px-8 text-white font-black text-sm outline-none focus:border-indigo-500/50 appearance-none shadow-inner"
                >
                  <option value="Economy" className="bg-slate-900">Standard Economy</option>
                  <option value="Business" className="bg-slate-900">Business Class</option>
                  <option value="First" className="bg-slate-900">First Class Elite</option>
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={updating} className="w-full h-18 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_35px_rgba(79,70,229,0.3)] active:scale-95 transition-all disabled:opacity-50 hover:bg-indigo-500 flex items-center justify-center gap-3">
              <Settings size={16} className="fill-white" />
              {updating ? 'Calibrating...' : 'Commit Parameters'}
            </button>
          </div>
        </div>
      )}

      {modalType === 'privacy' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-500 border-t-indigo-500/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Privacy Matrix</h4>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Data Visibility Protocols</p>
              </div>
              <button onClick={() => setModalType(null)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-white/10"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              {[
                { id: 'publicProfile', label: 'Public Agent Visibility', icon: Globe },
                { id: 'dataSharing', label: 'Tactical Intelligence Sharing', icon: Shield },
                { id: 'marketing', label: 'Priority Mission Briefings', icon: Mail }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-8 bg-slate-950/40 rounded-3xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-all group-hover:scale-110">
                      <item.icon size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                  </div>
                  <button
                    onClick={() => setPrivacyData({ ...privacyData, [item.id]: !privacyData[item.id as keyof typeof privacyData] })}
                    className={`w-14 h-7 rounded-full transition-all relative ${privacyData[item.id as keyof typeof privacyData] ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${privacyData[item.id as keyof typeof privacyData] ? 'left-8' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => { setSuccess('Privacy protocols established.'); setModalType(null); }} className="w-full h-18 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs border border-white/10 transition-all flex items-center justify-center gap-3">
              <CheckCircle2 size={16} />
              Confirm Protocols
            </button>
          </div>
        </div>
      )}

      {modalType === 'support' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl">
          <form onSubmit={handleSupportSubmit} className="w-full max-w-lg bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-12 animate-in zoom-in-95 duration-500 border-t-indigo-500/30">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">HQ Uplink</h4>
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Priority Support Dispatch</p>
              </div>
              <button type="button" onClick={() => setModalType(null)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all hover:bg-white/10"><X size={24} /></button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className={modalLabelClass}>Brief Incident Report</label>
                <textarea
                  required
                  rows={5}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-3xl p-8 text-white font-bold text-sm outline-none focus:border-indigo-500/50 resize-none shadow-inner placeholder:text-slate-700"
                  placeholder="Describe the mission impedance encountered..."
                />
              </div>
              <div className="flex items-center gap-5 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                <div className="shrink-0 p-3 bg-amber-500/10 rounded-xl">
                  <AlertCircle className="text-amber-500" size={24} />
                </div>
                <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-[0.15em] leading-relaxed">Priority uplink active. Emergency requests are routed through tactical response channels.</p>
              </div>
            </div>

            <button type="submit" className="w-full h-18 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_15px_35px_rgba(79,70,229,0.3)] active:scale-95 transition-all hover:bg-indigo-500 flex items-center justify-center gap-3">
              <MessageSquare size={16} className="fill-white" />
              Dispatch to HQ
            </button>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
