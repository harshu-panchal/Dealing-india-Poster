import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/settings`);
        setTerms(data.termsAndConditions || 'Terms and Conditions are currently being updated.');
      } catch (error) {
        console.error('Fetch terms error:', error);
        setTerms('Unable to load Terms and Conditions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#ef4444] transition-colors border-none cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <ShieldCheck className="text-[#ef4444]" size={18} />
            </div>
            <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest">Legal Center</h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Terms & Conditions</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Please read these terms carefully before using our platform</p>
          </div>

          <div className="prose prose-slate max-w-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#ef4444]" size={32} />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Legal Docs...</p>
              </div>
            ) : (
              <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                {terms}
              </div>
            )}
          </div>

          {!loading && (
            <div className="mt-16 pt-8 border-t border-slate-50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
