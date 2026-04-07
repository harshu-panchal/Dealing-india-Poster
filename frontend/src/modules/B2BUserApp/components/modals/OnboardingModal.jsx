import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Camera, Image as ImageIcon, Globe, ChevronRight, Loader2, Check } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OnboardingModal = ({ isOpen }) => {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.user?.name || '',
    mobileNumber: user?.user?.mobileNumber || '',
    email: user?.user?.email || '',
    profilePhoto: '',
    logo: '',
    contentLanguage: 'English'
  });

  if (!isOpen) return null;

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (formData.name && formData.mobileNumber) {
      setStep(2);
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
                <div className="space-y-2 text-center mb-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Welcome {user?.user?.email || user?.user?.mobileNumber}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Full Name</label>
                    <div className="relative flex items-center">
                      <User size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 focus:bg-white focus:border-[#ef4444]/20 transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Mobile Number</label>
                    <div className="relative flex items-center">
                      <Phone size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                      <input
                        type="tel"
                        required
                        placeholder="6261265704"
                        className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 focus:bg-white focus:border-[#ef4444]/20 transition-all"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      />
                    </div>
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
                    <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                      <Camera size={24} />
                      <span className="text-[0.6rem] font-bold uppercase tracking-widest">Optional</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 block">Business Logo</label>
                    <div className="h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer hover:bg-slate-100 transition-colors">
                      <ImageIcon size={24} />
                      <span className="text-[0.6rem] font-bold uppercase tracking-widest">Optional</span>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Content Language</label>
                  <div className="relative flex items-center">
                    <Globe size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                    <select
                      className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 appearance-none focus:bg-white focus:border-[#ef4444]/20 transition-all cursor-pointer"
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
                    disabled={loading}
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
