import React, { useState, useEffect, useRef } from 'react';
import {
  Type, X, Check, ImageIcon as ImageIcon, Layers,
  User, Star, Smile, Plus, Video, Music, Sparkles, PlayCircle, MessageCircle, Globe as GlobeIcon,
  Mail, MapPin, Hash, PlusCircle, Trash2, Palette, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import VideoEditor from './VideoEditor';
import BrandingOverlay from '../posters/BrandingOverlay';
import axios from 'axios';

const PosterEditor = ({ template, onClose }) => {
  const { userData, setUserData, initialEditorTab, frames, selectedFrame, setSelectedFrame, syncSavedEditsToDetail } = useEditor();
  const [activeTab, setActiveTab] = useState(initialEditorTab || 'text');
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const tabs = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'branding', icon: Sparkles, label: 'Logo' },
    { id: 'frames', icon: Layers, label: 'Frames' }
  ];
  const [subTab, setSubTab] = useState('Personal');
  const [musicList, setMusicList] = useState([]);
  const [activeMusicId, setActiveMusicId] = useState(userData.musicId || null);
  const [availableStickers, setAvailableStickers] = useState([]);
  const [stickersLoading, setStickersLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        setStickersLoading(true);
        const { data } = await axios.get(`${API_URL}/user/stickers`);
        setAvailableStickers(data);
      } catch (err) {
        console.error('Failed to fetch stickers:', err);
      } finally {
        setStickersLoading(false);
      }
    };
    fetchStickers();
  }, [API_URL]);

  useEffect(() => {
    if (activeTab === 'video') {
      setShowVideoEditor(true);
    }
  }, [activeTab]);

  const currentTemplate = template.templateId && typeof template.templateId === 'object' ? template.templateId : template;

  const getName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    if (typeof nameObj === 'object') return nameObj.en || Object.values(nameObj)[0] || '';
    return '';
  };

  const isBusinessCard =
    getName(currentTemplate?.subcategoryId?.name).toLowerCase().includes('business card') ||
    getName(currentTemplate?.categoryId?.name).toLowerCase().includes('business card') ||
    getName(currentTemplate?.category).toLowerCase().includes('business card') ||
    currentTemplate?.type === 'business_card' ||
    (currentTemplate?.fields && currentTemplate.fields.length > 0);

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
      name: savedData.name || '',
      business_name: savedData.business_name || '',
      phone_number: savedData.phone_number || '',
      website: savedData.website || '',
      email: savedData.email || '',
      address: savedData.address || '',
      gst_number: savedData.gst_number || '',
      designation: savedData.designation || '',
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
    const photos = localUserData.extraPhotos || [];
    if (photos.length >= 5) return;
    const offset = photos.length * 5;
    const newPhoto = { id: `photo-${Date.now()}`, url, x: `${30 + offset}%`, y: `${30 + offset}%`, size: 20 };
    setLocalUserData(prev => ({ ...prev, extraPhotos: [...(prev.extraPhotos || []), newPhoto] }));
  };

  const dragOffsetsRef = useRef({});

  const onDragStart = (id, e, info) => {
    const target = e.currentTarget || e.target;
    if (!target || !target.getBoundingClientRect) return;

    const rect = target.getBoundingClientRect();
    dragOffsetsRef.current[id] = {
      x: info.point.x - rect.left,
      y: info.point.y - rect.top
    };
  };

  const coordinateAreaRef = useRef(null);

  const getNextPosition = (id, event, info) => {
    const parentRef = coordinateAreaRef.current;
    if (!parentRef) return null;

    const width = parentRef.clientWidth;
    const height = parentRef.clientHeight;
    if (!width || !height) return null;

    // Find the original item to get its starting percentage
    const allItems = [...(localUserData.stickers || []), ...(localUserData.extraPhotos || [])];
    const item = allItems.find(i => i.id === id);
    if (!item) return null;

    const startXPct = parseFloat(item.x || '20');
    const startYPct = parseFloat(item.y || '20');

    // Calculate how much the move represents in percentage terms
    const deltaXPct = (info.offset.x / width) * 100;
    const deltaYPct = (info.offset.y / height) * 100;

    let xPct = startXPct + deltaXPct;
    let yPct = startYPct + deltaYPct;

    // Constrain within reasonable bounds
    xPct = Math.max(-10, Math.min(100, xPct));
    yPct = Math.max(-10, Math.min(100, yPct));

    return {
      x: `${xPct.toFixed(2)}%`,
      y: `${yPct.toFixed(2)}%`
    };
  };

  const addSticker = (url) => {
    const newSticker = {
      id: `sticker-${Date.now()}`,
      url,
      x: '30%',
      y: '30%',
      size: 15
    };
    setLocalUserData(prev => {
      const currentStickers = prev.stickers || [];
      return { ...prev, stickers: [...currentStickers, newSticker] };
    });
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
  const nameDefault = { x: framePos.name?.x || '5%', y: framePos.name?.y || (hasFrameApplied ? '82%' : '80%') };
  const businessNameDefault = { x: framePos.businessName?.x || '5%', y: framePos.businessName?.y || (hasFrameApplied ? '84%' : '82%') };
  const phoneDefaultY = framePos.phone?.y || (hasFrameApplied ? '86%' : '85%');
  const websiteDefaultY = framePos.website?.y || (hasFrameApplied ? '88%' : '88%');
  const emailDefaultY = framePos.email?.y || (hasFrameApplied ? '90%' : '91%');
  const addressDefaultY = framePos.address?.y || (hasFrameApplied ? '92%' : '94%');
  const gstDefaultY = framePos.gst?.y || (hasFrameApplied ? '94%' : '96%');
  const designationDefaultY = framePos.designation?.y || (hasFrameApplied ? '96%' : '98%');
  const userPhotoDefault = { x: framePos.userPhoto?.x || '70%', y: framePos.userPhoto?.y || (hasFrameApplied ? '74%' : '70%') };
  const logoDefault = { x: framePos.logo?.x || '10%', y: framePos.logo?.y || (hasFrameApplied ? '80%' : '75%') };

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

  const effectiveNamePos = migratePos(localUserData.namePos, nameDefault);
  const effectiveBusinessNamePos = migratePos(localUserData.businessNamePos, businessNameDefault);
  const effectivePhonePos = migratePos(localUserData.phonePos, { x: framePos.phone?.x || '5%', y: phoneDefaultY });
  const effectiveWebsitePos = migratePos(localUserData.websitePos, { x: framePos.website?.x || '5%', y: websiteDefaultY });
  const effectiveEmailPos = migratePos(localUserData.emailPos, { x: framePos.email?.x || '5%', y: emailDefaultY });
  const effectiveAddressPos = migratePos(localUserData.addressPos, { x: framePos.address?.x || '5%', y: addressDefaultY });
  const effectiveGstPos = migratePos(localUserData.gstPos, { x: framePos.gst?.x || '5%', y: gstDefaultY });
  const effectiveDesignationPos = migratePos(localUserData.designationPos, { x: framePos.designation?.x || '5%', y: designationDefaultY });

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

  const { user, setUser } = useAuth();

  const handleGlobalImageUpload = async (file, type) => {
    if (!file) return;
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.accessToken}`
        }
      };

      // 1. Upload to server
      const { data: uploadRes } = await axios.post(`${API_URL.replace('/user', '')}/upload`, uploadData, config);
      const imageUrl = uploadRes.url;

      // 2. Update local editor state
      updateLocalField(type === 'profile' ? 'userPhoto' : 'logo', imageUrl);

      // 3. Persist to global user profile
      const profilePayload = type === 'profile' ? { profilePhoto: imageUrl } : { logo: imageUrl };
      const { data: profileRes } = await axios.put(
        `${API_URL}/user/profile`,
        profilePayload,
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );

      // 4. Update global auth context
      const updatedUser = { ...user, user: profileRes.user };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // 5. Update editor context
      setUserData(prev => ({ ...prev, [type === 'profile' ? 'userPhoto' : 'logo']: imageUrl }));

    } catch (error) {
      console.error(`${type} image upload failed:`, error);
      alert(`Failed to upload ${type} image`);
    }
  };

  const handleApplyEdits = async () => {
    const savedCustomData = {
      ...localUserData,
      name: localUserData.name || 'Your Name',
      business_name: localUserData.business_name || 'Your Business',
      musicId: activeMusicId,
      selectedFrame: effectiveSelectedFrame
    };

    // Update global userData WITHOUT selectedFrame so it doesn't bleed into
    // every TemplateCard on the home page (they all share global userData).
    // The frame is preserved inside savedCustomData for THIS template only.
    setUserData(prev => ({
      ...prev,
      ...localUserData,
      name: savedCustomData.name,
      business_name: savedCustomData.business_name,
      musicId: activeMusicId,
      selectedFrame: null  // ← CLEAR global frame; it lives in customData per-template
    }));
    syncSavedEditsToDetail(template, savedCustomData);

    try {
      if (user?.accessToken && currentTemplate?._id) {
        // 1. Save specific template customData (for history)
        await axios.post(`${API_URL}/user/save-template`,
          {
            templateId: currentTemplate._id,
            customData: savedCustomData
          },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        // 2. Also update global user profile with the basic info
        const { data: profileRes } = await axios.put(
          `${API_URL}/user/profile`,
          {
            name: localUserData.name,
            businessName: localUserData.business_name,
            website: localUserData.website,
            email: localUserData.email,
            gstNumber: localUserData.gst_number,
            designation: localUserData.designation,
            address: localUserData.address
          },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        // 3. Update global auth context
        const updatedUser = { ...user, user: profileRes.user };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) { console.error('Profile/History update failed:', err); }
    // CRITICAL: Sync edits to the active Detail view if it exists
    syncSavedEditsToDetail(template, savedCustomData);

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
        {/* Preview Area Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-[#f8fafc] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Scalable Poster Shell */}
          <div
            className="relative flex flex-col w-full max-w-[600px] h-full transition-all duration-500"
            style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15))' }}
            ref={previewBoundsRef}
          >
            {/* Square Coordinate Area */}
            <div
              ref={coordinateAreaRef}
              className={`relative ${isBusinessCard ? 'aspect-[1.75/1]' : 'aspect-square'} w-full bg-white rounded-t-2xl lg:rounded-t-[32px] overflow-hidden border-x-[8px] border-t-[8px] lg:border-x-[16px] lg:border-t-[16px] border-white flex-shrink min-h-0 z-[1]`}
            >
              {/* Main Poster Content */}
              <div className="relative w-full h-full overflow-hidden bg-white">
                {/* Poster Background */}
                <img src={currentTemplate.image} className="w-full h-full object-cover relative z-[1]" alt="Preview" crossOrigin="anonymous" />

                {/* Frame Layer (Inside square only) */}
                {effectiveSelectedFrame && (
                  <img
                    src={effectiveSelectedFrame}
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]"
                    alt="Frame Overlay"
                    crossOrigin="anonymous"
                  />
                )}

                {/* Dealing India Branding Badge */}
                <div
                  className="absolute top-[3%] right-[3%] z-[95] flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-black/10 shadow-lg pointer-events-none"
                >
                  <img src="/dealing-india-logo.png" className="w-6 h-6 object-contain" alt="DI" crossOrigin="anonymous" />
                  <span className="text-black font-black tracking-tighter text-[10px] uppercase whitespace-nowrap">Dealingindia</span>
                </div>
              </div>

              {/* Dedicated Content Layer */}
              <div className="absolute inset-0 z-[75]">
                {/* Business Card Fields (if applicable) */}
                {isBusinessCard && currentTemplate.fields?.map((field, idx) => {
                  const userValue = localUserData[field.key] || field.label;
                  const style = {
                    position: 'absolute',
                    left: field.position?.x || '0%',
                    top: field.position?.y || '0%',
                    fontSize: field.style?.fontSize || '10px',
                    color: field.style?.color || '#000',
                    fontWeight: field.style?.fontWeight || 'bold',
                  };

                  if (field.type === 'image') {
                    const imageUrl = localUserData[field.key] || (field.key === 'logo' ? localUserData.logo : null);
                    return imageUrl ? (
                      <img key={idx} src={imageUrl} style={{ ...style, width: '12%', objectFit: 'contain' }} alt={field.label} />
                    ) : null;
                  }

                  return (
                    <div key={idx} style={{ ...style, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                      {userValue}
                    </div>
                  );
                })}

                {/* Standard Poster Branding Items (Only if NOT a business card AND a frame is applied) */}
                {!isBusinessCard && hasFrameApplied && localUserData.enabledFields?.name !== false && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart('name', e, info)}
                    onDragEnd={(e, info) => updateLocalField('namePos', getNextPosition('name', e, info))}
                    className="inline-block pointer-events-auto absolute cursor-move touch-none"
                    style={{
                      left: effectiveNamePos.x,
                      top: effectiveNamePos.y,
                      zIndex: 95
                    }}
                    animate={{ x: 0, y: 0 }}
                  >
                    <div
                      className="whitespace-nowrap leading-tight"
                      style={{
                        ...getStyle('name')
                      }}
                    >
                      {localUserData.name || 'Your Name'}
                    </div>
                  </motion.div>
                )}

                {!isBusinessCard && hasFrameApplied && localUserData.enabledFields?.business_name !== false && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart('business', e, info)}
                    onDragEnd={(e, info) => updateLocalField('businessNamePos', getNextPosition('business', e, info))}
                    className="inline-block pointer-events-auto absolute cursor-move touch-none"
                    style={{
                      left: effectiveBusinessNamePos.x,
                      top: effectiveBusinessNamePos.y,
                      zIndex: 95
                    }}
                    animate={{ x: 0, y: 0 }}
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

                {!isBusinessCard && hasFrameApplied && (
                  <div className="flex flex-col relative h-full pointer-events-none">
                    {localUserData.enabledFields?.phone && (
                      <motion.div
                        drag
                        dragMomentum={false}
                        dragConstraints={previewBoundsRef}
                        onDragStart={(e, info) => onDragStart('phone', e, info)}
                        onDragEnd={(e, info) => updateLocalField('phonePos', getNextPosition('phone', e, info))}
                        className="pointer-events-auto absolute cursor-move touch-none"
                        style={{
                          left: effectivePhonePos.x,
                          top: effectivePhonePos.y,
                          zIndex: 95
                        }}
                        animate={{ x: 0, y: 0 }}
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
                        onDragStart={(e, info) => onDragStart('website', e, info)}
                        onDragEnd={(e, info) => updateLocalField('websitePos', getNextPosition('website', e, info))}
                        className="pointer-events-auto absolute cursor-move touch-none"
                        style={{
                          left: effectiveWebsitePos.x,
                          top: effectiveWebsitePos.y,
                          zIndex: 95
                        }}
                        animate={{ x: 0, y: 0 }}
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
                        onDragStart={(e, info) => onDragStart('email', e, info)}
                        onDragEnd={(e, info) => updateLocalField('emailPos', getNextPosition('email', e, info))}
                        className="pointer-events-auto absolute cursor-move touch-none"
                        style={{
                          left: effectiveEmailPos.x,
                          top: effectiveEmailPos.y,
                          zIndex: 95
                        }}
                        animate={{ x: 0, y: 0 }}
                      >
                        <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                          {localUserData.email}
                        </div>
                      </motion.div>
                    )}
                    {localUserData.enabledFields?.designation && localUserData.designation && (
                      <motion.div
                        drag
                        dragMomentum={false}
                        dragConstraints={previewBoundsRef}
                        onDragStart={(e, info) => onDragStart('designation', e, info)}
                        onDragEnd={(e, info) => updateLocalField('designationPos', getNextPosition('designation', e, info))}
                        className="pointer-events-auto absolute cursor-move touch-none"
                        style={{
                          left: effectiveDesignationPos.x,
                          top: effectiveDesignationPos.y,
                          zIndex: 95
                        }}
                        animate={{ x: 0, y: 0 }}
                      >
                        <div className="whitespace-nowrap font-black" style={{ ...getStyle('detail'), color: '#ef4444' }}>
                          {localUserData.designation}
                        </div>
                      </motion.div>
                    )}
                    {localUserData.enabledFields?.address && localUserData.address && (
                      <motion.div
                        drag
                        dragMomentum={false}
                        dragConstraints={previewBoundsRef}
                        onDragStart={(e, info) => onDragStart('address', e, info)}
                        onDragEnd={(e, info) => updateLocalField('addressPos', getNextPosition('address', e, info))}
                        className="pointer-events-auto absolute cursor-move touch-none"
                        style={{
                          left: effectiveAddressPos.x,
                          top: effectiveAddressPos.y,
                          zIndex: 95
                        }}
                        animate={{ x: 0, y: 0 }}
                      >
                        <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                          {localUserData.address}
                        </div>
                      </motion.div>
                    )}
                    {localUserData.enabledFields?.gst && localUserData.gst_number && (
                      <motion.div
                        drag
                        dragMomentum={false}
                        dragConstraints={previewBoundsRef}
                        onDragStart={(e, info) => onDragStart('gst', e, info)}
                        onDragEnd={(e, info) => updateLocalField('gstPos', getNextPosition('gst', e, info))}
                        className="pointer-events-auto absolute cursor-move touch-none"
                        style={{
                          left: effectiveGstPos.x,
                          top: effectiveGstPos.y,
                          zIndex: 95
                        }}
                        animate={{ x: 0, y: 0 }}
                      >
                        <div className="whitespace-nowrap" style={{ ...getStyle('detail') }}>
                          {localUserData.gst_number}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Extra Custom Texts */}
                {localUserData.extraTexts?.map(t => (
                  <motion.div
                    key={t.id}
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart(t.id, e, info)}
                    onDragEnd={(e, info) => updateExtraText(t.id, getNextPosition(t.id, e, info))}
                    className="absolute cursor-move select-none p-1 pointer-events-auto touch-none"
                    style={{ left: t.x ?? '40%', top: t.y ?? '40%', color: t.color, fontSize: `${t.size}px`, fontWeight: 'black', textShadow: '0 2px 6px rgba(0,0,0,0.8)', zIndex: 90 }}
                    animate={{ x: 0, y: 0 }}
                  >
                    {t.text}
                  </motion.div>
                ))}
              </div>

              {/* Non-Text Interactive Overlays (Stickers, Photos) */}
              <div className="absolute inset-0 z-[80] pointer-events-none">
                {localUserData.enabledFields?.userPhoto && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart('userPhoto', e, info)}
                    onDragEnd={(e, info) => updateLocalField('userPhotoPos', getNextPosition('userPhoto', e, info))}
                    className="absolute cursor-move pointer-events-auto touch-none"
                    style={{ left: localUserData.userPhotoPos?.x ?? userPhotoDefault.x, top: localUserData.userPhotoPos?.y ?? userPhotoDefault.y, width: hasFrameApplied ? 62 : 80, height: hasFrameApplied ? 62 : 80, zIndex: 85 }}
                    animate={{ x: 0, y: 0 }}
                  >
                    <div className="w-full h-full p-1 bg-white rounded-full shadow-2xl border-2 border-white overflow-hidden relative"><img src={localUserData.userPhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} className="w-full h-full object-cover rounded-full" crossOrigin="anonymous" /></div>
                  </motion.div>
                )}
                {localUserData.enabledFields?.logo && localUserData.logo && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart('logo', e, info)}
                    onDragEnd={(e, info) => updateLocalField('logoPos', getNextPosition('logo', e, info))}
                    className="absolute cursor-move pointer-events-auto touch-none"
                    style={{ left: localUserData.logoPos?.x ?? logoDefault.x, top: localUserData.logoPos?.y ?? logoDefault.y, width: hasFrameApplied ? 44 : 60, height: hasFrameApplied ? 44 : 60, zIndex: 85 }}
                    animate={{ x: 0, y: 0 }}
                  >
                    <div className="w-full h-full p-2 bg-white rounded-xl shadow-xl border border-white overflow-hidden"><img src={localUserData.logo} className="w-full h-full object-contain" crossOrigin="anonymous" /></div>
                  </motion.div>
                )}
                {localUserData.extraPhotos?.map(p => (
                  <motion.div
                    key={p.id}
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart(p.id, e, info)}
                    onDragEnd={(e, info) => updateDraggable('extraPhotos', p.id, getNextPosition(p.id, e, info))}
                    className="absolute cursor-move group pointer-events-auto touch-none"
                    style={{ left: p.x ?? '50%', top: p.y ?? '30%', width: `${p.size || 20}%`, aspectRatio: '1/1', zIndex: 82 }}
                    animate={{ x: 0, y: 0 }}
                    whileDrag={{ scale: 1.05, zIndex: 100 }}
                  >
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
                  <motion.div
                    key={s.id}
                    drag
                    dragMomentum={false}
                    dragConstraints={previewBoundsRef}
                    onDragStart={(e, info) => onDragStart(s.id, e, info)}
                    onDragEnd={(e, info) => updateDraggable('stickers', s.id, getNextPosition(s.id, e, info))}
                    className="absolute cursor-move pointer-events-auto touch-none"
                    style={{ left: s.x ?? '20%', top: s.y ?? '20%', width: `${s.size || 15}%`, aspectRatio: '1/1', zIndex: 80 }}
                    whileDrag={{ scale: 1.1, zIndex: 100 }}
                  >
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

              {/* Branding Bar Visuals (Footer) */}
              {!isBusinessCard && !hasFrameApplied && (
                <div
                  ref={brandingBarRef}
                  className="relative z-[100] w-full bg-[#0a0a0a] border-x-[8px] border-b-[8px] lg:border-x-[16px] lg:border-b-[16px] border-white rounded-b-2xl lg:rounded-b-[32px] h-[85px] lg:h-[110px] flex-shrink-0"
                >
                  <BrandingOverlay userData={localUserData} size="regular" isOverlay={false} />
                </div>
              )}
            </div>
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
                onClick={() => {
                  if (tab.id === 'video') {
                    setShowVideoEditor(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
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
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Personal Name</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" value={localUserData.name || ''} onChange={e => updateLocalField('name', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.name !== false ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('name')}>{localUserData.enabledFields?.name !== false && <Check size={16} className="text-white" />}</div>
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
                  {subTab === 'Misc' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Designation / Role</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" placeholder="e.g. Founder, CEO, Manager" value={localUserData.designation || ''} onChange={e => updateLocalField('designation', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.designation ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('designation')}>{localUserData.enabledFields?.designation && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {subTab === 'Business' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Business Name</label>
                        <div className="flex items-center gap-3">
                          <input type="text" className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none text-[0.9rem] font-bold text-gray-700" value={localUserData.business_name || ''} onChange={e => updateLocalField('business_name', e.target.value)} />
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${localUserData.enabledFields?.business_name !== false ? 'bg-blue-500' : 'bg-gray-100'}`} onClick={() => toggleField('business_name')}>{localUserData.enabledFields?.business_name !== false && <Check size={16} className="text-white" />}</div>
                        </div>
                      </div>
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
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleGlobalImageUpload(e.target.files[0], 'profile')} />
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
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleGlobalImageUpload(e.target.files[0], 'logo')} />
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
            {activeTab === 'video' && (
              <div className="p-10 flex flex-col items-center justify-center gap-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
                  <Video size={40} />
                </div>
                <div className="animate-pulse">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Redirecting to Video Editor...</h3>
                  <p className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest mt-2">Opening specialized tools</p>
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
                  {stickersLoading ? (
                    [...Array(10)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-3xl" />
                    ))
                  ) : availableStickers.length > 0 ? (
                    availableStickers.map((sticker) => (
                      <motion.div
                        key={sticker._id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addSticker(sticker.image)}
                        className="aspect-square bg-gray-50 hover:bg-white rounded-3xl flex items-center justify-center p-4 lg:p-6 cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-xl transition-all"
                      >
                        <img src={sticker.image} className="w-full h-full object-contain" alt={sticker.name} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No stickers available</div>
                  )}
                </div>
              </div>

              {/* Footer Indicator for Mobile */}
              <div className="h-8 shrink-0 lg:hidden" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideoEditor && (
          <VideoEditor
            template={template}
            userData={userData}
            onClose={() => {
              setShowVideoEditor(false);
              if (activeTab === 'video') setActiveTab('text');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PosterEditor;
