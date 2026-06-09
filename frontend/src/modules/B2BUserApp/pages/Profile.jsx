import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, User, Phone, MapPin, Globe, CreditCard, 
  Share2, LogOut, ShieldCheck, Mail, Building2, 
  Copy, Check, Loader2, Save, X, Upload, ArrowLeft, MessageSquare, Star, Trash, PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FeedbackModal from '../components/modals/FeedbackModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    mobileNumber: '',
    email: '',
    website: '',
    profilePhoto: '',
    logo: '',
    address: '123 Tech Park, Silicon Valley, IND',
    gstNumber: ''
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
        address: user.user.address || '123 Tech Park, Silicon Valley, IND',
        gstNumber: user.user.gstNumber || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/settings`);
        setAppSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleNavigate = (path) => {
    setIsNavigating(path);
    // Use setTimeout to allow the UI to update with the spinner before the synchronous transition starts
    setTimeout(() => {
      navigate(path);
    }, 50);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
    setIsLoggingOut(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(user?.user?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processFileUpload = async (file, type) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.accessToken}` 
        }
      };
      
      // Step 1: Upload the file
      const { data } = await axios.post(`${API_URL}/upload`, uploadData, config);
      const newUrl = data.url;
      const fieldName = type === 'profile' ? 'profilePhoto' : 'logo';

      // Step 2: Update local form state
      setFormData(prev => ({ ...prev, [fieldName]: newUrl }));

      // Step 3: Persist to profile immediately and update global state
      const updateConfig = {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      };
      
      const updatedFormData = { ...formData, [fieldName]: newUrl };
      const { data: updateData } = await axios.put(`${API_URL}/user/profile`, updatedFormData, updateConfig);
      
      const updatedUser = { ...user, user: updateData.user };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      showToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    await processFileUpload(file, type);
  };

  const handleCameraCapture = async (type) => {
    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
      try {
        const result = await window.flutter_inappwebview.callHandler('openCamera');
        if (result && result.success) {
          const byteCharacters = atob(result.base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: result.mimeType || 'image/jpeg' });
          const file = new File([blob], result.fileName || `camera_${Date.now()}.jpg`, { type: result.mimeType || 'image/jpeg' });
          
          await processFileUpload(file, type);
        }
      } catch (error) {
        console.error('Flutter camera handler error:', error);
        // Fallback
        if (type === 'profile') profileInputRef.current.click();
        else logoInputRef.current.click();
      }
    } else {
      // Not in flutter webview
      if (type === 'profile') profileInputRef.current.click();
      else logoInputRef.current.click();
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    // Validation
    const nameRegex = /^[A-Za-z ]+$/;
    if (!formData.name.trim() || !nameRegex.test(formData.name)) {
      return showToast("Display name should only contain letters and spaces.", "error");
    }
    if (!formData.businessName.trim() || !/[A-Za-z0-9]/.test(formData.businessName)) {
      return showToast("Business name must contain valid alphanumeric characters.", "error");
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.mobileNumber && !phoneRegex.test(formData.mobileNumber)) {
      return showToast("Please enter a valid 10-digit phone number.", "error");
    }
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.gstNumber && !gstRegex.test(formData.gstNumber.trim())) {
      return showToast("Please enter a valid GST format.", "error");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return showToast("Please enter a valid email address.", "error");
    }
    if (formData.website && !/^https?:\/\/.*/.test(formData.website)) {
      return showToast("Website should start with http:// or https://", "error");
    }

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
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Update profile error:', error);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-8 bg-slate-50 min-h-screen font-sans relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[9999] px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 ${
              toastMessage.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'
            }`}
          >
            {toastMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toastMessage.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={profileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
        onChange={(e) => handleFileUpload(e, 'profile')} 
      />
      <input 
        type="file" 
        ref={logoInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment"
        onChange={(e) => handleFileUpload(e, 'logo')} 
      />

      {/* Header Profile Section */}
      <div className="relative overflow-hidden bg-[#1e1b4b] pt-12 pb-20 px-6">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 border-4 border-white/20 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden shadow-2xl relative">
              {uploading.profile ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 size={24} className="text-white animate-spin" />
                </div>
              ) : (
                <>
                  <img 
                    src={formData.profilePhoto || `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=4f46e5&color=fff&size=200`} 
                    alt="Profile" 
                    className="w-full h-full object-cover transform transition-transform group-hover:scale-105 duration-300"
                  />
                  {formData.profilePhoto && (
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, profilePhoto: '' }))}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white sm:hidden" // Only keep hover on desktop if needed, actually better to just remove it and rely on the explicit button
                      title="Remove Profile Photo"
                    >
                      <Trash size={24} />
                    </button>
                  )}
                </>
              )}
            </div>
            <button 
              onClick={() => handleCameraCapture('profile')}
              className="absolute -bottom-2 -right-2 bg-[#ef4444] text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:bg-[#dc2626] transition-colors border-2 border-indigo-950 active:scale-95 cursor-pointer z-10"
              title="Change Profile Photo"
            >
              <Camera size={18} />
            </button>
            {formData.profilePhoto && (
              <button 
                onClick={() => setFormData(prev => ({ ...prev, profilePhoto: '' }))}
                className="absolute -bottom-2 -left-2 bg-slate-900 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors border-2 border-indigo-950 active:scale-95 cursor-pointer z-10"
                title="Remove Profile Photo"
              >
                <Trash size={16} />
              </button>
            )}
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
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shrink-0">
                <Share2 size={24} />
              </div>
              <div className="flex-1 cursor-pointer" onClick={() => handleNavigate('/referral')}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[0.65rem] font-black text-white/50 uppercase tracking-[0.2em]">Refer & Earn</h3>
                  {isNavigating === '/referral' && <Loader2 size={14} className="text-white animate-spin" />}
                </div>
                <p className="text-sm text-white font-bold leading-snug mt-1">Get bonus points for every friend you refer!</p>
                <div className="mt-5 flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                  <code className="flex-1 font-black text-white text-center tracking-[0.15em] text-sm">{user?.user?.referralCode || 'NOT FOUND'}</code>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
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
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[0.65rem] font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-indigo-100 transition-colors cursor-pointer border-none"
              >
                Modify
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                label="DISPLAY NAME" 
                value={formData.name} 
                icon={<User size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, name: val.replace(/[^A-Za-z ]/g, '')})}
              />
              <InputField 
                label="BUSINESS NAME" 
                value={formData.businessName} 
                icon={<Building2 size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, businessName: val})}
              />
              <InputField 
                label="GST NUMBER" 
                value={formData.gstNumber} 
                icon={<CreditCard size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, gstNumber: val})}
              />
              <InputField 
                label="PHONE NUMBER" 
                value={formData.mobileNumber} 
                icon={<Phone size={18} />} 
                isEditing={isEditing}
                onChange={(val) => setFormData({...formData, mobileNumber: val.replace(/[^0-9]/g, '').slice(0, 10)})}
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
                  onClick={() => handleCameraCapture('logo')}
                  className={`relative group h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-4 gap-3 cursor-pointer transition-all hover:border-indigo-200 border-dashed`}
                >
                  {uploading.logo ? (
                    <Loader2 size={18} className="animate-spin text-indigo-500" />
                  ) : formData.logo ? (
                    <>
                      <img src={formData.logo} className="w-8 h-8 rounded-lg object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, logo: '' })) }}
                        className="ml-auto text-slate-400 hover:text-red-500 transition-colors p-2 z-10"
                        title="Remove Logo"
                      >
                        <Trash size={16} />
                      </button>
                    </>
                  ) : (
                    <Building2 size={18} className="text-slate-400" />
                  )}
                  <span className={`text-[0.9rem] font-bold ${formData.logo ? 'text-slate-800' : 'text-slate-400'}`}>
                    {formData.logo ? 'Logo Uploaded' : 'Upload Business Logo'}
                  </span>
                  {isEditing && !formData.logo && <Upload size={16} className="ml-auto text-indigo-500 opacity-50 group-hover:opacity-100" />}
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

            {isEditing && (
              <div className="flex items-center gap-4 pt-6 border-t border-slate-50 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 text-[0.7rem] font-black text-slate-500 bg-slate-100 rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <X size={16} /> Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 text-[0.7rem] font-black text-white bg-[#ef4444] rounded-2xl shadow-lg shadow-red-500/20 hover:bg-[#dc2626] transition-colors cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </motion.section>

        {/* Legal & Help */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-5">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Legal & Policies</h2>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => handleNavigate('/terms')}
              disabled={isNavigating === '/terms'}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group border-none cursor-pointer disabled:opacity-70"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Terms & Conditions</span>
              </div>
              {isNavigating === '/terms' ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <ArrowLeft size={16} className="text-slate-300 group-hover:text-slate-500 rotate-180 transition-all" />}
            </button>
            <button 
              onClick={() => handleNavigate('/privacy')}
              disabled={isNavigating === '/privacy'}
              className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group border-none cursor-pointer disabled:opacity-70"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-bold text-slate-700">Privacy Policy</span>
              </div>
              {isNavigating === '/privacy' ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <ArrowLeft size={16} className="text-slate-300 group-hover:text-slate-500 rotate-180 transition-all" />}
            </button>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm shrink-0">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Support & Feedback</h2>
          </div>

          <div className="bg-slate-50/50 rounded-[24px] p-5 sm:p-6 text-center border border-slate-100">
            <div className="flex justify-center gap-4 mb-6">
              {appSettings?.supportContact?.phone && (
                <a href={`tel:${appSettings.supportContact.phone}`} className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <PhoneCall size={20} />
                </a>
              )}
              {appSettings?.supportContact?.email && (
                <a href={`mailto:${appSettings.supportContact.email}`} className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <Mail size={20} />
                </a>
              )}
              {appSettings?.supportContact?.whatsapp && (
                <a href={`https://wa.me/${appSettings.supportContact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <MessageSquare size={20} />
                </a>
              )}
            </div>
            
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full bg-slate-950 text-white py-4 rounded-2xl text-[0.7rem] font-black tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Star size={16} className="text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" /> GIVE FEEDBACK
            </button>
          </div>
        </motion.section>

        {/* Logout Section */}
        <div className="pt-10 pb-6 text-center">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-3 px-10 py-4 text-[#ef4444] font-black text-[0.7rem] uppercase tracking-[0.2em] hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group cursor-pointer disabled:opacity-50"
          >
             {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />} Logout Securely
          </button>
          <div className="mt-10 flex flex-col items-center gap-2">
             <p className="text-[0.6rem] font-black brand-gradient-text uppercase tracking-[0.4em]">Dealingindia</p>
             <p className="text-[0.55rem] font-bold text-slate-300 uppercase tracking-[0.2em]">Build 2.4.5 • Latest Stable</p>
          </div>
        </div>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        user={user}
      />
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
