import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ChevronRight, Chrome as Google, Share2 as Facebook, Mail, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP
  const [isError, setIsError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const { sendOtp, login } = useAuth();
  const navigate = useNavigate();

  // Timer Effect
  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e, isResend = false) => {
    if (e) e.preventDefault();
    setIsError('');
    setSuccessMsg('');
    setIsSending(true);
    try {
      await sendOtp(identifier);
      setTimeLeft(300); // Reset timer
      if (isResend) {
        setSuccessMsg('OTP has been resent successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setStep(2);
      }
    } catch (err) {
      setIsError(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) {
      setIsError('Your OTP has expired. Please resend.');
      return;
    }
    setIsError('');
    setIsVerifying(true);
    try {
      await login(identifier, otp);
      navigate('/');
    } catch (err) {
      setIsError(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const isEmail = identifier.includes('@');

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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {step === 1 ? 'Welcome Back' : 'Verify Identity'}
          </h1>
          <p className="text-slate-400 text-sm font-semibold mt-1 text-center">
            {step === 1 ? 'Ready to create more amazing posters?' : `We've sent a code to ${identifier}`}
          </p>
        </div>

        {isError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold"
          >
            {isError}
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-xs font-bold flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {successMsg}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp} 
              className="space-y-6"
            >
              <div className="relative group">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Mobile or Email</label>
                <div className="relative flex items-center">
                  {identifier.includes('@') ? (
                    <Mail size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                  ) : (
                    <Phone size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                  )}
                  <input 
                    type="text" 
                    required
                    placeholder="Enter Email or Phone"
                    className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={isSending}
                className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none group cursor-pointer disabled:opacity-70"
              >
                {isSending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp} 
              className="space-y-6"
            >
              <div className="relative group">
                <div className="flex justify-between items-center ml-2 mb-2">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">One-Time Password</label>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-[0.65rem] font-black uppercase tracking-widest text-[#ef4444] border-none bg-transparent hover:underline cursor-pointer"
                  >
                    Change?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 tracking-[0.5em] focus:bg-white focus:border-[#ef4444]/20 transition-all"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              <button 
                disabled={isVerifying}
                className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none group cursor-pointer disabled:opacity-70"
              >
                {isVerifying ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

                <div className="flex flex-col items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => handleSendOtp(null, true)}
                    disabled={isSending || timeLeft > 0}
                    className="text-slate-400 text-[0.65rem] font-black uppercase tracking-widest hover:text-[#ef4444] transition-colors disabled:opacity-50 disabled:hover:text-slate-400"
                  >
                    {isSending && step === 2 ? 'Resending...' : "Didn't receive code? Resend"}
                  </button>
                  
                  {timeLeft > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <div className="w-1 h-1 rounded-full bg-[#ef4444] animate-pulse" />
                      <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">
                        Code expires in <span className="text-[#ef4444]">{formatTime(timeLeft)}</span>
                      </span>
                    </div>
                  )}
                </div>
            </motion.form>
          )}
        </AnimatePresence>

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
