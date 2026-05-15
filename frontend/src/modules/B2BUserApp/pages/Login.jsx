import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ShieldAlert, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Prevent duplicate background SSO calls on rapid re-renders
  const loginStarted = useRef(false);
  
  const [status, setStatus] = useState('checking'); // 'checking' | 'authenticating' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL || 'https://dealingindia.com';

  useEffect(() => {
    const queryMobile = searchParams.get('mobile') || searchParams.get('mobileNumber');
    const queryName = searchParams.get('name');
    const refCode = searchParams.get('ref') || '';

    if (queryMobile && queryName) {
      if (loginStarted.current) return;
      loginStarted.current = true;

      const cleanName = decodeURIComponent(queryName);
      const cleanMobile = queryMobile.replace(/[^0-9]/g, '').slice(-10); // 10 digits standardization
      
      if (!/^[0-9]{10}$/.test(cleanMobile)) {
        setStatus('error');
        setErrorMsg('Invalid phone number received via deep-link.');
        return;
      }

      setStatus('authenticating');
      
      const triggerSSO = async () => {
        try {
          // The 0-Click SSO background login
          await login(cleanName, cleanMobile, refCode, true);
          // Navigate immediately to main app!
          navigate('/');
        } catch (err) {
          console.error('SSO Handshake Failed:', err);
          setStatus('error');
          setErrorMsg(err || 'Unable to authenticate session safely. Please try again.');
        }
      };

      triggerSSO();
    } else {
      // No params found = user tried accessing /login directly
      setStatus('error');
    }
  }, [searchParams, login, navigate]);

  const handleRedirect = () => {
    window.location.href = MAIN_APP_URL;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient branding glows */}
      <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-red-500 opacity-[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-blue-500 opacity-[0.05] rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-[460px] bg-white rounded-[40px] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08)] border border-slate-50 z-10 flex flex-col items-center text-center"
      >
        {/* Brand Identity */}
        <div className="w-20 h-20 bg-[#ef4444] rounded-[28px] flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(239,68,68,0.3)] mb-8 relative">
          <div className="text-3xl font-black italic tracking-tighter">A</div>
          {status === 'authenticating' && (
            <span className="absolute inset-[-4px] border-2 border-[#ef4444] rounded-[32px] animate-ping opacity-20" />
          )}
        </div>

        {status === 'authenticating' || status === 'checking' ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <Loader2 size={40} className="text-[#ef4444] animate-spin stroke-[2.5]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-3 leading-tight uppercase italic">
              Setting Up Workspace
            </h2>
            <p className="text-slate-400 text-sm font-semibold tracking-wide leading-relaxed font-sans animate-pulse">
              🔒 Securely authenticating session...
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            {/* Error/Direct Access View */}
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
              <ShieldAlert size={28} />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-4 uppercase italic leading-tight">
              {errorMsg ? "Authentication Failed" : "Access Poster Studio via Dealing India"}
            </h2>

            <p className="text-slate-500 text-sm font-bold font-sans leading-relaxed tracking-wide mb-8 px-2">
              {errorMsg ? errorMsg : "To ensure your designs save to the correct account, please launch Poster Studio directly from your active Dealing India user or vendor dashboard."}
            </p>

            <button 
              onClick={handleRedirect}
              className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_16px_32px_-8px_rgba(239,68,68,0.3)] hover:shadow-[0_20px_40px_-8px_rgba(239,68,68,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all border-none cursor-pointer flex items-center justify-center gap-3 group"
            >
              <span>Return to Dealing India</span>
              <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Clean branding footer */}
      <p className="mt-8 text-[0.65rem] text-slate-400 font-black uppercase tracking-widest text-center flex items-center gap-2 opacity-60 z-10">
        <span>Dealing India</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
        <span>Poster Engine</span>
      </p>
    </div>
  );
};

export default Login;
