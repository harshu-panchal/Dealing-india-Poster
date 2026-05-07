import React, { useState, useEffect } from 'react';
import { 
  Share2, Award, Users, Copy, Check, 
  ArrowLeft, ChevronRight, Gift, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Referral = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralPoints, setReferralPoints] = useState(10);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/settings`);
        setReferralPoints(data.referralPoints); 
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleCopy = () => {
    if (!user?.user?.referralCode) return;
    navigator.clipboard.writeText(user.user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Hey! Join Dealingindia Poster and get free credits to create amazing professional posters and videos. Use my referral code: ${user?.user?.referralCode || ''}`;

  const shareURL = `${window.location.origin}/login?ref=${user?.user?.referralCode || ''}`;

  const sharePlatform = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dealingindia Poster',

          text: shareText,
          url: shareURL,
        });
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    } else {
      // Fallback: Copy full text with link
      const textToCopy = `${shareText}\n${shareURL}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
             <h1 className="text-xl font-black text-slate-800 tracking-tight">Refer & Earn</h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incentive Program</p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-8 space-y-6">
        {/* Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                <Gift size={22} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Limited Offer</span>
            </div>
            
            <h2 className="text-3xl font-black mb-2 tracking-tight">Get Free Credits</h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[240px]">
              Invite your friends to the platform and earn <span className="text-white font-black underline decoration-red-400 decoration-2 underline-offset-4">{referralPoints} bonus credits</span> for every successful registration.
            </p>
            
            <button 
              onClick={sharePlatform}
              disabled={!user?.user?.referralCode}
              className="mt-8 bg-[#ef4444] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/40 active:scale-95 transition-all flex items-center gap-2 border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {user?.user?.referralCode ? 'Share Platform' : 'Syncing...'} <Share2 size={16} />
            </button>
          </div>
          
          <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-12 -translate-y-6 rotate-12 scale-150">
            <Gift size={160} />
          </div>
        </motion.div>

        {/* User Referral Info */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-4">
                 <Award size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Earned</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{user?.user?.points || 0} <span className="text-[10px] text-slate-300">PTS</span></h3>
           </div>
           <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
                 <Users size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Members</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{user?.user?.referralCount || 0} <span className="text-[10px] text-slate-300">NEW</span></h3>
           </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
           <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
             Your Referral Code
           </h3>
           <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <code className="flex-1 font-black text-indigo-600 text-center tracking-[0.2em] text-lg py-2 uppercase">
               {user?.user?.referralCode || (
                 <span className="text-[10px] text-slate-300 animate-pulse">Assigning Code...</span>
               )}
             </code>
             <button 
               onClick={handleCopy}
               className="bg-white text-slate-800 w-12 h-12 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-95 cursor-pointer"
             >
               {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
             </button>
           </div>
           <p className="mt-6 text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest">
             Anyone who uses this code to register will give you points instantly.
           </p>
        </div>

        {/* How it works */}
        <div className="space-y-4">
           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">How it works</h3>
           <div className="space-y-3">
              {[
                { icon: <Zap size={18} />, title: "Share Your Code", text: "Invite friends via WhatsApp or other social media links." },
                { icon: <Users size={18} />, title: "Friend Registers", text: "Your friend signs up using your unique referral code." },
                { icon: <Award size={18} />, title: "Earn Rewards", text: `Receive ${referralPoints} credits automatically in your account.` }
              ].map((step, i) => (
                <div key={i} className="bg-white p-5 rounded-[24px] flex items-start gap-4 border border-slate-100 group">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                      {step.icon}
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">{step.title}</h4>
                      <p className="text-[0.7rem] font-medium text-slate-400 mt-0.5">{step.text}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
