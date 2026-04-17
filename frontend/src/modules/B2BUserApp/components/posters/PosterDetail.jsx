import { ArrowLeft, Heart, Video, Download, MessageCircle, Share2, User, Phone, Globe, X, Star, Mail, MapPin, Hash, Palette, Move, Save, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import VideoEditor from '../editor/VideoEditor';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const ActionIcon = ({ icon: Icon, label, color, onClick }) => (
  <div 
    className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
    onClick={onClick}
  >
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent" style={{ color }}>
      <Icon size={24} />
    </div>
    <span className="text-[0.7rem] text-[#64748b] font-bold uppercase tracking-wider">{label}</span>
  </div>
);

const PosterDetail = ({ template, onEdit, onClose }) => {
  const { userData: globalUserData, frames, selectedFrame, setSelectedFrame } = useEditor();
  const { user } = useAuth();
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const posterRef = useRef(null);         // for html2canvas
  const posterContainerRef = useRef(null); // for drag coordinate system
  const dragRef = useRef(null);           // active drag tracking
  const [containerWidth, setContainerWidth] = useState(500);

  useEffect(() => {
    if (!posterContainerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(posterContainerRef.current);
    return () => obs.disconnect();
  }, []);

  // Tracks positions the user has manually dragged in this view
  const [localPos, setLocalPos] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const hasDragged = Object.keys(localPos).length > 0;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  // ── Pointer-based drag handlers (no framer-motion, no snapping) ──────────
  const onPointerDown = useCallback((e, field, currentPos) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      field,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startXPct: parseFloat(currentPos.x) || 0,
      startYPct: parseFloat(currentPos.y) || 0,
    };
  }, []);

  const onPointerMove = useCallback((e, field) => {
    const d = dragRef.current;
    if (!d || d.field !== field || !posterContainerRef.current) return;
    e.preventDefault();
    const { width, height } = posterContainerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - d.startClientX) / width) * 100;
    const dy = ((e.clientY - d.startClientY) / height) * 100;
    const newX = Math.max(0, Math.min(92, d.startXPct + dx));
    const newY = Math.max(0, Math.min(96, d.startYPct + dy));
    setLocalPos(prev => ({ ...prev, [field]: { x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` } }));
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  // Merge user-dragged positions into customData and persist
  const saveLayout = async () => {
    if (!user?.accessToken) { alert('Please log in to save'); return; }
    const currentTemplate = template.templateId && typeof template.templateId === 'object' ? template.templateId : template;
    const existingCustom = template.customData || {};
    const merged = {
      ...existingCustom,
      ...(localPos.name    && { namePos:    localPos.name }),
      ...(localPos.phone   && { phonePos:   localPos.phone }),
      ...(localPos.website && { websitePos: localPos.website }),
      ...(localPos.email   && { emailPos:   localPos.email }),
      ...(localPos.address && { addressPos: localPos.address }),
      ...(localPos.gst     && { gstPos:     localPos.gst }),
      ...(localPos.photo   && { userPhotoPos: localPos.photo }),
      ...(localPos.logo    && { logoPos:    localPos.logo }),
    };
    try {
      setIsSaving(true);
      await axios.post(`${API_URL}/user/save-template`, {
        templateId: currentTemplate._id,
        customData: merged,
      }, { headers: { Authorization: `Bearer ${user.accessToken}` } });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanUrl = (url) => {
    if (!url || url.includes('default_logo.png')) return null;
    return url;
  };

  // Determine effective template data and user data
  const currentTemplate = template.templateId && typeof template.templateId === 'object' ? template.templateId : template;
  const rawUserData = template.customData || globalUserData;
  
  const userData = {
    ...rawUserData,
    logo: cleanUrl(rawUserData.logo),
    userPhoto: cleanUrl(rawUserData.userPhoto)
  };
  const normalizeFrameValue = (frame) => {
    if (!frame) return null;
    if (typeof frame === 'string') return frame;
    if (typeof frame === 'object') return frame.image || frame.url || null;
    return null;
  };
  const activeFrame = normalizeFrameValue(userData.selectedFrame) || normalizeFrameValue(selectedFrame);
  const hasFrameApplied = !!activeFrame;

  // Find the full frame object to get text styles
  const activeFrameObj = frames.find(f => normalizeFrameValue(f) === activeFrame);
  const frameStyle = activeFrameObj?.textStyle || {};

  const getStyle = (type) => {
    const isName = type === 'name';
    const scale = containerWidth / 500;
    const baseSize = isName ? (frameStyle.nameSize || '0.8rem') : (frameStyle.detailSize || '0.6rem');
    
    return {
      color: frameStyle.color || '#ffffff',
      fontSize: `calc(${baseSize} * ${scale})`,
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

  // Poster-relative defaults — frame positions take priority over hardcoded fallbacks
  const nameDefault      = { x: framePos.name?.x      || '5%', y: framePos.name?.y      || (hasFrameApplied ? '82%' : '80%') };
  const phoneDefault     = { x: framePos.phone?.x     || '5%', y: framePos.phone?.y     || (hasFrameApplied ? '86%' : '85%') };
  const websiteDefault   = { x: framePos.website?.x   || '5%', y: framePos.website?.y   || (hasFrameApplied ? '88%' : '88%') };
  const emailDefault     = { x: framePos.email?.x     || '5%', y: framePos.email?.y     || (hasFrameApplied ? '90%' : '91%') };
  const addressDefault   = { x: framePos.address?.x   || '5%', y: framePos.address?.y   || (hasFrameApplied ? '92%' : '94%') };
  const gstDefault       = { x: framePos.gst?.x       || '5%', y: framePos.gst?.y       || (hasFrameApplied ? '93%' : '96%') };
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

  const effectiveNamePos    = migratePos(userData.namePos,    nameDefault);
  const effectivePhonePos   = migratePos(userData.phonePos,   phoneDefault);
  const effectiveWebsitePos = migratePos(userData.websitePos, websiteDefault);
  const effectiveEmailPos   = migratePos(userData.emailPos,   emailDefault);
  const effectiveAddressPos = migratePos(userData.addressPos, addressDefault);
  const effectiveGstPos     = migratePos(userData.gstPos,     gstDefault);

  const inlineSafeColorsForHtml2Canvas = (rootElement) => {
    if (!rootElement) return () => {};

    const elements = [rootElement, ...rootElement.querySelectorAll('*')];
    const updated = [];

    const colorProps = [
      'color',
      'background-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'text-decoration-color',
      'caret-color',
      'fill',
      'stroke'
    ];

    const shadowProps = ['box-shadow', 'text-shadow'];

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const previous = {};

      colorProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;

        previous[prop] = el.style.getPropertyValue(prop);

        if (value.includes('oklab') || value.includes('oklch')) {
          const fallback = prop === 'background-color' ? '#ffffff' : '#000000';
          el.style.setProperty(prop, fallback, 'important');
        } else {
          el.style.setProperty(prop, value, 'important');
        }
      });

      shadowProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;

        previous[prop] = el.style.getPropertyValue(prop);

        if (value.includes('oklab') || value.includes('oklch')) {
          el.style.setProperty(prop, 'none', 'important');
        } else {
          el.style.setProperty(prop, value, 'important');
        }
      });

      updated.push({ el, previous });
    });

    return () => {
      updated.forEach(({ el, previous }) => {
        Object.entries(previous).forEach(([prop, value]) => {
          if (value) {
            el.style.setProperty(prop, value);
          } else {
            el.style.removeProperty(prop);
          }
        });
      });
    };
  };

  const handleDownload = async () => {
    if (!posterRef.current || !window.html2canvas) {
       alert('Rendering engine not ready. Please try again in a moment.');
       return;
    }
    
    const restoreStyles = inlineSafeColorsForHtml2Canvas(posterRef.current);

    try {
      const canvas = await window.html2canvas(posterRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const link = document.createElement('a');
      const stamp = new Date().getTime();
      link.download = `my-design-${stamp}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed due to a system error. Please try again.');
    } finally {
      restoreStyles();
    }
  };

  const handleWhatsApp = () => {
    const text = `Check out my custom poster! Created with Dealing India Poster.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + currentTemplate.image)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-4 lg:p-8 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <motion.div 
        className="w-full h-[100dvh] md:h-auto md:max-h-[90dvh] md:max-w-[480px] md:rounded-[2.5rem] bg-white shadow-2xl overflow-hidden relative flex flex-col"
        initial={{ opacity: 0, y: '50%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="bg-[#b91c1c] px-4 flex items-center gap-4 text-white shrink-0" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: '0.75rem' }}>
          <button className="bg-transparent text-white p-2 -ml-2 flex items-center active:scale-95 transition-transform border-none outline-none cursor-pointer" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            <h3 className="text-[1.1rem] font-bold truncate">{currentTemplate.category || 'Custom Poster'} 🌙</h3>
            <span className="text-[0.95rem] opacity-80 font-black tracking-tighter">({currentTemplate._id?.slice(-4).toUpperCase()})</span>
          </div>
          <button className="bg-[#fde047] text-[#854d0e] px-4 py-1.5 rounded-[4px] text-[0.7rem] font-black active:scale-95 transition-transform shadow-sm border-none uppercase tracking-tighter cursor-pointer">
            UPGRADE
          </button>
        </div>

        <div className="bg-[#fff7ed] text-[#c2410c] p-2.5 px-4 text-center text-[0.8rem] font-bold border-b border-[#ffedd5] shrink-0">
           Premium Category Access. <strong className="cursor-pointer underline ml-1">Upgrade Now</strong>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-slate-50">
          <div className="bg-[#f1f5f9] flex items-center justify-center p-4 min-h-[400px]">
             {/* Captured Area — dual refs: posterRef for canvas export, posterContainerRef for drag math */}
            <div
              ref={(el) => { posterRef.current = el; posterContainerRef.current = el; }}
              className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl flex items-center justify-center border border-[#e2e8f0]"
              style={{ backgroundColor: '#ffffff' }}
            >
               {/* Poster Background */}
               <img
                 src={currentTemplate.image}
                 alt={currentTemplate.title}
                 crossOrigin="anonymous"
                 className="w-full h-full object-cover relative z-[1]"
               />

               {/* Frame Layer */}
               {activeFrame && (
                 <img
                   src={activeFrame}
                   className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]"
                   alt="Frame Overlay"
                   crossOrigin="anonymous"
                 />
               )}

               {/* ── Draggable Text Layer ── */}
               <div className="text-layer absolute inset-0 z-[75]">

                 {/* Name */}
                 {userData.enabledFields?.business_name !== false && (() => {
                   const pos = localPos.name || effectiveNamePos;
                   return (
                     <div
                       className="absolute leading-tight"
                       style={{ ...getStyle('name'), left: pos.x, top: pos.y, cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'name', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'name')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       {userData.business_name || 'Your Business Name'}
                     </div>
                   );
                 })()}

                 {/* Phone */}
                 {userData.enabledFields?.phone && (() => {
                   const pos = localPos.phone || effectivePhonePos;
                   return (
                     <div
                       className="absolute"
                       style={{ ...getStyle('phone'), left: pos.x, top: pos.y, textShadow: '0 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'phone', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'phone')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       {userData.phone_number || '9876543210'}
                     </div>
                   );
                 })()}

                 {/* Website */}
                 {userData.enabledFields?.website && userData.website && (() => {
                   const pos = localPos.website || effectiveWebsitePos;
                   return (
                     <div
                       className={`text-white font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`}
                       style={{ ...getStyle('detail'), left: pos.x, top: pos.y, textShadow: '0 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'website', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'website')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       {userData.website}
                     </div>
                   );
                 })()}

                 {/* Email */}
                 {userData.enabledFields?.email && userData.email && (() => {
                   const pos = localPos.email || effectiveEmailPos;
                   return (
                     <div
                       className={`text-white font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`}
                       style={{ ...getStyle('detail'), left: pos.x, top: pos.y, textShadow: '0 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'email', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'email')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       {userData.email}
                     </div>
                   );
                 })()}

                 {/* Address */}
                 {userData.enabledFields?.address && userData.address && (() => {
                   const pos = localPos.address || effectiveAddressPos;
                   return (
                     <div
                       className={`text-white font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`}
                       style={{ ...getStyle('detail'), left: pos.x, top: pos.y, textShadow: '0 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'address', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'address')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       {userData.address}
                     </div>
                   );
                 })()}

                 {/* GST */}
                 {(userData.enabledFields?.gst || (userData.gst_number || '').trim()) && (() => {
                   const pos = localPos.gst || effectiveGstPos;
                   return (
                     <div
                       className={`text-white font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} uppercase absolute`}
                       style={{ ...getStyle('detail'), left: pos.x, top: pos.y, textShadow: '0 2px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'gst', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'gst')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       {userData.gst_number}
                     </div>
                   );
                 })()}

                 {/* Extra Texts (non-draggable, managed via editor) */}
                 {userData.extraTexts?.map(t => (
                   <div key={t.id} className="absolute font-black pointer-events-none" style={{ left: t.x || '40%', top: t.y || '40%', color: t.color, fontSize: `${t.size}px`, textShadow: '0 2px 4px rgba(0,0,0,0.8)', zIndex: 90, whiteSpace: 'nowrap' }}>
                     {t.text}
                   </div>
                 ))}
               </div>

               {/* ── Draggable Photos Layer ── */}
               <div className="absolute inset-0 z-[80]">

                 {/* Profile Photo */}
                 {userData.enabledFields?.userPhoto && (() => {
                   const pos = localPos.photo || { x: userData.userPhotoPos?.x || userPhotoDefault.x, y: userData.userPhotoPos?.y || userPhotoDefault.y };
                   const dim = hasFrameApplied ? '14%' : '18%';
                   return (
                     <div
                       className="absolute"
                       style={{ left: pos.x, top: pos.y, width: dim, height: dim, zIndex: 85, cursor: 'grab', touchAction: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'photo', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'photo')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       <img
                         src={userData.userPhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                         className="w-full h-full rounded-full border-2 border-white object-cover shadow-xl"
                         crossOrigin="anonymous"
                       />
                     </div>
                   );
                 })()}

                 {/* Logo */}
                 {userData.enabledFields?.logo && userData.logo && (() => {
                   const pos = localPos.logo || { x: userData.logoPos?.x || logoDefault.x, y: userData.logoPos?.y || logoDefault.y };
                   const dim = hasFrameApplied ? '9%' : '12%';
                   return (
                     <div
                       className="absolute"
                       style={{ left: pos.x, top: pos.y, width: dim, height: dim, zIndex: 85, cursor: 'grab', touchAction: 'none' }}
                       onPointerDown={(e) => onPointerDown(e, 'logo', pos)}
                       onPointerMove={(e) => onPointerMove(e, 'logo')}
                       onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                     >
                       <img src={userData.logo} className="w-full h-full object-contain bg-white rounded-lg p-1 shadow-lg" crossOrigin="anonymous" />
                     </div>
                   );
                 })()}

                 {/* Extra Photos (non-draggable here) */}
                 {userData.extraPhotos?.map(p => (
                   <div key={p.id} className="absolute pointer-events-none" style={{ left: p.x || '50%', top: p.y || '30%', width: p.size, height: p.size, zIndex: 82 }}>
                     <img src={p.url} className="w-full h-full object-cover rounded shadow-xl border-2 border-white" crossOrigin="anonymous" />
                   </div>
                 ))}
                 {userData.stickers?.map(s => (
                   <div key={s.id} className="absolute pointer-events-none" style={{ left: s.x || '20%', top: s.y || '20%', width: s.size, height: s.size, zIndex: 80 }}>
                     <img src={s.url} className="w-full h-full object-contain" crossOrigin="anonymous" />
                   </div>
                 ))}
               </div>

               {/* Fallback Branding Bar */}
               {!hasFrameApplied && (
                 <div className="absolute bottom-0 left-0 right-0 z-[10] pointer-events-none w-full">
                   <div 
                     className="flex h-[50px] lg:h-[100px] border-t border-white/10 shadow-2xl space-between"
                     style={{ backgroundColor: '#0a0a0a' }}
                   >
                     <div className="flex-1" />
                     <div className="relative w-[80px] lg:w-[150px] shrink-0" />
                   </div>
                 </div>
               )}
              
               <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-[20] bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-2 text-[0.75rem] font-black shadow-lg border border-white/10 tracking-widest">
                 <Heart size={14} className="text-white" fill="currentColor" />
                 <span>1.1K</span>
               </div>
            </div>
          </div>

          <div className="px-5 py-6">
             <h4 className="text-[0.75rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Frame Overlay</h4>
             <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
                <div className={`min-w-[80px] h-[80px] rounded-2xl flex items-center justify-center border-2 cursor-pointer ${!selectedFrame ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-slate-200 bg-slate-50'}`} onClick={() => setSelectedFrame(null)}>
                   <div className="w-10 h-10 rounded-full border-2 border-slate-300 relative flex items-center justify-center"><div className="w-12 h-[2px] bg-slate-300 rotate-45 absolute" /></div>
                </div>
                {frames.map(frame => (
                   <div key={frame._id} className={`min-w-[80px] h-[80px] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${activeFrame === frame.image ? 'border-indigo-600 scale-95 shadow-lg' : 'border-slate-200 opacity-80'}`} onClick={() => setSelectedFrame(frame.image)}>
                       <img src={frame.image} className="w-full h-full object-fill" />
                   </div>
                ))}
             </div>
          </div>

          <div className="p-5 space-y-8 bg-white border-t border-slate-100 pb-12">
            <button className="w-full h-14 bg-indigo-600 text-white rounded-[1.25rem] text-[0.9rem] font-black uppercase tracking-[0.15em] border-none shadow-xl shadow-indigo-200" onClick={() => onEdit(template)}>
              Edit Poster
            </button>
            <div className="flex justify-between items-center px-2">
              <ActionIcon icon={Video} label="Video" color="#f43f5e" onClick={() => setShowVideoEditor(true)} />
              <ActionIcon icon={Download} label="Save" color="#475569" onClick={handleDownload} />
              <ActionIcon icon={MessageCircle} label="Whatsapp" color="#22c55e" onClick={handleWhatsApp} />
              <ActionIcon icon={Share2} label="Share" color="#f59e0b" onClick={handleWhatsApp} />
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showVideoEditor && (
          <VideoEditor 
            template={template} 
            userData={userData} 
            onClose={() => setShowVideoEditor(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
export default PosterDetail;
