import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Globe, FileText, Calendar, Edit2, Save, X, LogOut, Star, Clock, Settings, Lock } from 'lucide-react';
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
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    travelPreferences: {},
    passportDetails: {},
  });

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
      setError('Failed to load profile. Please try again.');
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

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      const updatedProfile = await authService.updateProfile(formData);
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || '',
        travelPreferences: profile.travelPreferences || {},
        passportDetails: profile.passportDetails || {},
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
              <p className="text-gray-600 mb-6">Unable to load your profile. Please try again.</p>
              <Button variant="primary" onClick={fetchProfile} className="w-full">
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Account Profile</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage your personal information and preferences.</p>
          </div>
          <Button variant="danger" onClick={handleLogout} className="h-12 px-6 rounded-2xl flex items-center">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="overflow-hidden border-none shadow-2xl shadow-indigo-900/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Personal Information</h2>
                  <p className="text-muted-foreground text-sm mt-1">This information will be used for your bookings.</p>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center rounded-xl"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-3">
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      className="flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      isLoading={updating}
                      className="flex items-center rounded-xl shadow-lg shadow-indigo-600/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              {success && (
                <div className="mb-8 p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <p className="text-emerald-700 font-bold flex items-center">
                    <Star className="w-5 h-5 mr-2 fill-emerald-500" />
                    {success}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-8 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl animate-shake">
                  <p className="text-rose-700 font-bold">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="First Name"
                  value={isEditing ? formData.firstName : profile.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<User className="w-5 h-5 text-indigo-400" />}
                />
                <Input
                  label="Last Name"
                  value={isEditing ? formData.lastName : profile.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<User className="w-5 h-5 text-indigo-400" />}
                />
                <Input
                  label="Email address"
                  value={profile.email}
                  disabled
                  leftIcon={<Mail className="w-5 h-5 text-muted-foreground" />}
                  className="bg-muted border-transparent cursor-not-allowed opacity-60"
                />
                <Input
                  label="Phone Number"
                  value={isEditing ? formData.phoneNumber : profile.phoneNumber || 'Not provided'}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Phone className="w-5 h-5 text-indigo-400" />}
                />
              </div>

              <div className="mt-12 pt-10 border-t border-border">
                <h3 className="text-xl font-black text-foreground mb-6">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center p-5 bg-muted rounded-2xl border border-border">
                    <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center mr-4 shadow-sm">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Member Since</p>
                      <p className="font-bold text-foreground mt-1">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-5 bg-muted rounded-2xl border border-border">
                    <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center mr-4 shadow-sm">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last Updated</p>
                      <p className="font-bold text-foreground mt-1">
                        {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Travel Preferences Card */}
            <Card className="border-none shadow-2xl shadow-indigo-900/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-foreground">Travel Preferences</h2>
                <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl">
                  Configure
                </Button>
              </div>
              {profile.travelPreferences && Object.keys(profile.travelPreferences).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(profile.travelPreferences).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-4 bg-muted rounded-2xl border border-border">
                      <span className="text-muted-foreground font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-black text-indigo-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-[2.5rem] border-2 border-dashed border-border">
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Globe className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground">No preferences set</h4>
                  <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Tell us how you like to travel for personalized recommendations.</p>
                  <Button variant="outline" className="mt-6 border-border rounded-xl" onClick={() => setIsEditing(true)}>
                    Set Preferences
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Actions & Passport */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl shadow-indigo-900/5">
              <h2 className="text-2xl font-black text-foreground mb-6">Passport</h2>
              {profile.passportDetails && Object.keys(profile.passportDetails).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(profile.passportDetails).map(([key, value]) => (
                    <div key={key} className="p-4 bg-muted rounded-2xl border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-bold text-foreground">{String(value)}</p>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-indigo-600 font-bold mt-4" onClick={() => setIsEditing(true)}>
                    Update Passport
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-6 font-medium">Add your details for faster booking.</p>
                  <Button variant="outline" className="w-full rounded-2xl border-border" onClick={() => setIsEditing(true)}>
                    Add Passport Details
                  </Button>
                </div>
              )}
            </Card>

            <Card className="border-none shadow-2xl shadow-indigo-900/5">
              <h2 className="text-2xl font-black text-foreground mb-6">Security</h2>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl border-border bg-muted/50 hover:bg-muted"
                  onClick={() => navigate('/change-password')}
                >
                  <Lock className="w-4 h-4 mr-3 text-muted-foreground" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl border-border bg-muted/50 hover:bg-muted"
                  onClick={() => navigate('/privacy-settings')}
                >
                  <Settings className="w-4 h-4 mr-3 text-muted-foreground" />
                  Privacy Settings
                </Button>
              </div>
            </Card>

            <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Globe className="w-32 h-32" />
              </div>
              <h3 className="text-xl font-black mb-3 relative z-10">Need Assistance?</h3>
              <p className="text-indigo-100 text-sm mb-6 relative z-10 leading-relaxed">
                Our premium support team is available 24/7 to help with your travel plans.
              </p>
              <Button className="w-full bg-card text-indigo-600 hover:bg-white/90 rounded-2xl font-bold h-12 relative z-10">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
