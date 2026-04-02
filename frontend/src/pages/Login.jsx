import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ChevronRight, Chrome as Google, Share2 as Facebook, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Logic for user login...
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs for premium feel */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-400 opacity-10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#ef4444] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100 mb-6">
             <div className="text-2xl font-black italic">A</div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm font-semibold mt-1">Ready to create more amazing posters?</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Phone Number</label>
            <div className="relative flex items-center">
              <Phone size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
              <input 
                 type="tel" 
                 required
                 placeholder="6261265704"
                 className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all"
                 value={formData.phone}
                 onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="relative group">
            <div className="flex justify-between items-center ml-2 mb-2">
              <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Password</label>
              <button type="button" className="text-[0.65rem] font-black uppercase tracking-widest text-[#ef4444] border-none bg-transparent hover:underline cursor-pointer">Forgot?</button>
            </div>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
              <input 
                 type="password" 
                 required
                 placeholder="••••••••"
                 className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all"
                 value={formData.password}
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none group cursor-pointer">
             <span>Log In</span>
             <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative my-10 text-center">
           <hr className="border-slate-100" />
           <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[0.65rem] font-bold text-slate-300 uppercase tracking-widest">Or Continue With</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
           <button className="h-14 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group cursor-pointer font-bold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#ef4444]"><Google size={16} /></div>
              <span className="text-xs">Google</span>
           </button>
           <button className="h-14 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all group cursor-pointer font-bold text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#3b82f6]"><Facebook size={18} fill="currentColor" /></div>
              <span className="text-xs">Facebook</span>
           </button>
        </div>

        <div className="text-center pt-2">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">
             New to Dealing India Poster? <Link to="/register" className="text-[#ef4444] hover:underline">Create Account</Link>
           </p>
        </div>
      </motion.div>

      {/* Footer Disclaimer */}
      <p className="mt-8 text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest leading-loose text-center max-w-[300px]">
        By signing in, you agree to our<br/>
        <span className="text-slate-600">Privacy Policy</span> & <span className="text-slate-600">Terms of Service</span>
      </p>
    </div>
  );
};

export default Login;
