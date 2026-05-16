import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Lock, ChevronRight, Mail, ArrowLeft, Loader2, MessageSquare, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: Mobile Entry, 2: Name Entry (Register)
  const [isError, setIsError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [searchParams] = useSearchParams();

  const [agreed, setAgreed] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'privacy' or 'terms'
  const [policies, setPolicies] = useState({ privacy: '', terms: '' });

  const { posterLogin, posterRegister } = useAuth();
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

  const handleContinue = async (e) => {
    if (e) e.preventDefault();
    
    setFieldError('');
    setPolicyError('');
    setIsError('');

    if (!mobileNumber.trim()) {
      setFieldError('Mobile number is required');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setFieldError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!agreed) {
      setPolicyError('Please agree to our policies to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      // Try logging in first
      await posterLogin(mobileNumber);
      navigate('/');
    } catch (err) {
      // If user not found (404), go to registration step
      if (err.includes('not found') || err.includes('register')) {
        setStep(2);
      } else {
        setIsError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFieldError('');
    setIsError('');

    if (!name.trim()) {
      setFieldError('Full Name is required');
      return;
    }

    setIsProcessing(true);
    try {
      await posterRegister(mobileNumber, name, referralCode, agreed);
      navigate('/');
    } catch (err) {
      setIsError(err);
    } finally {
      setIsProcessing(false);
    }
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
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {step === 1 ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-slate-400 text-sm font-semibold mt-1 text-center font-sans">
            {step === 1 
              ? 'Ready to create more amazing posters?' 
              : `Welcome! Please tell us your name to get started.`
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

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleContinue} 
              className="space-y-6"
            >
              <div className="relative group">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Mobile Number</label>
                <div className="relative flex items-center">
                  <Phone size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Enter 10-digit Mobile"
                    className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 transition-all font-sans ${fieldError ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                    value={mobileNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 10) val = val.substring(0, 10);
                      setMobileNumber(val);
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
                disabled={isProcessing}
                className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none group cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
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
              onSubmit={handleRegister} 
              className="space-y-6"
            >
              <div className="relative group">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Mobile Number</label>
                <div className="relative flex items-center">
                  <Phone size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Enter 10-digit Mobile"
                    className="w-full h-14 bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-[#ef4444]/20 transition-all font-sans"
                    value={mobileNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 10) val = val.substring(0, 10);
                      setMobileNumber(val);
                    }}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Full Name</label>
                <div className="relative flex items-center">
                  <MessageSquare size={18} className="absolute left-4 text-slate-400 group-focus-within:text-[#ef4444] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Enter Your Name"
                    className={`w-full h-14 bg-slate-50 border-2 outline-none rounded-2xl px-12 text-[1rem] font-bold text-slate-800 placeholder:text-slate-300 transition-all ${fieldError ? 'border-red-500 bg-red-50/30' : 'border-slate-50 focus:bg-white focus:border-[#ef4444]/20'}`}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value) setFieldError('');
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
                  </div>
                </div>
              )}

              <button 
                disabled={isProcessing}
                className="w-full h-14 bg-[#ef4444] text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all border-none group cursor-pointer disabled:opacity-70"
              >
                {isProcessing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Disclaimer */}
      <p className="mt-8 text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest leading-loose text-center max-w-[300px]">
        Official B2B Portal for Dealingindia<br/>
        <span className="text-slate-300">© 2026 Dealingindia</span>
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
