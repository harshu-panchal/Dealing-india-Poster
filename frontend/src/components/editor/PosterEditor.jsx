import React, { useState } from 'react';
import { 
  Type, X, Check, ImageIcon as ImageIcon, 
  User, Star, Smile, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';

const PosterEditor = ({ template, onClose }) => {
  const { userData, setUserData } = useEditor();
  const [activeTab, setActiveTab] = useState('branding');
  
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
            className={`flex-1 py-4 text-[1rem] font-bold flex items-center justify-center gap-2 border-none bg-transparent transition-colors ${activeTab === 'text' ? 'text-red-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('text')}
          >
            <Type size={20} /> Text
            {activeTab === 'text' && <div className="absolute bottom-0 left-0 w-1/2 h-[3px] bg-red-500 rounded-t-full" />}
          </button>
          <button 
            className={`flex-1 py-4 text-[1rem] font-bold flex items-center justify-center gap-2 border-none bg-transparent transition-colors ${activeTab === 'branding' ? 'text-red-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('branding')}
          >
            <ImageIcon size={20} /> Photo / Logo
            {activeTab === 'branding' && <div className="absolute bottom-0 right-0 w-1/2 h-[3px] bg-red-500 rounded-t-full" />}
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
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-gray-100 bg-white flex items-center justify-between gap-6 pb-10">
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
