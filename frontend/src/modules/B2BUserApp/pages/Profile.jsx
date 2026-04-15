import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, User, Phone, MapPin, Globe, CreditCard, 
  Share2, LogOut, ShieldCheck, Mail, Building2, 
  Copy, Check, Loader2, Save, X, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobileNumber: '',
    email: '',
    website: '',
    profilePhoto: '',
    logo: '',
    address: '123 Tech Park, Silicon Valley, IND'
  });

  const profileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Sync formData when user data changes
  useEffect(() => {
    if (user?.user) {
      setFormData({
        name: user.user.name || '',
        businessName: user.user.businessName || '',
        mobileNumber: user.user.mobileNumber || '',
        email: user.user.email || '',
        website: user.user.website || '',
        profilePhoto: user.user.profilePhoto || '',
        logo: user.user.logo || '',
        address: user.user.address || '123 Tech Park, Silicon Valley, IND'
      });
    }
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.accessToken}` 
        }
      };
      const { data } = await axios.post(`${API_URL}/upload`, uploadData, config);
      setFormData(prev => ({ ...prev, [type === 'profile' ? 'profilePhoto' : 'logo']: data.url }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      };
      
      const { data } = await axios.put(`${API_URL}/user/profile`, formData, config);
      
      const updatedUser = { ...user, user: data.user };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen font-sans">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={profileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => handleFileUpload(e, 'profile')} 
      />
      <input 
        type="file" 
        ref={logoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => handleFileUpload(e, 'logo')} 
      />

      {/* Header Profile Section */}
      <div className="relative overflow-hidden bg-[#1e1b4b] pt-12 pb-20 px-6">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 border-4 border-white/20 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden transform transition-transform group-hover:scale-105 duration-300 shadow-2xl relative">
              {uploading.profile ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              ) : (
                <img 
                  src={formData.profilePhoto || `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=4f46e5&color=fff&size=200`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button 
              onClick={() => profileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-[#ef4444] text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:bg-[#dc2626] transition-colors border-2 border-indigo-950 active:scale-95 cursor-pointer"
            >
              <Camera size={18} />
            </button>
          </div>
          
          <h1 className="mt-5 text-2xl font-black text-white tracking-tight leading-none">
            {formData.businessName || formData.name || 'Your Name'}
          </h1>
          <div className="mt-2 flex items-center gap-2 justify-center">
            <span className="flex items-center gap-1.5 bg-indigo-500/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-[0.7rem] font-black text-indigo-100 border border-indigo-400/30 tracking-widest">
              <ShieldCheck size={14} className="text-indigo-300" />
              {user?.user?.isVerified ? 'VERIFIED MEMBER' : 'MEMBER'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-20 space-y-4">
        {/* Wallet Section */}
        <div className="grid grid-cols-1 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Points Balance</h3>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">{(user?.user?.points || 0).toLocaleString()}</span>
                    <span className="text-[0.65rem] font-black text-slate-400 uppercase">PTS</span>
                  </div>
                </div>
              </div>
              <button className="bg-slate-950 text-white px-5 py-3 rounded-2xl text-[0.7rem] font-black tracking-widest hover:bg-slate-800 transition-colors shadow-lg active:scale-95 border-none cursor-pointer">
                BUY POINTS
              </button>
            </div>
          </motion.div>

          {/* Referral Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#b91c1c] rounded-[32px] p-7 shadow-xl shadow-red-500/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                <Share2 size={24} />
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => navigate('/referral')}>
                <h3 className="text-[0.65rem] font-black text-white/50 uppercase tracking-[0.2em]">Refer & Earn</h3>
                <p className="text-sm text-white font-bold leading-snug mt-1">Get bonus points for every friend you refer!</p>
                <div className="mt-5 flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                  <code className="flex-1 font-black text-white text-center tracking-[0.15em] text-sm">{user?.user?.referralCode || 'NOT FOUND'}</code>
                  <button 
                    onClick={handleCopy}
                    className="bg-white text-red-700 px-5 py-2.5 rounded-xl text-[0.65rem] font-black shadow-md flex items-center gap-1.5 hover:bg-red-50 transition-colors uppercase tracking-widest active:scale-95 cursor-pointer border-none"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Profile Information */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Main Details</h2>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[0.65rem] font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-indigo-100 transition-colors cursor-pointer border-none"
              >
                Modify
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-2.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer bg-slate-100 rounded-xl border-none"
                >
                  <X size={20} />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#ef4444] text-white p-2.5 rounded-xl shadow-lg shadow-red-500/20 hover:bg-[#dc2626] transition-colors cursor-pointer border-none disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="DISPLAY NAME" 
                value={formData.name} 
                icon={<User size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, name: val})}
              />
              <InputField 
                label="BUSINESS NAME" 
                value={formData.businessName} 
                icon={<Building2 size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, businessName: val})}
              />
              <InputField 
                label="PHONE NUMBER" 
                value={formData.mobileNumber} 
                icon={<Phone size={18} />} 
                isEditing={false}
              />
              <InputField 
                label="EMAIL ADDRESS" 
                value={formData.email} 
                icon={<Mail size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, email: val})}
              />
              <InputField 
                label="WEBSITE" 
                value={formData.website} 
                icon={<Globe size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, website: val})}
              />
              
              {/* Business Logo Upload */}
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 block">BUSINESS LOGO</label>
                <div 
                  onClick={() => isEditing && logoInputRef.current.click()}
                  className={`relative group h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 gap-3 cursor-pointer transition-all ${isEditing ? 'hover:border-indigo-200 border-dashed' : ''}`}
                >
                  {uploading.logo ? (
                    <Loader2 size={18} className="animate-spin text-indigo-500" />
                  ) : formData.logo ? (
                    <img src={formData.logo} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <Building2 size={18} className="text-slate-400" />
                  )}
                  <span className={`text-[0.9rem] font-bold ${formData.logo ? 'text-slate-800' : 'text-slate-400'}`}>
                    {formData.logo ? 'Logo Uploaded' : 'Upload Business Logo'}
                  </span>
                  {isEditing && <Upload size={16} className="ml-auto text-indigo-500 opacity-50 group-hover:opacity-100" />}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 block">OFFICE ADDRESS</label>
              <div className="relative group">
                <div className="absolute top-4 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><MapPin size={18} /></div>
                <textarea 
                  readOnly={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full bg-slate-50 border border-slate-100 rounded-[24px] p-4 pl-12 h-28 text-[0.9rem] font-bold text-slate-700 outline-none resize-none transition-all ${isEditing ? 'focus:border-indigo-200 focus:bg-white border-dashed shadow-sm' : ''}`}
                />
              </div>
            </div>
          </form>
        </motion.section>

        {/* Logout Section */}
        <div className="pt-10 pb-6 text-center">
          <button 
            onClick={logout}
            className="inline-flex items-center gap-3 px-10 py-4.5 text-[#ef4444] font-black text-[0.7rem] uppercase tracking-[0.2em] hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group cursor-pointer"
          >
             <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Logout Securely
          </button>
          <div className="mt-10 flex flex-col items-center gap-2">
             <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-[0.4em]">DEALING INDIA POSTER</p>
             <p className="text-[0.55rem] font-bold text-slate-300 uppercase tracking-[0.2em]">Build 2.4.5 • Latest Stable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, icon, isEditing, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1 block">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">{icon}</div>
      <input 
        type={type} 
        readOnly={!isEditing}
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-[0.9rem] font-bold text-slate-700 outline-none transition-all ${isEditing ? 'focus:border-indigo-200 focus:bg-white border-dashed shadow-sm' : ''}`}
      />
    </div>
  </div>
);

export default Profile;
