import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Lock, ChevronRight, Chrome as Google, Share2 as Facebook, Mail, ArrowLeft, Loader2, MessageSquare, Gift } from 'lucide-react';
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
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [searchParams] = useSearchParams();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const [agreed, setAgreed] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const [fieldError, setFieldError] = useState(''); // Added for identifier validation
  const [otpError, setOtpError] = useState(''); // Added for OTP validation
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'privacy' or 'terms'
  const [policies, setPolicies] = useState({ privacy: '', terms: '' });

  const { sendOtp, login } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch Policies
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/settings`);
        setPolicies({
          privacy: data.privacyPolicy || '',
          terms: data.termsAndConditions || ''
        });
      } catch (err) {
        console.error('Failed to fetch policies:', err);
      }
    };
    fetchPolicies();
  }, [API_URL]);

  // URL Referral Detect
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      setShowReferralInput(true);
    }
  }, [searchParams]);

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
    
    setFieldError('');
    setPolicyError('');
    setIsError('');

    if (!identifier.trim()) {
      setFieldError('Email or Mobile number is required');
      return;
    }

    // Validation for Email or 10-digit Mobile
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^[0-9]{10}$/;
    
    const isEmailInput = identifier.includes('@');
    
    if (isEmailInput) {
      if (!emailRegex.test(identifier)) {
        setFieldError('Please enter a valid email address');
        return;
      }
    } else {
      // Treat as mobile
      if (!mobileRegex.test(identifier)) {
        setFieldError('Please enter a valid 10-digit mobile number');
        return;
      }
    }

    if (!agreed) {
      setPolicyError('Please agree to our Privacy Policy and Terms of Service to continue.');
      return;
    }

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
    setOtpError('');
    setIsError('');

    if (!otp.trim()) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }

    if (otp.length < 6) {
      setOtpError('OTP must be exactly 6 digits');
      return;
    }

    if (timeLeft === 0) {
      setIsError('Your OTP has expired. Please resend.');
      return;
    }
    setIsVerifying(true);
    try {
      await login(identifier, otp, referralCode, agreed);
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
          <p className="text-slate-400 text-sm font-semibold mt-1 text-center font-sans">
            {step === 1 
              ? 'Ready to create more amazing posters?' 
              : <>We've sent a code to {identifier}. Please enter it below.</>
            }
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
                      placeholder="Enter Email or Phone"
                      className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 transition-all font-sans ${fieldError ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                      value={identifier}
                      onChange={(e) => {
                        let val = e.target.value;
                        // If input is strictly numeric, limit to 10 digits
                        if (/^\d+$/.test(val) && val.length > 10) {
                          val = val.substring(0, 10);
                        }
                        setIdentifier(val);
                        if (val) setFieldError('');
                      }}
                    />
                </div>
                {fieldError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest mt-2 ml-2"
                  >
                    {fieldError}
                  </motion.p>
                )}
              </div>

              {!showReferralInput ? (
                <button 
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  className="text-[0.65rem] font-black text-[#ef4444] uppercase tracking-widest hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1.5 ml-1"
                >
                  <Gift size={12} /> Have a referral code?
                </button>
              ) : (
                <div className="relative group">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Referral Code (Optional)</label>
                  <div className="relative flex items-center">
                    <Gift size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Enter Referral Code"
                      className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all uppercase"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    {referralCode && (
                      <div className="absolute right-4 px-2 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-tighter">
                        Applied
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 transition-all checked:border-[#ef4444] checked:bg-[#ef4444]"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (e.target.checked) setPolicyError('');
                      }}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    I agree to the <button type="button" onClick={() => { setModalType('privacy'); setShowModal(true); }} className="text-[#ef4444] hover:underline bg-transparent border-none p-0 font-black cursor-pointer">Privacy Policy</button> & <button type="button" onClick={() => { setModalType('terms'); setShowModal(true); }} className="text-[#ef4444] hover:underline bg-transparent border-none p-0 font-black cursor-pointer">Terms of Service</button>
                  </span>
                </label>
                {policyError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest ml-8"
                  >
                    {policyError}
                  </motion.p>
                )}
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
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 tracking-[0.5em] transition-all ${otpError ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (e.target.value) setOtpError('');
                    }}
                  />
                </div>
                {otpError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest mt-2 ml-2"
                  >
                    {otpError}
                  </motion.p>
                )}
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
        Official B2B Portal for Dealing India<br/>
        <span className="text-slate-300">© 2026 Dealing India</span>
      </p>

      {/* Policy Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                  {modalType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border-none cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto font-sans text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {modalType === 'privacy' ? policies.privacy : policies.terms}
                {(!policies.privacy && modalType === 'privacy') && "Privacy policy not yet configured."}
                {(!policies.terms && modalType === 'terms') && "Terms of service not yet configured."}
              </div>
              <div className="p-6 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-8 h-12 bg-[#ef4444] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 border-none cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
