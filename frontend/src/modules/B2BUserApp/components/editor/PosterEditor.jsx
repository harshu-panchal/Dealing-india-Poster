import React, { useState, useEffect, useRef } from 'react';
import { 
  Type, X, Check, ImageIcon as ImageIcon, Layers,
  User, Star, Smile, Plus, Video, Music, Sparkles, PlayCircle, MessageCircle, Globe as GlobeIcon,
  Mail, MapPin, Hash, PlusCircle, Trash2, Palette, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const PosterEditor = ({ template, onClose }) => {
  const { userData, setUserData, initialEditorTab, frames, selectedFrame, setSelectedFrame, syncSavedEditsToDetail } = useEditor();
  const [activeTab, setActiveTab] = useState(initialEditorTab || 'text');
  const tabs = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'branding', icon: Sparkles, label: 'Logo' },
    { id: 'frames', icon: Layers, label: 'Frames' }
  ];
  const [subTab, setSubTab] = useState('Personal');
  const [musicList, setMusicList] = useState([]);
  const [activeMusicId, setActiveMusicId] = useState(userData.musicId || null);
  
  const currentTemplate = template.templateId && typeof template.templateId === 'object' ? template.templateId : template;
  const normalizeFrameValue = (frame) => {
    if (!frame) return null;
    if (typeof frame === 'string') return frame;
    if (typeof frame === 'object') return frame.image || frame.url || null;
    return null;
  };
  
  // Local state for edits - initialized from saved customData if available
  const [localUserData, setLocalUserData] = useState(() => {
    const savedData = template.customData || userData;
    return {
      business_name: savedData.business_name || '',
      phone_number: savedData.phone_number || '',
      website: savedData.website || '',
      email: savedData.email || '',
      address: savedData.address || '',
      gst_number: savedData.gst_number || '',
      extraTexts: savedData.extraTexts || [],
      extraPhotos: savedData.extraPhotos || [],
      stickers: savedData.stickers || [],
      ...savedData,
      enabledFields: {
        ...userData.enabledFields,
        ...(savedData.enabledFields || {}),
        logo: template.customData?.enabledFields?.logo === true // Default to false unless explicitly saved as true for this template
      }
    };
  });
  const effectiveSelectedFrame = normalizeFrameValue(selectedFrame) || normalizeFrameValue(localUserData.selectedFrame);

  useEffect(() => {
    const fromTemplate = normalizeFrameValue(template?.customData?.selectedFrame);
    if (fromTemplate) {
      setSelectedFrame(fromTemplate);
    }
  }, [template, setSelectedFrame]);

  const [showStickerModal, setShowStickerModal] = useState(false);
  const previewBoundsRef = useRef(null);
  const brandingBarRef = useRef(null);

  // Handlers
  const addExtraText = () => {
    if ((localUserData.extraTexts?.length || 0) >= 5) return;
    const newText = { id: Date.now(), text: 'New Text', color: '#ffffff', size: 20, x: 0, y: 0 };
    setLocalUserData(prev => ({ ...prev, extraTexts: [...(prev.extraTexts || []), newText] }));
  };

  const updateExtraText = (id, updates) => {
    setLocalUserData(prev => ({
      ...prev,
      extraTexts: prev.extraTexts.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const removeExtraText = (id) => {
    setLocalUserData(prev => ({ ...prev, extraTexts: prev.extraTexts.filter(t => t.id !== id) }));
  };

  const addExtraPhoto = (url) => {
    if ((localUserData.extraPhotos?.length || 0) >= 5) return;
    const newPhoto = { id: Date.now(), url, x: 0, y: 0, size: 100 };
    setLocalUserData(prev => ({ ...prev, extraPhotos: [...(prev.extraPhotos || []), newPhoto] }));
  };

  const addSticker = (url) => {
    const newSticker = { id: Date.now(), url, x: 0, y: 0, size: 80 };
    setLocalUserData(prev => ({ ...prev, stickers: [...(prev.stickers || []), newSticker] }));
    setShowStickerModal(false);
  };

  const updateDraggable = (type, id, updates) => {
    setLocalUserData(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const removeItem = (type, id) => {
    setLocalUserData(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
  const hasFrameApplied = !!effectiveSelectedFrame;

  // Find the full frame object to get text styles
  const activeFrameObj = frames.find(f => normalizeFrameValue(f) === effectiveSelectedFrame);
  const frameStyle = activeFrameObj?.textStyle || {};

  const getStyle = (type) => {
    const isName = type === 'name';
    return {
      color: frameStyle.color || '#ffffff',
      fontSize: isName ? (frameStyle.nameSize || (hasFrameApplied ? '0.65rem' : '0.75rem')) : (frameStyle.detailSize || (hasFrameApplied ? '0.45rem' : '0.5rem')),
      fontWeight: frameStyle.fontWeight || (isName ? '900' : '700'),
      textShadow: frameStyle.textShadow || '0 2px 4px rgba(0,0,0,0.8)',
      textTransform: frameStyle.textTransform || 'uppercase',
      letterSpacing: frameStyle.letterSpacing === 'tight' ? '-0.02em' : frameStyle.letterSpacing === 'wide' ? '0.05em' : frameStyle.letterSpacing === 'widest' ? '0.1em' : 'normal',
      whiteSpace: 'nowrap'
    };
  };

  const nameFontClass = ''; // Managed via inline style now
  const detailFontClass = ''; // Managed via inline style now
  
  // Frame-defined per-field positions (admin set via drag)
  const framePos = frameStyle.positions || {};

  // New poster-relative defaults — frame positions take priority
  const nameDefault      = { x: framePos.name?.x      || '5%', y: framePos.name?.y      || (hasFrameApplied ? '82%' : '80%') };
  const phoneDefault     = { x: framePos.phone?.x     || '5%', y: framePos.phone?.y     || (hasFrameApplied ? '86%' : '85%') };
  const websiteDefault   = { x: framePos.website?.x   || '5%', y: framePos.website?.y   || (hasFrameApplied ? '88%' : '88%') };
  const emailDefault     = { x: framePos.email?.x     || '5%', y: framePos.email?.y     || (hasFrameApplied ? '90%' : '91%') };
  const addressDefault   = { x: framePos.address?.x   || '5%', y: framePos.address?.y   || (hasFrameApplied ? '92%' : '94%') };
  const gstDefault       = { x: framePos.gst?.x       || '5%', y: framePos.gst?.y       || (hasFrameApplied ? '94%' : '97%') };
  const userPhotoDefault = { x: framePos.userPhoto?.x || '70%', y: framePos.userPhoto?.y || (hasFrameApplied ? '74%' : '70%') };
  const logoDefault      = { x: framePos.logo?.x      || '10%', y: framePos.logo?.y      || (hasFrameApplied ? '80%' : '75%') };

  // Migration helper for old pixel-based data
  const migratePos = (val, defaultVal) => {
    if (!val) return defaultVal;
    if (typeof val === 'object') {
       const x = (!val.x || (typeof val.x === 'string' && !val.x.endsWith('%'))) ? '5%' : val.x;
       const y = (!val.y || (typeof val.y === 'string' && !val.y.endsWith('%'))) ? defaultVal : val.y;
       return { x, y };
    }
    return val;
  };

  const effectiveNamePos    = migratePos(localUserData.namePos,    nameDefault);
  const effectivePhonePos   = migratePos(localUserData.phonePos,   phoneDefault);
  const effectiveWebsitePos = migratePos(localUserData.websitePos, websiteDefault);
  const effectiveEmailPos   = migratePos(localUserData.emailPos,   emailDefault);
  const effectiveAddressPos = migratePos(localUserData.addressPos, addressDefault);
  const effectiveGstPos     = migratePos(localUserData.gstPos,     gstDefault);

  const toPx = (value, axis = 'x', customRef = null) => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (trimmed.endsWith('%')) {
      const percent = parseFloat(trimmed);
      const targetRef = customRef || previewBoundsRef;
      const bounds = targetRef.current?.getBoundingClientRect();
      const base = axis === 'x' ? bounds?.width || 0 : bounds?.height || 0;
      return (Number.isNaN(percent) ? 0 : percent) * base / 100;
    }

    const numeric = parseFloat(trimmed);
    return Number.isNaN(numeric) ? 0 : numeric;
  };

  const getNextPosition = (event, info, currentPos = {}, fallback = {}, isBranding = false) => {
    const mainBounds = previewBoundsRef.current?.getBoundingClientRect();
    const parentRef = isBranding ? brandingBarRef : previewBoundsRef;
    const parentBounds = parentRef.current?.getBoundingClientRect();
    const el = event.currentTarget;

    if (!mainBounds || !parentBounds || !el) return { x: '0px', y: '0px' };

    const startX = toPx(currentPos.x ?? fallback.x ?? '0%', 'x', parentRef);
    const startY = toPx(currentPos.y ?? fallback.y ?? '0%', 'y', parentRef);

    // Calculate next positions relative to parent
    const nextX = startX + info.offset.x;
    const nextY = startY + info.offset.y;

    // Convert back to percentages relative to parent
    const xPercent = parentBounds.width > 0 ? (nextX / parentBounds.width) * 100 : 0;
    const yPercent = parentBounds.height > 0 ? (nextY / parentBounds.height) * 100 : 0;

    return {
      x: `${xPercent.toFixed(2)}%`,
      y: `${yPercent.toFixed(2)}%`
    };
  };

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
      enabledFields: { ...prev.enabledFields, [field]: !prev.enabledFields?.[field] }
    }));
  };

  const { user } = useAuth();

  const handleApplyEdits = async () => {
    const savedCustomData = {
      ...localUserData,
      business_name: localUserData.business_name || 'Your Name',
      musicId: activeMusicId,
      selectedFrame: effectiveSelectedFrame
    };

    setUserData(savedCustomData);
    syncSavedEditsToDetail(template, savedCustomData);

    try {
      if (user?.accessToken && currentTemplate?._id) {
        await axios.post(`${API_URL}/user/save-template`, 
          { 
            templateId: currentTemplate._id,
            customData: savedCustomData
          },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
      }
    } catch (err) { console.error('History update failed:', err); }
    onClose();
  };

  const updateLocalField = (field, value) => setLocalUserData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-[3000] bg-white flex flex-col md:p-0">
      {/* Premium Header */}
      <div className="p-4 md:px-8 flex justify-between items-center bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={onClose}>
              <X size={20} className="text-gray-500" />
           </div>
           <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">Edit Poster</h2>
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
        {/* Preview Area with Dot Grid */}
        <div className="flex h-[40%] lg:h-auto lg:flex-1 items-center justify-center p-4 lg:p-12 bg-[#f8fafc] relative overflow-hidden shrink-0 lg:shrink">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
           
           <div ref={previewBoundsRef} className="relative w-full max-w-[300px] lg:max-w-[500px] aspect-square bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] lg:shadow-[0_40px_100px_rgba(0,0,0,0.1)] rounded-xl lg:rounded-2xl overflow-hidden border-4 lg:border-8 border-white group">
               {/* Poster Background */}
               <img src={currentTemplate.image} className="w-full h-full object-cover relative z-[1]" alt="Preview" crossOrigin="anonymous" />
               
               {/* Frame Layer (Middle) */}
               {effectiveSelectedFrame && (
                 <img 
                   src={effectiveSelectedFrame} 
                   className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]" 
                   alt="Frame Overlay"
                   crossOrigin="anonymous"
                 />
               )}

               {/* Dedicated Text & Content Layer (Top) */}
               <div className="text-layer absolute inset-0 z-[75]">
                   {/* Branding Items - Now directly in text-layer, relative to whole poster */}
                   {localUserData.enabledFields?.business_name !== false && (
                     <motion.div 
                       drag
                       dragMomentum={false}
                       dragConstraints={previewBoundsRef}
                       onDragEnd={(e, info) => updateLocalField('namePos', getNextPosition(e, info, effectiveNamePos, { x: '5%', y: nameDefaultY }))}
                       className="inline-block pointer-events-auto absolute cursor-move touch-none"
                       style={{ 
                         left: effectiveNamePos.x,
                         top: effectiveNamePos.y,
                         zIndex: 95
                       }}
                     >
                        <div 
                          className="whitespace-nowrap leading-tight" 
                          style={{ 
                            ...getStyle('name')
                          }}
                        >
                            {localUserData.business_name || 'Your Business Name'}
                        </div>
                     </motion.div>
                   )}

                   <div className="flex flex-col relative h-full pointer-events-none">
                      {localUserData.enabledFields?.phone && (
                        <motion.div 
                          drag
                          dragMomentum={false}
                          dragConstraints={previewBoundsRef}
                          onDragEnd={(e, info) => updateLocalField('phonePos', getNextPosition(e, info, effectivePhonePos, { x: '5%', y: phoneDefaultY }))}
                          className="pointer-events-auto absolute cursor-move touch-none"
                          style={{ 
                            left: effectivePhonePos.x,
                            top: effectivePhonePos.y,
                            zIndex: 95
                          }}
                        >
                          <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                            {localUserData.phone_number || '9876543210'}
                          </div>
                        </motion.div>
                      )}
                      {localUserData.enabledFields?.website && localUserData.website && (
                        <motion.div 
                          drag
                          dragMomentum={false}
                          dragConstraints={previewBoundsRef}
                          onDragEnd={(e, info) => updateLocalField('websitePos', getNextPosition(e, info, effectiveWebsitePos, { x: '5%', y: websiteDefaultY }))}
                          className="pointer-events-auto absolute cursor-move touch-none"
                          style={{ 
                            left: effectiveWebsitePos.x,
                            top: effectiveWebsitePos.y,
                            zIndex: 95
                          }}
                        >
                          <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                            {localUserData.website}
                          </div>
                        </motion.div>
                      )}
                      {localUserData.enabledFields?.email && localUserData.email && (
                        <motion.div 
                          drag
                          dragMomentum={false}
                          dragConstraints={previewBoundsRef}
                          onDragEnd={(e, info) => updateLocalField('emailPos', getNextPosition(e, info, effectiveEmailPos, { x: '5%', y: emailDefaultY }))}
                          className="pointer-events-auto absolute cursor-move touch-none"
                          style={{ 
                            left: effectiveEmailPos.x,
                            top: effectiveEmailPos.y,
                            zIndex: 95
                          }}
                        >
                          <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                            {localUserData.email}
                          </div>
                        </motion.div>
                      )}
                      {localUserData.enabledFields?.address && localUserData.address && (
                        <motion.div 
                          drag
                          dragMomentum={false}
                          dragConstraints={previewBoundsRef}
                          onDragEnd={(e, info) => updateLocalField('addressPos', getNextPosition(e, info, effectiveAddressPos, { x: '5%', y: addressDefaultY }))}
                          className="pointer-events-auto absolute cursor-move touch-none"
                          style={{ 
                            left: effectiveAddressPos.x,
                            top: effectiveAddressPos.y,
                            zIndex: 95
                          }}
                        >
                          <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                            {localUserData.address}
                          </div>
                        </motion.div>
                      )}
                      {(localUserData.enabledFields?.gst || (localUserData.gst_number || '').trim()) && (
                        <motion.div 
                          drag
                          dragMomentum={false}
                          dragConstraints={previewBoundsRef}
                          onDragEnd={(e, info) => updateLocalField('gstPos', getNextPosition(e, info, effectiveGstPos, { x: '5%', y: gstDefaultY }))}
                          className="pointer-events-auto absolute cursor-move touch-none"
                          style={{ 
                            left: effectiveGstPos.x,
                            top: effectiveGstPos.y,
                            zIndex: 95
                          }}
                        >
                          <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                            {localUserData.gst_number}
                          </div>
                        </motion.div>
                      )}
                   </div>

                   {/* Branding Bar Visual Reference Only */}
                   <div ref={brandingBarRef} className="absolute bottom-0 left-0 right-0 h-[50px] lg:h-[100px] flex items-center px-4 lg:px-8 pointer-events-none group-hover:bg-black/5 transition-colors">
                   </div>

                  {/* Extra Custom Texts */}
                  {localUserData.extraTexts?.map(t => (
                    <motion.div key={t.id} drag dragMomentum={false} dragConstraints={previewBoundsRef} onDragEnd={(e, info) => updateExtraText(t.id, getNextPosition(e, info, { x: t.x, y: t.y }, { x: '40%', y: '40%' }))} className="absolute cursor-move select-none p-1 pointer-events-auto touch-none" style={{ left: t.x || '40%', top: t.y || '40%', color: t.color, fontSize: `${t.size}px`, fontWeight: 'black', textShadow: '0 2px 6px rgba(0,0,0,0.8)', zIndex: 90 }}>
                      {t.text}
                    </motion.div>
                  ))}
               </div>

               {/* Non-Text Interactive Overlays (Stickers, Photos) */}
               <div className="absolute inset-0 z-[80] pointer-events-none">
                 {localUserData.enabledFields?.userPhoto && (
                   <motion.div drag dragMomentum={false} dragConstraints={previewBoundsRef} onDragEnd={(e, info) => updateLocalField('userPhotoPos', getNextPosition(e, info, localUserData.userPhotoPos, userPhotoDefault))} className="absolute cursor-move pointer-events-auto touch-none" style={{ left: localUserData.userPhotoPos?.x || userPhotoDefault.x, top: localUserData.userPhotoPos?.y || userPhotoDefault.y, width: hasFrameApplied ? 62 : 80, height: hasFrameApplied ? 62 : 80, zIndex: 85 }}>
                     <div className="w-full h-full p-1 bg-white rounded-full shadow-2xl border-2 border-white overflow-hidden relative"><img src={localUserData.userPhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className="w-full h-full object-cover rounded-full" crossOrigin="anonymous" /></div>
                   </motion.div>
                 )}
                 {localUserData.enabledFields?.logo && localUserData.logo && (
                   <motion.div drag dragMomentum={false} dragConstraints={previewBoundsRef} onDragEnd={(e, info) => updateLocalField('logoPos', getNextPosition(e, info, localUserData.logoPos, logoDefault))} className="absolute cursor-move pointer-events-auto touch-none" style={{ left: localUserData.logoPos?.x || logoDefault.x, top: localUserData.logoPos?.y || logoDefault.y, width: hasFrameApplied ? 44 : 60, height: hasFrameApplied ? 44 : 60, zIndex: 85 }}>
                     <div className="w-full h-full p-2 bg-white rounded-xl shadow-xl border border-white overflow-hidden"><img src={localUserData.logo} className="w-full h-full object-contain" crossOrigin="anonymous" /></div>
                   </motion.div>
                 )}
                 {localUserData.extraPhotos?.map(p => (
                   <motion.div key={p.id} drag dragMomentum={false} dragConstraints={previewBoundsRef} onDragEnd={(e, info) => updateDraggable('extraPhotos', p.id, getNextPosition(e, info, { x: p.x, y: p.y }, { x: '50%', y: '30%' }))} className="absolute cursor-move group pointer-events-auto touch-none" style={{ left: p.x || '50%', top: p.y || '30%', width: p.size, height: p.size, zIndex: 82 }}>
                     <div className="relative w-full h-full">
                       <img src={p.url} className="w-full h-full object-cover rounded-lg shadow-xl border-2 border-white" />
                       <button
                         onClick={(e) => { e.stopPropagation(); removeItem('extraPhotos', p.id); }}
                         className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-none cursor-pointer"
                       >
                         <Trash2 size={12} />
                       </button>
                     </div>
                   </motion.div>
                 ))}
                 {localUserData.stickers?.map(s => (
                   <motion.div key={s.id} drag dragMomentum={false} dragConstraints={previewBoundsRef} onDragEnd={(e, info) => updateDraggable('stickers', s.id, getNextPosition(e, info, { x: s.x, y: s.y }, { x: '20%', y: '20%' }))} className="absolute cursor-move pointer-events-auto touch-none" style={{ left: s.x || '20%', top: s.y || '20%', width: s.size, height: s.size, zIndex: 80 }}>
                     <div className="relative w-full h-full">
                       <img src={s.url} className="w-full h-full object-contain" />
                       <button
                         onClick={(e) => { e.stopPropagation(); removeItem('stickers', s.id); }}
                         className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg border-none cursor-pointer"
                       >
                         <Trash2 size={12} />
                       </button>
                     </div>
                   </motion.div>
                 ))}
               </div>

               {/* Branding Bar Visuals (Bottom Layer if no frame) */}
               {!selectedFrame && (
                 <div className="absolute bottom-0 left-0 right-0 z-[10] pointer-events-none">
                   <div 
                     className="flex h-[50px] lg:h-[100px] shadow-2xl border-t border-white/10"
                     style={{ backgroundColor: '#0a0a0a' }}
                   >
                      <div className="flex-1" />
                      <div className="relative w-[80px] lg:w-[180px] flex-shrink-0" />
                   </div>
                 </div>
               )}
            </div>
        </div>

        {/* Premium Sidebar */}
        <div className="flex-1 lg:w-[480px] bg-white lg:border-l lg:border-gray-100 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Custom Aesthetic Tabs */}
          <div className="flex border-b border-gray-100 relative shrink-0">
            {tabs.map((tab, idx) => (
              <button 
                key={tab.id}
                className={`flex-1 py-5 text-[0.85rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-none bg-transparent transition-all ${activeTab === tab.id ? 'text-red-500 bg-red-50/10' : 'text-gray-400'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 3 : 2} /> {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 h-[4px] bg-red-500 rounded-t-full" style={{ width: '33.33%', left: `${idx * 33.33}%` }} />}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {activeTab === 'text' && (
              <div className="flex flex-col">
                <div className="p-6 pb-2">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><PlusCircle size={24} /></div>
                      <div>
                        <h3 className="text-[0.95rem] font-bold text-blue-900 leading-none mb-1">Add Extra Text</h3>
                        <p className="text-[0.7rem] text-blue-400 font-medium">Add custom text elements</p>
                      </div>
                    </div>
                    <button onClick={addExtraText} disabled={(localUserData.extraTexts?.length || 0) >= 5} className="bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg disabled:opacity-50 border-none">Add Text</button>
                  </div>
                  {localUserData.extraTexts?.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {localUserData.extraTexts.map((t, idx) => (
                        <div key={t.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3">
                          <input type="text" className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-gray-700" value={t.text} onChange={(e) => updateExtraText(t.id, { text: e.target.value })} />
                          <input type="color" className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent" value={t.color} onChange={(e) => updateExtraText(t.id, { color: e.target.value })} />
                          <button onClick={() => removeExtraText(t.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 border-none flex items-center justify-center"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {['Personal', 'Misc', 'Business'].map(cat => (
                    <button key={cat} onClick={() => setSubTab(cat)} className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border-none transition-all ${subTab === cat ? 'bg-black text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400'}`}>{cat}</button>
                  ))}
                </div>

                <div className="px-6 pb-12 space-y-6">
                  {subTab === 'Personal' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Name / Business Name</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" value={localUserData.business_name || ''} onChange={e => updateLocalField('business_name', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.business_name !== false ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('business_name')}>{localUserData.enabledFields?.business_name !== false && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Mobile Number</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" value={localUserData.phone_number || ''} onChange={e => updateLocalField('phone_number', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.phone ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('phone')}>{localUserData.enabledFields?.phone && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Website</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" value={localUserData.website || ''} onChange={e => updateLocalField('website', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.website ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('website')}>{localUserData.enabledFields?.website && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Email ID</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" value={localUserData.email || ''} onChange={e => updateLocalField('email', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.email ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('email')}>{localUserData.enabledFields?.email && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {subTab === 'Business' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Business Address</label>
                        <div className="flex items-center gap-3">
                          <textarea rows={3} className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700 resize-none" value={localUserData.address || ''} onChange={e => updateLocalField('address', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.address ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('address')}>{localUserData.enabledFields?.address && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">GST Number</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700 uppercase"
                            value={localUserData.gst_number || ''}
                            onChange={e => {
                              const value = e.target.value;
                              setLocalUserData(prev => ({
                                ...prev,
                                gst_number: value,
                                enabledFields: {
                                  ...prev.enabledFields,
                                  gst: value.trim().length > 0 ? true : prev.enabledFields?.gst
                                }
                              }));
                            }}
                          />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.gst ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('gst')}>{localUserData.enabledFields?.gst && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="p-6 flex flex-col gap-6">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm"><ImageIcon size={24} /></div>
                    <div>
                      <h3 className="text-[0.95rem] font-bold text-amber-900 leading-none mb-1">Add Extra Photos</h3>
                      <p className="text-[0.7rem] text-amber-400 font-medium">Add custom images</p>
                    </div>
                  </div>
                  <label className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg cursor-pointer">
                    Add Photo
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => addExtraPhoto(ev.target.result); reader.readAsDataURL(file); } }} />
                  </label>
                </div>
                {/* Profile Photo & Logo Controls */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full border-2 border-gray-100 flex items-center justify-center overflow-hidden">
                      {localUserData.userPhoto ? <img src={localUserData.userPhoto} className="w-full h-full object-cover" /> : <User size={32} className="text-gray-200" />}
                    </div>
                    <div>
                      <h4 className="text-[0.9rem] font-bold text-gray-800">Profile Photo</h4>
                      <label className="mt-2 inline-block bg-amber-50 text-amber-600 px-4 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest cursor-pointer">
                        Change
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => updateLocalField('userPhoto', ev.target.result); reader.readAsDataURL(file); } }} />
                      </label>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.userPhoto ? 'bg-blue-500 shadow-lg' : 'bg-gray-50'}`} onClick={() => toggleField('userPhoto')}>{localUserData.enabledFields?.userPhoto && <Check size={16} className="text-white" />}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden p-2">
                      {localUserData.logo ? <img src={localUserData.logo} className="w-full h-full object-contain" /> : <Star size={32} className="text-gray-100" />}
                    </div>
                    <div>
                      <h4 className="text-[0.9rem] font-bold text-gray-800">Logo</h4>
                      <label className="mt-2 inline-block bg-amber-50 text-amber-600 px-4 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest cursor-pointer">
                        {localUserData.logo ? 'Change' : 'Add'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => updateLocalField('logo', ev.target.result); reader.readAsDataURL(file); } }} />
                      </label>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.logo ? 'bg-blue-500 shadow-lg' : 'bg-gray-50'}`} onClick={() => toggleField('logo')}>{localUserData.enabledFields?.logo && <Check size={16} className="text-white" />}</div>
                </div>
                {/* Sticker Adder */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-100 flex items-center justify-center overflow-hidden p-2"><Smile size={32} className="text-red-400" /></div>
                    <div>
                      <h4 className="text-[0.9rem] font-bold text-gray-800">Stickers</h4>
                      <button onClick={() => setShowStickerModal(true)} className="mt-2 bg-amber-50 text-amber-600 px-6 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest border-none">Browse</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'frames' && (
              <div className="p-5 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-[1rem] font-black text-gray-800 flex items-center gap-2 mb-1"><Layers size={20} className="text-blue-500" /> Frame Overlays</h3>
                   {effectiveSelectedFrame && (
                     <button 
                       onClick={() => setSelectedFrame(null)}
                       className="text-[0.65rem] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-lg border-none hover:bg-red-100 transition-colors"
                     >
                       Reset Frame
                     </button>
                   )}
                </div>
                <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest -mt-4">Apply transparent border overlays</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {frames.length === 0 ? (
                    <div className="col-span-2 py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                       <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                       <p className="text-xs font-bold text-slate-400">No frames available</p>
                    </div>
                  ) : frames.map(f => (
                    <div 
                      key={f._id} 
                      onClick={() => setSelectedFrame(f.image)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${effectiveSelectedFrame === f.image ? 'border-red-500 shadow-xl scale-[1.02]' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <img src={f.image} className="w-full h-full object-fill" alt={f.name} />
                      {effectiveSelectedFrame === f.image && (
                        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                          <Check size={32} className="text-red-500 bg-white rounded-full p-1.5 shadow-lg" strokeWidth={3} />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm text-white text-[9px] font-black uppercase truncate">
                        {f.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 px-6 border-t border-gray-100 bg-white flex items-center justify-between gap-6" style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
            <button className="bg-transparent text-gray-400 font-black text-xs uppercase tracking-widest border-none" onClick={onClose}>Discard</button>
            <button className="flex-1 max-w-[200px] bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 active:scale-[0.98] transition-all border-none uppercase tracking-widest text-xs" onClick={handleApplyEdits}>Apply Edits</button>
          </div>
        </div>
      </div>

      {/* Responsive Sticker Modal */}
      <AnimatePresence>
        {showStickerModal && (
          <div className="fixed inset-0 z-[4000] flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm p-0 lg:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setShowStickerModal(false)}
            />
            <motion.div 
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] lg:h-auto lg:max-h-[80vh] relative z-10"
            >
              {/* Mobile Handle */}
              <div className="h-1.5 w-12 bg-gray-200 rounded-full mx-auto mt-4 mb-2 lg:hidden" />
              
              <div className="p-6 lg:p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Select Stickers</h3>
                  <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mt-1">Personalize your design</p>
                </div>
                <button 
                  onClick={() => setShowStickerModal(false)}
                  className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border-none cursor-pointer"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                  {[
                    'https://cdn-icons-png.flaticon.com/512/1047/1047711.png',
                    'https://cdn-icons-png.flaticon.com/512/1047/1047681.png',
                    'https://cdn-icons-png.flaticon.com/512/1047/1047714.png',
                    'https://cdn-icons-png.flaticon.com/512/1047/1047696.png',
                    'https://cdn-icons-png.flaticon.com/512/100/100062.png',
                    'https://cdn-icons-png.flaticon.com/512/2610/2610260.png',
                    'https://cdn-icons-png.flaticon.com/512/2610/2610267.png',
                    'https://cdn-icons-png.flaticon.com/512/2610/2610271.png',
                    'https://cdn-icons-png.flaticon.com/512/2275/2275066.png',
                    'https://cdn-icons-png.flaticon.com/512/1047/1047711.png',
                    'https://cdn-icons-png.flaticon.com/512/1047/1047681.png',
                    'https://cdn-icons-png.flaticon.com/512/2275/2275066.png'
                  ].map((url, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addSticker(url)}
                      className="aspect-square bg-gray-50 hover:bg-white rounded-3xl flex items-center justify-center p-4 lg:p-6 cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-xl transition-all"
                    >
                      <img src={url} className="w-full h-full object-contain" alt="Sticker" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer Indicator for Mobile */}
              <div className="h-8 shrink-0 lg:hidden" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PosterEditor;
