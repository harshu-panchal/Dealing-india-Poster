import React, { useState } from 'react';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LanguageSelector = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(localStorage.getItem('preferred_language') || 'English');

  const languages = [
    { id: 'English', name: 'English', native: 'English' },
    { id: 'Hindi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'Gujarati', name: 'Gujarati', native: 'ગુજરાતી' },
    { id: 'Marathi', name: 'Marathi', native: 'मराठी' },
    { id: 'Punjabi', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { id: 'Tamil', name: 'Tamil', native: 'தமிழ்' },
    { id: 'Telugu', name: 'Telugu', native: 'తెలుగు' },
    { id: 'Kannada', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { id: 'Malayalam', name: 'Malayalam', native: 'മലയാളം' },
    { id: 'Bengali', name: 'Bengali', native: 'বাংলা' }
  ];

  const handleSelect = (id) => {
    setSelected(id);
    localStorage.setItem('preferred_language', id);
    setTimeout(() => navigate(-1), 300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#b91c1c] text-white px-6 py-10 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <button 
          onClick={() => navigate(-1)}
          className="bg-white/20 p-2.5 rounded-full active:scale-95 transition-transform border-none outline-none text-white cursor-pointer mb-6"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black tracking-tighter">App Language</h1>
        <p className="text-white/80 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Select your preferred language</p>
      </div>

      <div className="px-6 py-8">
        <div className="space-y-3">
          {languages.map((lang) => (
            <button 
              key={lang.id}
              onClick={() => handleSelect(lang.id)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border-2 ${selected === lang.id ? 'border-red-500 bg-red-50/50' : 'border-gray-50 bg-gray-50/50 hover:border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selected === lang.id ? 'bg-red-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                    <Globe size={20} />
                 </div>
                 <div className="text-left">
                    <p className={`text-sm font-black ${selected === lang.id ? 'text-red-600' : 'text-slate-700'}`}>{lang.native}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang.name}</p>
                 </div>
              </div>
              {selected === lang.id && (
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
                   <Check size={14} strokeWidth={4} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
