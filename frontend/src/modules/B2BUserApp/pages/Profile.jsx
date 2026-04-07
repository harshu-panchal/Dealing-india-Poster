import React, { useState } from 'react';
import { Camera, User, Phone, MapPin, Globe, CreditCard, Share2, LogOut, ShieldCheck, Mail, Building2, ExternalLink, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    businessName: user?.user?.name || 'Your Business Name',
    ownerName: user?.user?.name || 'Owner Name',
    phone: user?.user?.mobileNumber || 'Add Phone Number',
    email: user?.user?.email || 'Add Email Address',
    address: '123 Tech Park, Silicon Valley, IND', // This field isn't in user model yet
    website: 'www.dealingindia.com',
    gstNumber: '22AAAAA0000A1Z5'
  });

  // Sync profile when user data changes
  React.useEffect(() => {
    if (user?.user) {
      setProfile(prev => ({
        ...prev,
        businessName: user.user.name || prev.businessName,
        ownerName: user.user.name || prev.ownerName,
        phone: user.user.mobileNumber || prev.phone,
        email: user.user.email || prev.email,
      }));
    }
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText('DI-REF-12345');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Header Profile Section */}
      <div className="relative overflow-hidden bg-[#1e1b4b] pt-12 pb-20 px-6 font-sans">
        {/* Background Decorative Circles */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 border-4 border-white/20 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden transform transition-transform group-hover:scale-105 duration-300">
              <img 
                src="https://ui-avatars.com/api/?name=Appzeto&background=4f46e5&color=fff&size=200" 
                alt="Business Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#ef4444] text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:bg-[#dc2626] transition-colors border-2 border-indigo-950 active:scale-95">
              <Camera size={18} />
            </button>
          </div>
          
          <h1 className="mt-5 text-2xl font-black text-white tracking-tight leading-none">{profile.businessName}</h1>
          <div className="mt-2 flex items-center gap-2 justify-center">
            <span className="flex items-center gap-1.5 bg-indigo-500/30 backdrop-blur-sm px-4 py-1.5 rounded-full text-[0.7rem] font-black text-indigo-100 border border-indigo-400/30 tracking-widest">
              <ShieldCheck size={14} className="text-indigo-300" />
              PREMIUM MEMBER
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 relative z-20 space-y-4">
        {/* Wallet & Referral Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Wallet Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">Points Balance</h3>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">2,500</span>
                    <span className="text-[0.65rem] font-black text-slate-400 uppercase">PTS</span>
                  </div>
                </div>
              </div>
              <button className="bg-slate-950 text-white px-5 py-2.5 rounded-2xl text-[0.7rem] font-black tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-200">
                BUY POINTS
              </button>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              </div>
              <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">15 Days Left</span>
            </div>
          </motion.div>

          {/* Referral Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#b91c1c] rounded-3xl p-6 shadow-xl shadow-red-500/10"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                <Share2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-[0.65rem] font-black text-white/50 uppercase tracking-[0.2em]">Refer & Earn</h3>
                <p className="text-sm text-white font-bold leading-snug mt-1">Get 500 bonus points for every friend you refer!</p>
                <div className="mt-5 flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/10">
                  <code className="flex-1 font-black text-white text-center tracking-[0.15em] text-sm">DI-REF-12345</code>
                  <button 
                    onClick={handleCopy}
                    className="bg-white text-red-700 px-5 py-2 rounded-xl text-[0.65rem] font-black shadow-md flex items-center gap-1.5 hover:bg-red-50 transition-colors uppercase tracking-widest active:scale-95"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Business Information */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
              <Building2 size={20} />
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Business Profile</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="BUSINESS NAME" value={profile.businessName} icon={<Building2 size={16} />} />
              <InputField label="OWNER NAME" value={profile.ownerName} icon={<User size={16} />} />
              <InputField label="PHONE NUMBER" value={profile.phone} icon={<Phone size={16} />} />
              <InputField label="EMAIL ADDRESS" value={profile.email} icon={<Mail size={16} />} />
              <InputField label="GST NUMBER" value={profile.gstNumber} icon={<ShieldCheck size={16} />} />
              <InputField label="WEBSITE" value={profile.website} icon={<Globe size={16} />} />
            </div>
            
            <div className="space-y-2">
              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">WORK ADDRESS</label>
              <div className="relative group">
                <div className="absolute top-3.5 left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors"><MapPin size={18} /></div>
                <textarea 
                  readOnly 
                  value={profile.address}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 h-24 text-[0.85rem] font-extrabold text-slate-700 outline-none resize-none focus:border-indigo-200 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 mb-2 grid grid-cols-2 gap-4">
            <button className="bg-slate-100 text-slate-800 py-4.5 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              Settings
            </button>
            <button className="bg-[#ef4444] text-white py-4.5 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.2em] shadow-lg shadow-red-500/25 hover:bg-[#dc2626] transition-colors flex items-center justify-center gap-2 active:scale-95">
              Edit Details
            </button>
          </div>
        </motion.section>

        {/* Footer Actions */}
        <div className="pt-6 pb-2 text-center">
          <button 
            onClick={logout}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[#ef4444] font-black text-[0.65rem] uppercase tracking-[0.25em] hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group cursor-pointer"
          >
             <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Logout Securely
          </button>
          <div className="mt-8 flex flex-col items-center gap-2">
             <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-[0.4em]">DEALING INDIA POSTER</p>
             <p className="text-[0.55rem] font-bold text-slate-300 uppercase tracking-[0.2em]">Build 2.4.0 • Latest Release</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, icon }) => (
  <div className="space-y-2">
    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">{icon}</div>
      <input 
        type="text" 
        readOnly 
        value={value} 
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-[0.85rem] font-black text-slate-700 outline-none focus:border-indigo-200 focus:bg-white transition-all shadow-inner"
      />
    </div>
  </div>
);

export default Profile;
