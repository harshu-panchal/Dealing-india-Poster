import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ChevronRight, User, Plus, Facebook, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    // Logic for user registration...
    navigate('/login');
  };

  const SocialIcon = ({ children }) => (
    <div className="w-5 h-5 flex items-center justify-center">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-400 opacity-10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-red-400 opacity-10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-white rounded-[40px] p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#ef4444] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100 mb-6 font-black italic text-2xl">
             A
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Join Appzeto</h1>
          <p className="text-slate-400 text-sm font-semibold mt-1 text-center">Start creating beautiful posters today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative group">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">Full Name</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
              <input 
                 type="text" 
                 required
                 placeholder="Rahul Sharma"
                 className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all font-inter"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">Mobile Number</label>
            <div className="relative flex items-center">
              <Phone size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
              <input 
                 type="tel" 
                 required
                 placeholder="6261265704"
                 className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all font-inter"
                 value={formData.phone}
                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="relative group pb-2">
            <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">Security Key</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
              <input 
                 type="password" 
                 required
                 placeholder="••••••••"
                 className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all font-inter"
                 value={formData.password}
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button className="w-full h-14 bg-slate-800 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none group cursor-pointer">
             <span>Create Account</span>
             <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative my-8 text-center">
           <hr className="border-slate-100" />
           <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[0.6rem] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">Also Sign Up With</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
           <button className="h-12 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all group cursor-pointer font-bold text-slate-600">
              <SocialIcon><span className="text-[#ef4444] font-black italic">G</span></SocialIcon>
              <span className="text-[0.65rem] uppercase tracking-wider">Google</span>
           </button>
           <button className="h-12 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all group cursor-pointer font-bold text-slate-600">
              <Facebook size={14} className="text-[#3b82f6]" fill="currentColor" />
              <span className="text-[0.65rem] uppercase tracking-wider">Facebook</span>
           </button>
        </div>

        <div className="text-center">
           <p className="text-slate-400 text-[0.7rem] font-bold uppercase tracking-wide">
             Already a member? <Link to="/login" className="text-[#ef4444] hover:underline">Sign In Instead</Link>
           </p>
        </div>
      </motion.div>

      <p className="mt-8 text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest text-center">
        &copy; 2026 Dealing-india-Poster
      </p>
    </div>
  );
};

export default Register;
