import React from 'react';
import { ArrowLeft, Info, ShieldCheck, FileText, Globe, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-[#b91c1c] text-white px-6 py-12 relative overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <button 
          onClick={() => navigate(-1)}
          className="bg-white/20 p-2.5 rounded-full active:scale-95 transition-transform border-none outline-none text-white cursor-pointer mb-6"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black tracking-tighter">About Us</h1>
        <p className="text-white/80 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Learn more about Dealingindia</p>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-[#ef4444] mb-4">
              <Info size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dealingindia</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Your Branding Partner</p>
          </div>

          <div className="space-y-6 text-slate-600">
            <p className="text-[0.95rem] leading-relaxed font-medium">
              Dealingindia is a premier digital branding platform designed to empower businesses and individuals with professional-grade visual content. Our mission is to make high-quality design accessible to everyone.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                 <Heart className="text-red-500 mb-2" size={20} />
                 <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">User Focused</h4>
                 <p className="text-[10px] font-bold text-slate-400 mt-1">Built with your needs in mind</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                 <Globe className="text-blue-500 mb-2" size={20} />
                 <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Global Standards</h4>
                 <p className="text-[10px] font-bold text-slate-400 mt-1">World-class design quality</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Legal Information</h3>
               <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/privacy-policy')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-red-50 transition-colors border-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-slate-400 group-hover:text-red-500" />
                      <span className="text-sm font-bold text-slate-700">Privacy Policy</span>
                    </div>
                    <ArrowLeft size={16} className="text-slate-300 rotate-180 group-hover:text-red-500" />
                  </button>
                  <button 
                    onClick={() => navigate('/terms-conditions')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-red-50 transition-colors border-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-slate-400 group-hover:text-red-500" />
                      <span className="text-sm font-bold text-slate-700">Terms & Conditions</span>
                    </div>
                    <ArrowLeft size={16} className="text-slate-300 rotate-180 group-hover:text-red-500" />
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Version 1.0.0 (Stable)</p>
           <p className="text-[10px] font-bold text-slate-300 mt-1">© 2026 Dealing India. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
