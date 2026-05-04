import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Video, Download, MessageCircle, Share2, 
  Crown, ChevronRight, X, Check, CheckCircle, Sparkles, Heart,
  Smartphone, MousePointer2, Wand2, User, Building2, Image as ImageIcon,
  Mail, Phone, Globe, MapPin, Hash, Palette as PaletteIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { EffectCoverflow } from 'swiper/modules';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import VideoEditor from './VideoEditor';

const BusinessCardEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, setUserData, frames, selectedFrame, setSelectedFrame } = useEditor();
  const { user } = useAuth();
  
  const [templates, setTemplates] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editTab, setEditTab] = useState('personal');
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [capturedCardImage, setCapturedCardImage] = useState(null);
  
  const cardRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
  const [localData, setLocalData] = useState(userData);

  useEffect(() => { setLocalData(userData); }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Step 1: Fetch a batch of templates and find the target template by ID
        const { data: batchData } = await axios.get(`${API_URL}/user/templates?limit=200`);
        const allFetched = batchData.templates || [];
        const initialTpl = allFetched.find(t => t._id === id);

        if (!initialTpl) {
          // Template not found — show empty
          setTemplates([]);
          return;
        }

        // Step 2: Get the subcategory ID from the found template
        const subId = initialTpl?.subcategoryId?._id || initialTpl?.subcategoryId;

        if (subId) {
          // Step 3: Fetch ONLY templates from that same subcategory (business card subcategory)
          const { data: subData } = await axios.get(`${API_URL}/user/templates?subcategory=${subId}&limit=100`);
          const subTemplates = subData.templates || [];
          setTemplates(subTemplates);
          const startIdx = subTemplates.findIndex(t => t._id === id);
          setActiveIndex(startIdx >= 0 ? startIdx : 0);
        } else {
          // No subcategory — show only this one template
          setTemplates([initialTpl]);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error('Fetch BC error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  const activeTemplate = useMemo(() => templates[activeIndex], [templates, activeIndex]);
  const subCategoryName = activeTemplate?.subcategoryId?.name || "Business Cards";

  useEffect(() => {
    if (!templates.length) return;
    const tpl = templates[activeIndex];
    if (tpl?.fields) {
      const data = {
        name: user?.name || '',
        phone_number: user?.phone_number || '',
        email: user?.email || '',
        business_name: user?.business_name || '',
        address: user?.address || '',
        website: user?.website || '',
        designation: user?.designation || '',
        userPhoto: user?.profile_image || '',
        logo: user?.logo || '',
      };

      const initialEnabled = {};
      tpl.fields.forEach(f => {
        initialEnabled[f.key] = true;
      });

      setLocalData(prev => ({
        ...data,
        ...prev,
        enabledFields: { ...initialEnabled, ...prev.enabledFields }
      }));
    }
  }, [templates, activeIndex, user]);

  const handleDownload = async () => {
    if (!cardRef.current || !window.html2canvas) return;
    try {
      const canvas = await window.html2canvas(cardRef.current, { useCORS: true, scale: 4, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `business-card-${activeTemplate?.name || 'design'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) { console.error('Download error:', err); }
  };

  const openVideoEditor = async () => {
    if (!cardRef.current || !window.html2canvas) return;
    try {
      const canvas = await window.html2canvas(cardRef.current, { 
        useCORS: true, 
        scale: 4, 
        backgroundColor: '#ffffff' 
      });
      setCapturedCardImage(canvas.toDataURL('image/png'));
      setShowVideoEditor(true);
    } catch (err) { console.error('Capture for video failed:', err); }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/business-card/editor/${activeTemplate?._id}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Business Card', text: 'Professional Business Card', url: shareUrl }); }
      catch (err) { console.log('Share failed'); }
    } else {
      try { await navigator.clipboard.writeText(shareUrl); alert('Link copied!'); }
      catch (err) { console.error('Copy failed'); }
    }
  };

  const updateField = (key, value) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);
    setUserData(newData);
  };

  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const updateFieldStyle = (key, styleUpdates) => {
    const currentStyles = localData.fieldStyles || {};
    const newData = { 
      ...localData, 
      fieldStyles: { 
        ...currentStyles, 
        [key]: { ...(currentStyles[key] || {}), ...styleUpdates } 
      } 
    };
    setLocalData(newData);
    setUserData(newData);
  };

  const toggleField = (field) => {
    setLocalData(prev => ({
      ...prev,
      enabledFields: { 
        ...prev.enabledFields, 
        [field]: prev.enabledFields?.[field] === false ? true : false 
      }
    }));
  };

  const FONT_OPTIONS = [
    { name: 'Inter', family: "'Inter', sans-serif" },
    { name: 'Outfit', family: "'Outfit', sans-serif" },
    { name: 'Roboto', family: "'Roboto', sans-serif" },
    { name: 'Playfair', family: "'Playfair Display', serif" },
    { name: 'Montserrat', family: "'Montserrat', sans-serif" },
    { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
    { name: 'Quicksand', family: "'Quicksand', sans-serif" },
    { name: 'Poppins', family: "'Poppins', sans-serif" },
  ];

  const COLOR_PALETTE = [
    '#000000', '#FFFFFF', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
    '#6366f1', '#ec4899', '#8b5cf6', '#0ea5e9', '#1e293b', '#64748b'
  ];

  const renderFields = (template) => {
    if (!template?.fields) return null;
    
    // Add virtual fields (like Profile Photo) if enabled but not in template
    const allFields = [...template.fields];
    if (localData.enabledFields?.userPhoto && !allFields.find(f => f.key === 'userPhoto')) {
      allFields.push({
        key: 'userPhoto',
        type: 'image',
        label: 'Profile Photo',
        position: { x: '10%', y: '10%' },
        size: { width: '50px', height: '50px' }
      });
    }

    return allFields.map((field, idx) => {
        if (localData.enabledFields?.[field.key] === false) return null;
        const userValue = localData[field.key] || field.label;
        const customStyle = localData.fieldStyles?.[field.key] || {};
        
        const style = {
          position: 'absolute',
          left: field.position?.x || '0%',
          top: field.position?.y || '0%',
          fontSize: customStyle.fontSize || field.style?.fontSize || '10px',
          color: customStyle.color || field.style?.color || '#000',
          fontWeight: customStyle.fontWeight || field.style?.fontWeight || 'bold',
          width: field.size?.width || 'auto',
          height: field.size?.height || 'auto',
          fontFamily: customStyle.fontFamily || "'Inter', sans-serif",
          transition: 'all 0.2s ease',
          zIndex: field.type === 'image' ? 5 : 10,
        };

        // Relative scaling (Treat px as relative to 800px reference width)
        const SCALE_FACTOR = 6;
        if (typeof style.fontSize === 'string' && style.fontSize.includes('px')) {
            style.fontSize = `${(parseFloat(style.fontSize) / SCALE_FACTOR).toFixed(2)}cqw`;
        }
        if (typeof style.width === 'string' && style.width.includes('px')) {
            style.width = `${(parseFloat(style.width) / SCALE_FACTOR).toFixed(2)}cqw`;
        }
        if (typeof style.height === 'string' && style.height.includes('px')) {
            style.height = `${(parseFloat(style.height) / SCALE_FACTOR).toFixed(2)}cqw`;
        }

        if (field.type === 'image') {
          const imageUrl = localData[field.key] || (field.key === 'logo' ? localData.logo : (field.key === 'userPhoto' ? localData.userPhoto : null));
          return imageUrl ? (
            <img 
              key={idx} 
              src={imageUrl} 
              style={{ ...style, objectFit: 'cover', cursor: 'pointer', borderRadius: field.key === 'userPhoto' ? '50%' : '0%' }} 
              alt={field.label} 
              crossOrigin="anonymous" 
              onClick={(e) => {
                e.stopPropagation();
                setEditTab('logo');
                setIsEditing(true);
              }}
            />
          ) : null;
        }

      const isSelected = selectedField === field.key;

      return (
        <div 
          key={idx} 
          style={{ ...style, whiteSpace: 'nowrap', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedField(field.key);
            setShowStyleEditor(true);
          }}
          className={`group/field relative ${isSelected ? 'ring-2 ring-red-500 ring-offset-2 rounded-sm' : ''}`}
        >
          {userValue}
          {isSelected && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white shadow-2xl rounded-2xl p-1.5 border border-slate-100 z-[100]"
             >
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowStyleEditor(true); }}
                  className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border-none"
                >
                   <PaletteIcon size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedField(null); }}
                  className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors border-none"
                >
                   <X size={14} />
                </button>
             </motion.div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Studio</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col landscape:flex-row overflow-hidden select-none">
      
      {/* 🔴 RED PREMIUM HEADER */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <div className="bg-[#b91c1c] px-4 py-4 flex items-center gap-4 text-white shadow-lg">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none">{subCategoryName} ({templates.length})</h1>
          </div>
        </div>
        <div className="bg-[#fef3c7] px-4 py-2 flex items-center justify-center gap-2 border-b border-amber-100">
           <span className="text-[11px] font-medium text-amber-900">This category has premium posters. <span className="font-bold underline">Upgrade</span></span>
        </div>
      </div>

      {/* 🕹️ MAIN STUDIO AREA */}
      <div className="flex-1 flex flex-col bg-[#f3f4f6] pt-28 pb-36 relative overflow-hidden">
        {/* Subtle Grain Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
          <div className="w-full max-w-[95%] flex items-center justify-center">
            <Swiper
              modules={[EffectCoverflow]}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={activeIndex}
              coverflowEffect={{ rotate: 0, stretch: 0, depth: 40, modifier: 1.2, slideShadows: false }}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full"
            >
              {templates.map((tpl, idx) => (
                <SwiperSlide key={tpl._id} className="flex flex-col items-center justify-center !w-[92%] !h-fit self-center">
                  <div className="relative w-full aspect-[1.75/1] shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden border border-white" style={{ containerType: 'inline-size' }}>
                    <div ref={activeIndex === idx ? cardRef : null} className="relative w-full h-full bg-white">
                      <img src={tpl.image} className="w-full h-full object-cover relative z-0" alt="card-bg" crossOrigin="anonymous" />
                      <div className="absolute inset-0 z-10">{renderFields(tpl)}</div>
                    </div>
                  </div>
                  
                  {/* ❤️ HEART COUNTER (DYNAMIC) */}
                  <div className="mt-4 w-fit bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 text-white border border-white/20">
                    <Heart size={18} fill="white" />
                    <span className="text-[12px] font-bold">{formatCount(tpl.likeCount)}</span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 🚀 COMPACT BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 pb-10 flex items-center justify-between gap-6 z-[110] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-[2.5rem]">
          <button onClick={() => setIsEditing(true)} className="flex-[0.8] py-3.5 bg-slate-900 text-white rounded-2xl text-[14px] font-black tracking-tight active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
            <Edit2 size={18} /> Edit
          </button>
          
          <div className="flex flex-1 justify-around items-center">
            <ActionIcon icon={Video} label="Video" color="text-[#b91c1c]" onClick={openVideoEditor} />
            <ActionIcon icon={Download} label="Save" color="text-[#b91c1c]" onClick={handleDownload} />
            <ActionIcon icon={MessageCircle} label="WhatsApp" color="text-[#22c55e]" onClick={handleShare} />
            <ActionIcon icon={Share2} label="Share" color="text-[#b91c1c]" onClick={handleShare} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showVideoEditor && capturedCardImage && (
          <VideoEditor 
            template={{ ...templates[activeIndex], image: capturedCardImage }}
            userData={{
              ...localData,
              phone_number: localData.phone_number,
              business_name: localData.business_name,
            }}
            onClose={() => setShowVideoEditor(false)}
            isBusinessCard={true}
          />
        )}
        {showEditMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditMenu(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3.5rem] z-[210] p-10 pb-14 shadow-2xl">
               <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
               <h3 className="text-2xl font-black text-[#1e293b] text-center mb-12 uppercase tracking-tight">Customize Poster</h3>
               <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => { setShowEditMenu(false); setIsEditing(true); }} className="aspect-square bg-[#f8fafc] rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border-none hover:bg-slate-100 transition-all group">
                    <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform"><User size={32} className="text-[#1e293b]" /></div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-[#1e293b]">Edit Identity</span>
                  </button>
                  <button onClick={() => { setShowEditMenu(false); setSelectedField(templates[activeIndex]?.fields?.[0]?.key); setShowStyleEditor(true); }} className="aspect-square bg-[#f8fafc] rounded-[2.5rem] flex flex-col items-center justify-center gap-4 border-none hover:bg-slate-100 transition-all group">
                    <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform"><PaletteIcon size={32} className="text-[#1e293b]" /></div>
                    <span className="text-[11px] font-black uppercase tracking-tight text-[#1e293b]">Edit Styles</span>
                  </button>
               </div>
               <button onClick={() => setShowEditMenu(false)} className="w-full mt-12 py-4 text-[#64748b] font-black uppercase tracking-widest border-none bg-transparent text-sm">Cancel</button>
            </motion.div>
          </>
        )}

        {showStyleEditor && selectedField && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStyleEditor(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[310] p-6 shadow-2xl flex flex-col max-h-[70vh]">
               <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-4" />
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-[#1e293b] tracking-tight">Typography & Colors</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Editing: {selectedField.replace('_', ' ')}</p>
                  </div>
                  <button onClick={() => setShowStyleEditor(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border-none group active:scale-90 transition-all"><X size={20} /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-6 pb-6 scrollbar-hide">
                  <section>
                    <div className="grid grid-cols-2 gap-3">
                      {FONT_OPTIONS.slice(activeIndex % 2 === 0 ? 0 : 2, (activeIndex % 2 === 0 ? 0 : 2) + 2).map(font => (
                        <button 
                          key={font.name}
                          onClick={() => updateFieldStyle(selectedField, { fontFamily: font.family })}
                          className={`p-4 rounded-2xl border-[2px] transition-all text-center ${localData.fieldStyles?.[selectedField]?.fontFamily === font.family ? 'border-red-500 bg-red-50/10' : 'border-[#f8fafc] bg-[#f8fafc]'}`}
                          style={{ fontFamily: font.family }}
                        >
                          <span className="text-[14px] font-bold text-[#1e293b]">{font.name}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-1">Choose Color</label>
                    <div className="grid grid-cols-6 gap-3 place-items-center">
                      {COLOR_PALETTE.map(color => (
                        <button 
                          key={color}
                          onClick={() => updateFieldStyle(selectedField, { color })}
                          className={`w-10 h-10 rounded-full border-[3px] shadow-sm transition-all ${localData.fieldStyles?.[selectedField]?.color === color ? 'border-red-500 scale-110 shadow-lg' : 'border-white'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 px-1">Font Size</label>
                    <div className="flex items-center gap-4 bg-[#f8fafc] p-4 rounded-2xl">
                       <input 
                         type="range" 
                         min="6" 
                         max="48" 
                         value={parseInt(localData.fieldStyles?.[selectedField]?.fontSize || '12')}
                         onChange={(e) => updateFieldStyle(selectedField, { fontSize: `${e.target.value}px` })}
                         className="flex-1 accent-red-500"
                       />
                       <span className="text-[14px] font-black text-[#1e293b] w-10">{localData.fieldStyles?.[selectedField]?.fontSize || '12px'}</span>
                    </div>
                  </section>
               </div>
               
               <button onClick={() => setShowStyleEditor(false)} className="w-full bg-red-500 text-white py-4 rounded-[2rem] text-[14px] font-black uppercase tracking-widest border-none shadow-xl shadow-red-500/25 active:scale-95 transition-all mt-4">Done</button>
            </motion.div>
          </>
        )}

        {isEditing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-[210] flex flex-col h-[90vh] shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
               
               {/* Header */}
               <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                  <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 bg-transparent border-none outline-none"><X size={20} /></button>
                  <h2 className="text-[17px] font-bold text-[#1e293b]">Edit Poster</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 bg-transparent border-none outline-none"><Check size={20} /></button>
               </div>

               {/* Main Tabs */}
               <div className="flex px-4 border-b border-slate-50">
                  <button onClick={() => setEditTab('text')} className={`flex-1 py-4 flex items-center justify-center gap-2 border-none bg-transparent relative transition-all ${editTab === 'text' || editTab === 'personal' || editTab === 'business' ? 'text-red-500' : 'text-slate-400'}`}>
                     <span className="text-[16px] font-bold">T Text</span>
                     {(editTab === 'text' || editTab === 'personal' || editTab === 'business') && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                  </button>
                  <button onClick={() => setEditTab('logo')} className={`flex-1 py-4 flex items-center justify-center gap-2 border-none bg-transparent relative transition-all ${editTab === 'logo' ? 'text-red-500' : 'text-slate-400'}`}>
                     <ImageIcon size={20} />
                     <span className="text-[16px] font-bold">Photo / Logo</span>
                     {editTab === 'logo' && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto bg-white">
                  {editTab !== 'logo' && (
                    <div className="px-6 py-4 space-y-6">
                      {/* Sub-tabs / Pills */}
                      <div className="flex gap-3 mb-6">
                         {['Personal', 'Misc', 'Business'].map(tab => (
                           <button 
                             key={tab} 
                             onClick={() => setEditTab(tab.toLowerCase())}
                             className={`px-6 py-2 rounded-full border border-slate-200 text-sm font-bold transition-all ${editTab === tab.toLowerCase() ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-500'}`}
                           >
                             {tab}
                           </button>
                         ))}
                      </div>

                      {/* Highlight Box */}
                      <div className="bg-[#eff6ff] border border-blue-200 rounded-3xl p-6 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="text-blue-600"><span className="text-2xl font-bold">T</span></div>
                            <div className="flex flex-col">
                               <span className="text-[15px] font-bold text-slate-800">Add Extra Text</span>
                               <span className="text-[11px] text-slate-500">You can add up to 5 texts</span>
                            </div>
                         </div>
                         <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold border-none">Add Text</button>
                      </div>

                      {/* Fields */}
                      <div className="space-y-6 pb-10">
                         {editTab === 'personal' && (
                           <>
                             <InputField label="Name" value={localData.name} charLimit="25" onChange={(v) => updateField('name', v)} enabled={localData.enabledFields?.name} onToggle={() => toggleField('name')} />
                             <InputField label="Mobile" value={localData.phone_number} charLimit="25" onChange={(v) => updateField('phone_number', v)} enabled={localData.enabledFields?.phone} onToggle={() => toggleField('phone')} />
                             <InputField label="Email (Optional)" value={localData.email} charLimit="35" onChange={(v) => updateField('email', v)} enabled={localData.enabledFields?.email} onToggle={() => toggleField('email')} />
                           </>
                         )}
                         {editTab === 'business' && (
                           <>
                             <InputField label="Business Name" value={localData.business_name} charLimit="30" onChange={(v) => updateField('business_name', v)} enabled={localData.enabledFields?.business_name} onToggle={() => toggleField('business_name')} />
                             <InputField label="Address" value={localData.address} charLimit="100" isTextArea onChange={(v) => updateField('address', v)} enabled={localData.enabledFields?.address} onToggle={() => toggleField('address')} />
                           </>
                         )}
                      </div>
                    </div>
                  )}

                  {editTab === 'logo' && (
                    <div className="px-6 py-4 space-y-6">
                       {/* Highlight Box Yellow */}
                       <div className="bg-[#fffbeb] border border-amber-200 rounded-3xl p-6 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="text-amber-500"><ImageIcon size={24} /></div>
                            <div className="flex flex-col">
                               <span className="text-[15px] font-bold text-slate-800">Add Extra Photos</span>
                               <span className="text-[11px] text-slate-500">You can add up to 5 photos</span>
                            </div>
                         </div>
                         <button className="bg-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold border-none">Add Photo</button>
                      </div>

                      <div className="space-y-4 pb-10">
                         <LogoUpload label="Profile Photo" desc="Place it anywhere on the screen" value={localData.userPhoto} onChange={(v) => updateField('userPhoto', v)} enabled={localData.enabledFields?.userPhoto} onToggle={() => toggleField('userPhoto')} isCircle />
                         <LogoUpload label="Logo" desc="Place it anywhere on the screen" value={localData.logo} onChange={(v) => updateField('logo', v)} enabled={localData.enabledFields?.logo} onToggle={() => toggleField('logo')} />
                         <LogoUpload label="Stickers" desc="Place it anywhere on the screen" value={null} onChange={() => {}} enabled={false} isSticker />
                      </div>
                    </div>
                  )}
               </div>

               {/* Footer */}
               <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
                  <button onClick={() => setIsEditing(false)} className="text-red-500 text-[17px] font-bold bg-transparent border-none">Cancel</button>
                  <button onClick={() => setIsEditing(false)} className="bg-red-500 text-white px-12 py-4 rounded-2xl text-[17px] font-bold border-none shadow-lg shadow-red-500/20 active:scale-95 transition-all">Save</button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@400;700;900&family=Roboto:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Space+Grotesk:wght@400;700;900&family=Quicksand:wght@400;700&family=Poppins:wght@400;700;900&display=swap');
        .swiper-slide { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.3; filter: blur(2px); }
        .swiper-slide-active { opacity: 1; transform: scale(1.05); filter: blur(0px); }
      `}} />
    </div>
  );
};

const ActionIcon = ({ icon: Icon, label, color, onClick, className = "" }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 border-none bg-transparent transition-all active:scale-90 ${className}`}>
    <div className={`p-1 ${color}`}>
      <Icon size={24} strokeWidth={2} />
    </div>
    <span className={`text-[10px] font-bold text-slate-400 tracking-tight`}>{label}</span>
  </button>
);

const InputField = ({ label, value, charLimit, onChange, isTextArea = false, enabled = true, onToggle }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between px-1">
      <label className="text-[14px] font-bold text-slate-700">{label}</label>
      {charLimit && <span className="text-[12px] text-slate-400 font-medium">{value?.length || 0} / {charLimit}</span>}
    </div>
    <div className="flex items-center gap-4">
      {isTextArea ? (
        <textarea rows={3} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none text-[15px] font-medium text-slate-800 resize-none focus:border-red-200" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none text-[15px] font-medium text-slate-800 focus:border-red-200" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
      <button onClick={onToggle} className={`w-6 h-6 rounded flex items-center justify-center border-[2px] transition-all ${enabled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-slate-300 text-transparent'}`}>
        <Check size={14} strokeWidth={4} />
      </button>
    </div>
  </div>
);

const LogoUpload = ({ label, desc, value, onChange, enabled, onToggle, isCircle = false, isSticker = false }) => (
  <div className="flex items-center justify-between py-4 group">
    <div className="flex items-center gap-4 flex-1">
      <div className={`w-16 h-16 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 ${isCircle || isSticker ? 'rounded-full' : 'rounded-lg border border-slate-200'}`}>
        {isSticker ? (
          <div className="w-10 h-10 rounded-full border-2 border-red-100 flex items-center justify-center text-red-500 bg-red-50/50">😊</div>
        ) : value ? (
          <img src={value} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="text-slate-300" size={24} />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-slate-800">{label}</span>
        {desc && <span className="text-[11px] text-slate-400 font-medium">{desc}</span>}
        {!isSticker && (
          <label className="mt-1.5 inline-block bg-amber-400 text-amber-900 px-6 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer shadow-sm active:scale-95 transition-all text-center w-fit">
            Change
            <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = (ev) => onChange(ev.target.result); r.readAsDataURL(f); } }} />
          </label>
        )}
        {isSticker && (
          <button className="mt-1.5 inline-block bg-amber-400 text-amber-900 px-8 py-1.5 rounded-lg text-[12px] font-bold border-none shadow-sm active:scale-95 transition-all w-fit">
            Add
          </button>
        )}
      </div>
    </div>
    <button onClick={onToggle} className={`w-6 h-6 rounded flex items-center justify-center border-[2px] transition-all ${enabled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-slate-300 text-transparent'}`}>
      <Check size={14} strokeWidth={4} />
    </button>
  </div>
);

export default BusinessCardEditor;
