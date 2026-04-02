import React, { useState } from 'react';
import { 
  Type, X, Check, ImageIcon as ImageIcon, 
  User, Star, Smile, Plus, Video, Music, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';

const PosterEditor = ({ template, onClose }) => {
  const { userData, setUserData, initialEditorTab } = useEditor();
  const [activeTab, setActiveTab] = useState(initialEditorTab || 'branding');
  
  // Local state for edits before "Okay"
  const [localUserData, setLocalUserData] = useState({...userData});

  const toggleField = (field) => {
    setLocalUserData(prev => ({
      ...prev,
      enabledFields: {
        ...prev.enabledFields,
        [field]: !prev.enabledFields?.[field]
      }
    }));
  };

  const handleApplyEdits = () => {
    setUserData({ ...localUserData, business_name: localUserData.business_name || 'Sheetal' });
    onClose();
  };

  const updateLocalField = (field, value) => {
    setLocalUserData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[3000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] flex flex-col h-[95vh] overflow-hidden"
        initial={{ y: '101%' }}
        animate={{ y: 0 }}
        exit={{ y: '101%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="p-4 px-5 flex justify-between items-center bg-white border-b border-gray-100">
          <X className="cursor-pointer text-gray-500" onClick={onClose} />
          <h2 className="text-lg font-bold text-gray-800">Edit Poster</h2>
          <Check className="cursor-pointer text-red-500 font-bold" onClick={handleApplyEdits} />
        </div>

        {/* Custom Tabs */}
        <div className="flex border-b border-gray-100 relative">
          <button 
            className={`flex-1 py-4 text-[0.9rem] font-bold flex items-center justify-center gap-2 border-none bg-transparent transition-colors ${activeTab === 'text' ? 'text-red-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('text')}
          >
            <Type size={18} /> Text
            {activeTab === 'text' && <div className="absolute bottom-0 left-0 w-1/3 h-[3px] bg-red-500 rounded-t-full" />}
          </button>
          <button 
            className={`flex-1 py-4 text-[0.9rem] font-bold flex items-center justify-center gap-2 border-none bg-transparent transition-colors ${activeTab === 'branding' ? 'text-red-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('branding')}
          >
            <ImageIcon size={18} /> Photo
            {activeTab === 'branding' && <div className="absolute bottom-0 left-1/3 w-1/3 h-[3px] bg-red-500 rounded-t-full" />}
          </button>
          <button 
            className={`flex-1 py-4 text-[0.9rem] font-bold flex items-center justify-center gap-2 border-none bg-transparent transition-colors ${activeTab === 'video' ? 'text-red-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('video')}
          >
            <Video size={18} /> Video
            {activeTab === 'video' && <div className="absolute bottom-0 right-0 w-1/3 h-[3px] bg-red-500 rounded-t-full" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
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

              {/* Add Extra Text Block */}
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-[#dbeafe] flex items-center justify-center text-[#3b82f6]">
                    <Type size={24} />
                  </div>
                  <div>
                    <h3 className="text-[0.95rem] font-bold text-[#1e3a8a]">Add Extra Text</h3>
                    <p className="text-[0.7rem] text-[#60a5fa] font-medium">You can add up to 5 texts</p>
                  </div>
                </div>
                <button className="bg-[#3b82f6] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform border-none">
                  Add Text
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[0.85rem] font-bold text-[#475569]">Mobile</label>
                    <span className="text-[0.65rem] font-bold text-[#94a3b8]">{localUserData.phone_number?.length || 0} / 500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 px-4 outline-none focus:border-red-200 focus:bg-white text-[1rem] font-medium text-gray-800 shadow-sm"
                      value={localUserData.phone_number || ''}
                      onChange={(e) => updateLocalField('phone_number', e.target.value)}
                    />
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${localUserData.enabledFields?.phone ? 'bg-blue-500' : 'bg-white border-2 border-gray-200'}`}
                      onClick={() => toggleField('phone')}
                    >
                      {localUserData.enabledFields?.phone && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[0.85rem] font-bold text-[#475569]">Website</label>
                    <span className="text-[0.65rem] font-bold text-[#94a3b8]">{localUserData.website?.length || 0} / 500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Your Website"
                      className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 px-4 outline-none focus:border-red-200 focus:bg-white text-[1rem] font-medium text-gray-800 shadow-sm"
                      value={localUserData.website || ''}
                      onChange={(e) => updateLocalField('website', e.target.value)}
                    />
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${localUserData.enabledFields?.website ? 'bg-blue-500' : 'bg-white border-2 border-gray-200'}`}
                      onClick={() => toggleField('website')}
                    >
                      {localUserData.enabledFields?.website && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5 px-1">
                    <label className="text-[0.85rem] font-bold text-[#475569]">Email</label>
                    <span className="text-[0.65rem] font-bold text-[#94a3b8]">{localUserData.email?.length || 0} / 500</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Your Email"
                      className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-3.5 px-4 outline-none focus:border-red-200 focus:bg-white text-[1rem] font-medium text-gray-800 shadow-sm"
                      value={localUserData.email || ''}
                      onChange={(e) => updateLocalField('email', e.target.value)}
                    />
                    <div 
                      className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-all ${localUserData.enabledFields?.email ? 'bg-blue-500' : 'bg-white border-2 border-gray-200'}`}
                      onClick={() => toggleField('email')}
                    >
                      {localUserData.enabledFields?.email && <Check size={14} className="text-white" />}
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
                    <h3 className="text-[0.95rem] font-bold text-[#92400e]">Add Extra Photos</h3>
                    <p className="text-[0.7rem] text-[#f59e0b] font-medium">You can add up to 5 photos</p>
                  </div>
                </div>
                <button className="bg-[#f59e0b] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md active:scale-95 transition-transform border-none">
                  Add Photo
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center relative overflow-hidden">
                       <User size={32} className="text-gray-400" />
                       <div className="absolute bottom-0 w-full bg-white/90 text-[5px] font-black text-center py-0.5">YOUR PHOTO HERE</div>
                    </div>
                    <div>
                       <strong className="block text-[0.95rem] text-gray-800">Profile Photo</strong>
                       <p className="text-[0.7rem] text-gray-400 font-medium">Place it anywhere on the screen</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="bg-[#fbbf24] text-white px-4 py-1.5 rounded-full text-xs font-bold border-none active:scale-95 transition-transform">Change</button>
                    <div className="w-5 h-5 rounded flex items-center justify-center bg-blue-500"><Check size={12} className="text-white" /></div>
                 </div>
              </div>

              <div className="flex items-center justify-between py-2">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                       <Star size={32} className="text-red-400" />
                    </div>
                    <div>
                       <strong className="block text-[0.95rem] text-gray-800">Logo</strong>
                       <p className="text-[0.7rem] text-gray-400 font-medium">Place it anywhere on the screen</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="bg-[#fbbf24] text-white px-4 py-1.5 rounded-full text-xs font-bold border-none active:scale-95 transition-transform">Add</button>
                    <div className="w-5 h-5 rounded border-2 border-gray-200"></div>
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
                  <span className="text-[0.7rem] font-bold text-red-500 uppercase tracking-widest cursor-pointer">View All</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                   {[
                     { name: 'Upbeat Corporate', duration: '0:45', active: true },
                     { name: 'Inspirational Morning', duration: '1:12' },
                     { name: 'Modern Tech Beats', duration: '0:38' }
                   ].map((m, i) => (
                     <div key={i} className={`min-w-[124px] p-3 rounded-2xl flex flex-col gap-2 transition-all ${m.active ? 'bg-black text-white shadow-lg' : 'bg-gray-50 border border-gray-100 text-gray-800'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.active ? 'bg-white/20' : 'bg-gray-200'}`}>
                           <Music size={14} className={m.active ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <span className="text-[0.7rem] font-bold leading-tight line-clamp-1">{m.name}</span>
                        <span className={`text-[0.55rem] font-medium ${m.active ? 'opacity-60' : 'text-gray-400'}`}>{m.duration}</span>
                     </div>
                   ))}
                </div>
              </section>

              {/* Video Effects */}
              <section>
                <div className="flex items-center mb-4">
                  <h3 className="text-[1rem] font-black text-gray-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-amber-500" /> Video Effects
                  </h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'None', active: true },
                    { name: 'Film Rim' },
                    { name: 'Particles' },
                    { name: 'Glow' },
                    { name: 'Sepia' },
                    { name: 'BW' },
                    { name: 'Flares' },
                    { name: 'Magic' }
                  ].map((e, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${e.active ? 'ring-2 ring-red-500 ring-offset-2 bg-gray-50' : 'bg-gray-100 opacity-60'}`}>
                          <Sparkles size={20} className={e.active ? 'text-red-500' : 'text-gray-400'} />
                       </div>
                       <span className={`text-[0.6rem] font-bold ${e.active ? 'text-red-500' : 'text-gray-400'}`}>{e.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Subtitles / Captions */}
              <section>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[1rem] font-black text-gray-800 flex items-center gap-2">
                      <Type size={20} className="text-blue-500" /> Video Subtitles
                   </h3>
                   <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full px-2">
                      <div className="w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center">
                         <Check size={10} className="text-white" />
                      </div>
                      <span className="text-[0.6rem] font-bold text-gray-600">Auto Captions ON</span>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                         <span className="text-[0.7rem] font-bold text-gray-400 block mb-1">CAPTION STYLE</span>
                         <span className="text-[0.85rem] font-bold text-gray-800">Dynamic Pop (Center)</span>
                      </div>
                      <button className="text-[0.7rem] font-black text-red-500 bg-white px-4 py-1.5 rounded-full shadow-sm">Change</button>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                         <span className="text-[0.7rem] font-bold text-gray-400 block mb-1">LANGUAGE</span>
                         <span className="text-[0.85rem] font-bold text-gray-800">Hindi + English (Mix)</span>
                      </div>
                      <button className="text-[0.7rem] font-black text-red-500 bg-white px-4 py-1.5 rounded-full shadow-sm">Change</button>
                   </div>
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
           <button className="bg-transparent text-red-500 font-bold text-lg active:scale-95 transition-transform border-none" onClick={onClose}>
             Cancel
           </button>
           <button 
            className="flex-1 max-w-[200px] bg-red-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-100 active:scale-[0.98] transition-all border-none"
            onClick={handleApplyEdits}
           >
             Save
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PosterEditor;
