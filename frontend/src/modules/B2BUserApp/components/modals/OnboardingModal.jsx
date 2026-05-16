import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Camera, Image as ImageIcon, Globe, ChevronRight, Loader2, Check, Upload, Mail } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OnboardingModal = ({ isOpen }) => {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, logo: false });
  const [errors, setErrors] = useState({ name: '', mobileNumber: '', email: '' });

  const profileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.user?.name || '',
    mobileNumber: user?.user?.mobileNumber || '',
    email: user?.user?.email || '',
    profilePhoto: '',
    logo: '',
    contentLanguage: 'English'
  });

  // Sync formData when user changes (e.g. login with different account)
  React.useEffect(() => {
    if (user?.user) {
      setFormData({
        name: user.user.name || '',
        mobileNumber: user.user.mobileNumber || '',
        email: user.user.email || '',
        profilePhoto: user.user.profilePhoto || '',
        logo: user.user.logo || '',
        contentLanguage: user.user.contentLanguage || 'English'
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const newErrors = { name: '', mobileNumber: '', email: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    setErrors(newErrors);
    if (isValid) {
      setStep(2);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
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
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, uploadData, config);
      setFormData(prev => ({ ...prev, [type === 'profile' ? 'profilePhoto' : 'logo']: data.url }));
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/user/profile`, formData, config);

      // Update global context
      const updatedUser = { ...user, user: data.user };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Modal closes automatically because user.name is now present
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const languages = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Bengali', 'Tamil'];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      {/* Hidden File Inputs */}
      <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-[min(540px,94%)] bg-white rounded-[32px] overflow-hidden shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="bg-[#ef4444] p-6 sm:p-8 text-white relative">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase italic">Complete Profile</h2>
              <p className="text-white/80 text-xs sm:text-sm font-semibold mt-1">
                {step === 1 ? 'Step 1: Personal Details' : 'Step 2: Branding & Language'}
              </p>
            </div>
            <div className="flex gap-1.5 mb-1">
              <div className={`w-6 h-1.5 rounded-full transition-all ${step === 1 ? 'bg-white' : 'bg-white/30'}`} />
              <div className={`w-6 h-1.5 rounded-full transition-all ${step === 2 ? 'bg-white' : 'bg-white/30'}`} />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleStep1Submit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Full Name</label>
                    <div className="relative flex items-center">
                      <User size={18} className={`absolute left-4 transition-colors ${errors.name ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#ef4444]'}`} />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 transition-all font-sans ${errors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                      />
                    </div>
                    {errors.name && <p className="text-[0.7rem] font-bold text-red-500 mt-1.5 ml-2 italic">{errors.name}</p>}
                  </div>

                  <div className="relative group">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Mobile Number</label>
                    <div className="relative flex items-center">
                      <Phone size={18} className={`absolute left-4 transition-colors ${errors.mobileNumber ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#ef4444]'}`} />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Enter mobile number"
                        className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 transition-all font-sans ${errors.mobileNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, mobileNumber: val });
                          if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
                        }}
                      />
                    </div>
                    {errors.mobileNumber && <p className="text-[0.7rem] font-bold text-red-500 mt-1.5 ml-2 italic">{errors.mobileNumber}</p>}
                  </div>

                  <div className="relative group">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail size={18} className={`absolute left-4 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#ef4444]'}`} />
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 transition-all font-sans ${errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                      />
                    </div>
                    {errors.email && <p className="text-[0.7rem] font-bold text-red-500 mt-1.5 ml-2 italic">{errors.email}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none cursor-pointer group"
                >
                  <span>Save & Proceed</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 block">Profile Photo</label>
                    <div 
                      onClick={() => profileInputRef.current.click()}
                      className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                    >
                      {uploading.profile ? (
                        <Loader2 size={24} className="animate-spin text-red-500" />
                      ) : formData.profilePhoto ? (
                        <img src={formData.profilePhoto} className="w-full h-full object-cover" alt="p" />
                      ) : (
                        <>
                          <Camera size={24} />
                          <span className="text-[0.6rem] font-bold uppercase tracking-widest">Upload Photo</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 block">Business Logo</label>
                    <div 
                      onClick={() => logoInputRef.current.click()}
                      className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden"
                    >
                      {uploading.logo ? (
                        <Loader2 size={24} className="animate-spin text-red-500" />
                      ) : formData.logo ? (
                        <img src={formData.logo} className="w-full h-full object-cover" alt="l" />
                      ) : (
                        <>
                          <ImageIcon size={24} />
                          <span className="text-[0.6rem] font-bold uppercase tracking-widest">Upload Logo</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Content Language</label>
                  <div className="relative flex items-center">
                    <Globe size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                    <select
                      className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 appearance-none focus:bg-white focus:border-[#ef4444]/20 transition-all cursor-pointer font-sans"
                      value={formData.contentLanguage}
                      onChange={(e) => setFormData({ ...formData, contentLanguage: e.target.value })}
                    >
                      {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    disabled={loading}
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-200 transition-all border-none cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    disabled={loading || uploading.profile || uploading.logo}
                    onClick={handleFinalSubmit}
                    className="flex-[2] h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none cursor-pointer disabled:opacity-70"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Start Exploring</span> <Check size={18} /></>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
