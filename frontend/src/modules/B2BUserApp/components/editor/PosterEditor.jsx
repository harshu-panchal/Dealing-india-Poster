import React, { useState, useEffect } from 'react';
import { 
  Type, X, Check, ImageIcon as ImageIcon, 
  User, Star, Smile, Plus, Video, Music, Sparkles, PlayCircle, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const PosterEditor = ({ template, onClose }) => {
  const { userData, setUserData, initialEditorTab } = useEditor();
  const [activeTab, setActiveTab] = useState(initialEditorTab || 'branding');
  const [musicList, setMusicList] = useState([]);
  const [activeMusicId, setActiveMusicId] = useState(userData.musicId || null);
  
  // Local state for edits before "Okay"
  const [localUserData, setLocalUserData] = useState({...userData});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/music/public`);
        setMusicList(data);
        if (data.length > 0 && !activeMusicId) {
          setActiveMusicId(data[0]._id);
        }
      } catch (error) {
        console.error('Fetch music error:', error);
      }
    };
    fetchMusic();
  }, [API_URL]);

  const toggleField = (field) => {
    setLocalUserData(prev => ({
      ...prev,
      enabledFields: {
        ...prev.enabledFields,
        [field]: !prev.enabledFields?.[field]
      }
    }));
  };

  const { user } = useAuth();

  const handleApplyEdits = async () => {
    // 1. Update Global Branding Data
    setUserData({ 
      ...localUserData, 
      business_name: localUserData.business_name || 'Your Name',
      musicId: activeMusicId
    });

    // 2. Save to User History in DB
    try {
      if (user?.accessToken && template?._id) {
        await axios.post(`${API_URL}/user/save-template`, 
          { templateId: template._id },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
      }
    } catch (err) {
      console.error('History update failed:', err);
    }

    onClose();
  };

  const updateLocalField = (field, value) => {
    setLocalUserData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col md:p-0">
      {/* Header */}
      <div className="p-4 md:px-8 flex justify-between items-center bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={onClose}>
              <X size={20} className="text-gray-500" />
           </div>
           <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Studio Editor</h2>
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Refine your design in real-time</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="hidden md:flex px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors border-none" onClick={onClose}>Discard</button>
           <button 
             className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 border-none" 
             onClick={handleApplyEdits}
           >
             <Check size={16} strokeWidth={3} /> Save Design
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#f1f5f9]">
        {/* Left Area: Live Preview (Desktop Only) */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-[#f8fafc] relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
           
           <div className="relative w-full max-w-[500px] aspect-square bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden border-8 border-white group">
              <img src={template.image} className="w-full h-full object-cover" alt="Preview" />
              
              {/* Branding Overlays (Dynamic Preview) */}
              <div className="absolute bottom-0 left-0 right-0 z-[10] pointer-events-none translate-y-0 transition-transform">
                <div className="bg-black/95 flex h-[100px] shadow-2xl border-t border-white/10">
                   <div className="flex-1 flex flex-col justify-center px-8">
                     <div className="text-white text-2xl font-black leading-tight truncate uppercase tracking-wide">
                         {localUserData.business_name || 'Your Business Name'}
                     </div>
                     <div className="flex items-center gap-2 mt-2">
                         <div className="w-7 h-7 bg-[#25D366] rounded-full flex items-center justify-center">
                           <MessageCircle size={16} className="text-white fill-white" />
                         </div>
                         <span className="text-white text-lg font-bold tracking-wider">{localUserData.phone_number || '9876543210'}</span>
                     </div>
                   </div>
                   <div className="relative w-[180px] flex-shrink-0 flex items-center justify-center">
                     <div className="absolute -top-10 right-4 w-[140px] h-[140px] z-30">
                         <div className="w-full h-full p-2 bg-white rounded-full shadow-2xl border-4 border-white flex flex-col items-center justify-center overflow-hidden">
                             {localUserData.userPhoto ? (
                               <img src={localUserData.userPhoto} className="w-full h-full object-cover rounded-full" />
                             ) : (
                               <div className="w-full h-full bg-slate-50 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                                  <User size={60} className="text-slate-200" />
                               </div>
                             )}
                         </div>
                     </div>
                   </div>
                </div>
              </div>
              
              <div className="absolute top-6 right-6 bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Live View</div>
           </div>
        </div>

        {/* Right Area: Sidebar (Mobile view also uses this) */}
        <div className="w-full lg:w-[480px] bg-white lg:border-l lg:border-gray-100 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
          {/* Custom Tabs */}
          <div className="flex border-b border-gray-100 relative shrink-0">
            <button 
              className={`flex-1 py-5 text-[0.85rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-none bg-transparent transition-all ${activeTab === 'text' ? 'text-red-500 bg-red-50/10' : 'text-gray-400'}`}
              onClick={() => setActiveTab('text')}
            >
              <Type size={18} strokeWidth={activeTab === 'text' ? 3 : 2} /> Text
              {activeTab === 'text' && <div className="absolute bottom-0 left-0 w-1/3 h-[4px] bg-red-500 rounded-t-full" />}
            </button>
            <button 
              className={`flex-1 py-5 text-[0.85rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-none bg-transparent transition-all ${activeTab === 'branding' ? 'text-red-500 bg-red-50/10' : 'text-gray-400'}`}
              onClick={() => setActiveTab('branding')}
            >
              <ImageIcon size={18} strokeWidth={activeTab === 'branding' ? 3 : 2} /> Branding
              {activeTab === 'branding' && <div className="absolute bottom-0 left-1/3 w-1/3 h-[4px] bg-red-500 rounded-t-full" />}
            </button>
            <button 
              className={`flex-1 py-5 text-[0.85rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-none bg-transparent transition-all ${activeTab === 'video' ? 'text-red-500 bg-red-50/10' : 'text-gray-400'}`}
              onClick={() => setActiveTab('video')}
            >
              <Video size={18} strokeWidth={activeTab === 'video' ? 3 : 2} /> Effects
              {activeTab === 'video' && <div className="absolute bottom-0 right-0 w-1/3 h-[4px] bg-red-500 rounded-t-full" />}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-6 lg:p-8">
          {activeTab === 'text' && (
            <div className="p-5 flex flex-col gap-6">
              {/* Category Pills */}
              <div className="flex gap-4">
                {['Personal', 'Misc', 'Business'].map(cat => (
                  <button 
                    key={cat} 
                    className={`px-6 py-2 rounded-full text-sm font-bold border-none transition-colors ${cat === 'Personal' ? 'bg-[#1e1e1e] text-white' : 'bg-gray-100 text-[#475569]'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[0.85rem] font-bold text-[#475569]">Name / Business Name</label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter Name"
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 px-4 outline-none focus:border-red-200 focus:bg-white text-[1rem] font-medium text-gray-800 shadow-sm"
                    value={localUserData.business_name || ''}
                    onChange={(e) => updateLocalField('business_name', e.target.value)}
                  />
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[0.85rem] font-bold text-[#475569]">WhatsApp Number</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 px-4 outline-none focus:border-red-200 focus:bg-white text-[1rem] font-medium text-gray-800 shadow-sm"
                      value={localUserData.phone_number || ''}
                      onChange={(e) => updateLocalField('phone_number', e.target.value)}
                      placeholder="e.g. 9876543210"
                    />
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${localUserData.enabledFields?.phone ? 'bg-blue-500 shadow-lg shadow-blue-100' : 'bg-white border-2 border-gray-100'}`}
                      onClick={() => toggleField('phone')}
                    >
                      {localUserData.enabledFields?.phone && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[0.85rem] font-bold text-[#475569]">Website / Instagram</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="www.dealingindia.com"
                      className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 px-4 outline-none focus:border-red-200 focus:bg-white text-[1rem] font-medium text-gray-800 shadow-sm"
                      value={localUserData.website || ''}
                      onChange={(e) => updateLocalField('website', e.target.value)}
                    />
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${localUserData.enabledFields?.website ? 'bg-blue-500 shadow-lg shadow-blue-100' : 'bg-white border-2 border-gray-100'}`}
                      onClick={() => toggleField('website')}
                    >
                      {localUserData.enabledFields?.website && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="p-5 flex flex-col gap-6">
               <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-[#fef3c7] flex items-center justify-center text-[#f59e0b]">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-[0.95rem] font-bold text-[#92400e]">Personal Branding</h3>
                    <p className="text-[0.7rem] text-[#f59e0b] font-medium">Upload your photo and logo for higher impact</p>
                  </div>
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center relative overflow-hidden ring-4 ring-gray-50">
                       {localUserData.userPhoto ? (
                         <img src={localUserData.userPhoto} className="w-full h-full object-cover" alt="p" />
                       ) : (
                         <User size={32} className="text-gray-400" />
                       )}
                    </div>
                    <div>
                       <strong className="block text-[0.95rem] text-gray-800">Your Photo</strong>
                       <p className="text-[0.7rem] text-gray-400 font-medium">{localUserData.userPhoto ? 'Photo ready' : 'Not added yet'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => updateLocalField('userPhoto', ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span className="bg-[#fbbf24] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-100 active:scale-95 transition-transform inline-block">CHANGE</span>
                    </label>
                 </div>
              </div>

              {/* Logo Upload */}
              <div className="flex items-center justify-between py-2">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center relative shadow-sm">
                       {localUserData.logo && <img src={localUserData.logo} className="w-10 h-10 object-contain" alt="l" />}
                       {!localUserData.logo && <Star size={32} className="text-red-400 opacity-20" />}
                    </div>
                    <div>
                       <strong className="block text-[0.95rem] text-gray-800">Business Logo</strong>
                       <p className="text-[0.7rem] text-gray-400 font-medium">{localUserData.logo ? 'Logo active' : 'Professional touch'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => updateLocalField('logo', ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span className="bg-[#fbbf24] text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-100 active:scale-95 transition-transform inline-block">
                        {localUserData.logo ? 'CHANGE' : 'ADD LOGO'}
                      </span>
                    </label>
                 </div>
              </div>
            </div>
          )}
          
          {activeTab === 'video' && (
            <div className="p-5 flex flex-col gap-8 pb-10">
              {/* Music Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[1rem] font-black text-gray-800 flex items-center gap-2">
                    <Music size={20} className="text-pink-500" /> Choose Music
                  </h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                   {musicList.map((m) => (
                     <div 
                        key={m._id} 
                        onClick={() => setActiveMusicId(m._id)}
                        className={`min-w-[140px] p-4 rounded-2xl flex flex-col gap-3 transition-all cursor-pointer ${activeMusicId === m._id ? 'bg-black text-white shadow-2xl scale-105' : 'bg-gray-50 border border-gray-100 text-gray-800'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeMusicId === m._id ? 'bg-white/20' : 'bg-gray-200'}`}>
                           {activeMusicId === m._id ? <PlayCircle size={20} className="text-white fill-white" /> : <Music size={18} className="text-gray-500" />}
                        </div>
                        <div>
                          <span className="text-[0.75rem] font-bold leading-tight block truncate">{m.title}</span>
                          <span className={`text-[0.6rem] font-medium ${activeMusicId === m._id ? 'opacity-60' : 'text-gray-400'}`}>{m.artist || 'Trending'}</span>
                        </div>
                     </div>
                   ))}
                   {musicList.length === 0 && (
                     <div className="text-gray-400 text-sm py-8 text-center w-full">No music tracks available</div>
                   )}
                </div>
              </section>

              {/* Video Effects */}
              <section>
                <div className="flex items-center mb-4">
                  <h3 className="text-[1rem] font-black text-gray-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" /> Video Effects
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: 'Pure', active: true },
                    { name: 'Retro' },
                    { name: 'Particles' },
                    { name: 'Golden' },
                    { name: 'Vintage' },
                    { name: 'Dynamic' },
                    { name: 'Flare' },
                    { name: 'Sparkle' }
                  ].map((e, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${e.active ? 'bg-red-500 shadow-lg shadow-red-100' : 'bg-gray-50'}`}>
                          <Sparkles size={20} className={e.active ? 'text-white' : 'text-gray-300'} />
                       </div>
                       <span className={`text-[0.6rem] font-black ${e.active ? 'text-red-500' : 'text-gray-400'} uppercase tracking-tighter`}>{e.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
        {/* Footer Actions */}
        <div 
          className="p-4 px-6 border-t border-gray-100 bg-white flex items-center justify-between gap-6"
          style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
        >
           <button className="bg-transparent text-gray-400 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform border-none" onClick={onClose}>
             Discard
           </button>
           <button 
            className="flex-1 max-w-[200px] bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 active:scale-[0.98] transition-all border-none uppercase tracking-widest text-xs"
            onClick={handleApplyEdits}
           >
             Apply Edits
           </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default PosterEditor;
