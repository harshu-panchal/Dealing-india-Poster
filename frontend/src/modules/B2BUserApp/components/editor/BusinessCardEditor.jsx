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

  const handleWhatsApp = () => {
    const platformLink = window.location.origin;
    // Use backend share URL for better social media previews
    const shareLink = `${window.location.origin}/business-card/editor/${activeTemplate?._id}`;
    const message = `Check out this professional digital business card! 📱✨\n\nEdit yours here: ${shareLink}\n\nCreate your own with Dealingindia Poster!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async () => {
    // Use backend share URL for better social media previews
    const shareLink = `${window.location.origin}/business-card/editor/${activeTemplate?._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Professional Business Card',
          text: 'Check out this professional business card from Dealingindia Poster!',
          url: shareLink,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      handleWhatsApp();
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
    <div className="fixed inset-0 z-[9999] bg-[#f8fafc] flex flex-col overflow-hidden select-none">
      
      {/* 🔴 RED PREMIUM HEADER */}
      <header className="h-16 bg-[#b91c1c] px-4 lg:px-8 flex items-center justify-between text-white shadow-lg shrink-0 z-[120]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors border-none bg-transparent text-white cursor-pointer">
            <ArrowLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base lg:text-lg font-black tracking-tight leading-none uppercase">{subCategoryName}</h1>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">Template Registry • {templates.length} Designs</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
           <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-widest">Premium Active</span>
           </div>
           <button onClick={() => window.open('https://www.dealingindia.com/landing', '_blank')} className="bg-white text-rose-600 px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-none shadow-lg active:scale-95 transition-all">
              Upgrade
           </button>
        </div>
      </header>

      {/* 🕹️ MAIN STUDIO AREA */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* COLUMN 1: Design Library (Hidden on Mobile, Grid on Desktop) */}
        <aside className="hidden lg:flex w-[300px] flex-col bg-white border-r border-slate-200 overflow-hidden shadow-sm z-30">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Crown size={14} className="text-amber-500" />
               Studio Assets
             </h3>
             <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-100">
               {templates.length}
             </span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/20">
             {templates.map((tpl, idx) => (
               <div 
                 key={tpl._id}
                 onClick={() => setActiveIndex(idx)}
                 className={`group relative aspect-[1.75/1] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-[3px] shadow-sm ${activeIndex === idx ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-transparent hover:border-slate-300 hover:shadow-md'}`}
               >
                 <img src={tpl.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                 <div className={`absolute inset-0 transition-opacity duration-300 ${activeIndex === idx ? 'bg-rose-500/5 opacity-100' : 'bg-black/0 group-hover:bg-black/5'}`} />
                 {activeIndex === idx && (
                   <div className="absolute top-2 right-2">
                      <div className="bg-rose-500 text-white rounded-full p-1 shadow-lg">
                         <Check size={12} strokeWidth={4} />
                      </div>
                   </div>
                 )}
               </div>
             ))}
          </div>
        </aside>

        {/* COLUMN 2: Workspace (Center) */}
        <main className="flex-1 bg-[#f1f5f9] relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 lg:p-16">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <div className="w-full max-w-[800px] relative z-10 flex flex-col items-center">
            {/* Desktop-only template title */}
            <div className="hidden md:flex w-full mb-10 items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Workspace Active</span>
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeTemplate?.name || 'Professional Design'}</h2>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all">
                    <Edit2 size={14} className="text-rose-500" /> Identity
                 </button>
                 <button onClick={() => { setSelectedField(activeTemplate?.fields?.[0]?.key); setShowStyleEditor(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all">
                    <PaletteIcon size={14} className="text-rose-500" /> Styles
                 </button>
              </div>
            </div>

            {/* Mobile-only Swiper */}
            <div className="w-full md:hidden">
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
                    <div className="relative w-full aspect-[1.75/1] shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden border-4 border-white" style={{ containerType: 'inline-size' }}>
                      <div ref={activeIndex === idx ? cardRef : null} className="relative w-full h-full bg-white">
                        <img src={tpl.image} className="w-full h-full object-cover relative z-0" alt="card-bg" crossOrigin="anonymous" />
                        <div className="absolute inset-0 z-10">{renderFields(tpl)}</div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop Preview */}
            <div className="hidden md:block w-full group relative">
              <div 
                ref={cardRef}
                className="w-full aspect-[1.75/1] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden rounded-[2.5rem] border-[12px] border-white transition-all group-hover:scale-[1.01]"
                style={{ containerType: 'inline-size' }}
              >
                <img src={activeTemplate?.image} className="w-full h-full object-cover relative z-0" alt="card-bg" crossOrigin="anonymous" />
                <div className="absolute inset-0 z-10">{renderFields(activeTemplate)}</div>
              </div>
              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                 Click fields to customize typography
              </div>
            </div>

            {/* Pagination hint for desktop */}
            <div className="hidden md:flex mt-16 items-center gap-6">
               <button 
                 onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                 disabled={activeIndex === 0}
                 className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all disabled:opacity-30 shadow-sm"
               >
                 <ArrowLeft size={20} />
               </button>
               <div className="flex gap-2">
                  {templates.slice(Math.max(0, activeIndex - 2), Math.min(templates.length, activeIndex + 3)).map((_, i) => {
                    const realIdx = templates.indexOf(_);
                    return (
                      <div key={realIdx} className={`h-1.5 rounded-full transition-all ${realIdx === activeIndex ? 'w-8 bg-rose-500' : 'w-2 bg-slate-300'}`} />
                    );
                  })}
               </div>
               <button 
                 onClick={() => setActiveIndex(prev => Math.min(templates.length - 1, prev + 1))}
                 disabled={activeIndex === templates.length - 1}
                 className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all disabled:opacity-30 shadow-sm"
               >
                 <ChevronRight size={20} />
               </button>
            </div>
          </div>
        </main>

        {/* COLUMN 3: Identity Panel (Desktop-only persistent) */}
        <aside className="hidden lg:flex w-[380px] flex-col bg-white border-l border-slate-200 overflow-hidden shadow-[-10px_0_40px_rgba(0,0,0,0.02)] z-30">
          <div className="p-8 border-b border-slate-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <User size={18} />
             </div>
             <div>
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Personalize</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Real-time Data Sync</p>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
             <section className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                   Quick Assets
                </h4>
                <div className="space-y-6">
                   <LogoUploadCompact label="Company Logo" value={localData.logo} onChange={(v) => updateField('logo', v)} />
                   <LogoUploadCompact label="Profile Photo" value={localData.userPhoto} onChange={(v) => updateField('userPhoto', v)} isCircle />
                </div>
             </section>

             <section className="space-y-5">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                   Identity Info
                </h4>
                <div className="space-y-4">
                   <InputFieldCompact label="Full Name" value={localData.name} onChange={(v) => updateField('name', v)} />
                   <InputFieldCompact label="Designation" value={localData.designation} onChange={(v) => updateField('designation', v)} />
                   <InputFieldCompact label="Mobile Number" value={localData.phone_number} onChange={(v) => updateField('phone_number', v)} />
                   <InputFieldCompact label="Email Address" value={localData.email} onChange={(v) => updateField('email', v)} />
                   <InputFieldCompact label="Business Name" value={localData.business_name} onChange={(v) => updateField('business_name', v)} />
                </div>
             </section>
          </div>
          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
             <button onClick={handleDownload} className="w-full h-14 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Download size={18} /> Download Design
             </button>
          </div>
        </aside>

        {/* 🚀 MOBILE ACTION BAR */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 pb-10 flex items-center justify-between gap-6 z-[110] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] rounded-t-[2.5rem]">
          <button onClick={() => setIsEditing(true)} className="flex-[0.8] py-3.5 bg-slate-900 text-white rounded-2xl text-[14px] font-black tracking-tight active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
            <Edit2 size={18} /> Edit
          </button>
          
          <div className="flex flex-1 justify-around items-center">
            <ActionIcon icon={Video} label="Video" color="text-[#b91c1c]" onClick={openVideoEditor} />
            <ActionIcon icon={Download} label="Save" color="text-[#b91c1c]" onClick={handleDownload} />
            <ActionIcon icon={MessageCircle} label="WhatsApp" color="text-[#22c55e]" onClick={handleWhatsApp} />
            <ActionIcon icon={Share2} label="Share" color="text-[#b91c1c]" onClick={handleShare} />
          </div>
        </div>

        {/* 🚀 DESKTOP FLOATING ACTIONS (Alternative to mobile bar) */}
        <div className="hidden md:flex lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] px-8 py-4 items-center gap-10 z-[110]">
           <ActionIcon icon={Video} label="Video" color="text-[#b91c1c]" onClick={openVideoEditor} />
           <ActionIcon icon={Download} label="Save" color="text-[#b91c1c]" onClick={handleDownload} />
           <ActionIcon icon={MessageCircle} label="WhatsApp" color="text-[#22c55e]" onClick={handleWhatsApp} />
           <ActionIcon icon={Share2} label="Share" color="text-[#b91c1c]" onClick={handleShare} />
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowEditMenu(false)} 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3.5rem] z-[210] p-10 pb-14 shadow-2xl"
            >
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowStyleEditor(false)} 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]" 
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-10 lg:bottom-10 lg:w-[400px] lg:rounded-[2.5rem] bg-white rounded-t-[2.5rem] z-[1010] p-6 shadow-2xl flex flex-col max-h-[70vh]"
            >
               <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-4" />
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-[#1e293b] tracking-tight">Typography & Colors</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Editing: {selectedField.replace('_', ' ')}</p>
                  </div>
                  <button onClick={() => setShowStyleEditor(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border-none group active:scale-90 transition-all cursor-pointer"><X size={20} /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto space-y-6 pb-6 scrollbar-hide">
                  <section>
                    <div className="grid grid-cols-2 gap-3">
                      {FONT_OPTIONS.map(font => (
                        <button 
                          key={font.name}
                          onClick={() => updateFieldStyle(selectedField, { fontFamily: font.family })}
                          className={`p-4 rounded-2xl border-[2px] transition-all text-center border-none cursor-pointer ${localData.fieldStyles?.[selectedField]?.fontFamily === font.family ? 'bg-red-500 text-white' : 'bg-[#f8fafc] text-slate-600'}`}
                          style={{ fontFamily: font.family }}
                        >
                          <span className="text-[14px] font-bold">{font.name}</span>
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
                          className={`w-10 h-10 rounded-full border-[3px] shadow-sm transition-all border-none cursor-pointer ${localData.fieldStyles?.[selectedField]?.color === color ? 'ring-4 ring-red-500/20 scale-110 shadow-lg' : ''}`}
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
                         max="100" 
                         value={parseInt(localData.fieldStyles?.[selectedField]?.fontSize || '12')}
                         onChange={(e) => updateFieldStyle(selectedField, { fontSize: `${e.target.value}px` })}
                         className="flex-1 accent-red-500"
                       />
                       <span className="text-[14px] font-black text-[#1e293b] w-10">{localData.fieldStyles?.[selectedField]?.fontSize || '12px'}</span>
                    </div>
                  </section>
               </div>
               
               <button onClick={() => setShowStyleEditor(false)} className="w-full bg-red-500 text-white py-4 rounded-[2rem] text-[14px] font-black uppercase tracking-widest border-none shadow-xl shadow-red-500/25 active:scale-95 transition-all mt-4 cursor-pointer">Done</button>
            </motion.div>
          </>
        )}

        {isEditing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsEditing(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" 
            />
            <motion.div 
              initial={{ y: '100%', x: 0 }} 
              animate={{ 
                y: 0, 
                x: 0 
              }} 
              exit={{ 
                y: window.innerWidth >= 1024 ? 0 : '100%',
                x: window.innerWidth >= 1024 ? '100%' : 0
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }} 
              className="fixed bottom-0 left-0 right-0 lg:left-auto lg:top-0 lg:bottom-0 lg:w-[480px] bg-white rounded-t-[2rem] lg:rounded-t-none lg:rounded-l-[3rem] z-[210] flex flex-col h-[90vh] lg:h-full shadow-[0_-20px_60px_rgba(0,0,0,0.2)] lg:shadow-[-20px_0_60px_rgba(0,0,0,0.1)]"
            >
               {/* Drawer Header */}
               <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100 shrink-0">
                  <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 bg-transparent border-none outline-none cursor-pointer hover:bg-slate-50 rounded-full transition-colors"><X size={24} /></button>
                  <div className="text-center">
                    <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">Personalize Identity</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Advanced Studio Editor</p>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="p-2 text-emerald-500 bg-transparent border-none outline-none cursor-pointer hover:bg-emerald-50 rounded-full transition-colors"><Check size={24} /></button>
               </div>

               {/* Drawer Tabs */}
               <div className="flex px-6 border-b border-slate-50 shrink-0 bg-slate-50/30">
                  <button onClick={() => setEditTab('text')} className={`flex-1 py-5 flex items-center justify-center gap-3 border-none bg-transparent relative transition-all cursor-pointer ${editTab === 'text' || editTab === 'personal' || editTab === 'business' ? 'text-rose-600' : 'text-slate-400'}`}>
                     <Edit2 size={18} />
                     <span className="text-[15px] font-black uppercase tracking-widest">Text Info</span>
                     {(editTab === 'text' || editTab === 'personal' || editTab === 'business') && <motion.div layoutId="tabLineEdit" className="absolute bottom-0 left-6 right-6 h-1 bg-rose-600 rounded-full" />}
                  </button>
                  <button onClick={() => setEditTab('logo')} className={`flex-1 py-5 flex items-center justify-center gap-3 border-none bg-transparent relative transition-all cursor-pointer ${editTab === 'logo' ? 'text-rose-600' : 'text-slate-400'}`}>
                     <ImageIcon size={18} />
                     <span className="text-[15px] font-black uppercase tracking-widest">Branding</span>
                     {editTab === 'logo' && <motion.div layoutId="tabLineEdit" className="absolute bottom-0 left-6 right-6 h-1 bg-rose-600 rounded-full" />}
                  </button>
               </div>

               {/* Drawer Content Area */}
               <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                  {editTab !== 'logo' && (
                    <div className="p-8 space-y-10">
                      {/* Sub-tabs Selection */}
                      <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                         {['Personal', 'Business'].map(tab => (
                           <button 
                             key={tab} 
                             onClick={() => setEditTab(tab.toLowerCase())}
                             className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${editTab === tab.toLowerCase() ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 bg-transparent hover:text-slate-600'}`}
                           >
                             {tab}
                           </button>
                         ))}
                      </div>

                      {/* Fields Container */}
                      <div className="space-y-8 pb-10">
                         {editTab === 'personal' && (
                           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <InputField label="Full Name" value={localData.name} charLimit="25" onChange={(v) => updateField('name', v)} enabled={localData.enabledFields?.name} onToggle={() => toggleField('name')} />
                             <InputField label="Designation" value={localData.designation} charLimit="25" onChange={(v) => updateField('designation', v)} enabled={localData.enabledFields?.designation} onToggle={() => toggleField('designation')} />
                             <InputField label="Mobile Number" value={localData.phone_number} charLimit="15" onChange={(v) => updateField('phone_number', v)} enabled={localData.enabledFields?.phone} onToggle={() => toggleField('phone')} />
                             <InputField label="Email Address" value={localData.email} charLimit="35" onChange={(v) => updateField('email', v)} enabled={localData.enabledFields?.email} onToggle={() => toggleField('email')} />
                           </div>
                         )}
                         {editTab === 'business' && (
                           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <InputField label="Business Name" value={localData.business_name} charLimit="30" onChange={(v) => updateField('business_name', v)} enabled={localData.enabledFields?.business_name} onToggle={() => toggleField('business_name')} />
                             <InputField label="Address" value={localData.address} charLimit="120" isTextArea onChange={(v) => updateField('address', v)} enabled={localData.enabledFields?.address} onToggle={() => toggleField('address')} />
                             <InputField label="Website URL" value={localData.website} charLimit="50" onChange={(v) => updateField('website', v)} enabled={localData.enabledFields?.website} onToggle={() => toggleField('website')} />
                           </div>
                         )}
                      </div>
                    </div>
                  )}

                  {editTab === 'logo' && (
                    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100 flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                            <Sparkles size={24} />
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Pro Branding</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-Resolution Support Active</p>
                         </div>
                      </div>

                      <div className="space-y-8 pb-10">
                         <LogoUpload label="Identity Photo" desc="Circular profile shot recommended" value={localData.userPhoto} onChange={(v) => updateField('userPhoto', v)} enabled={localData.enabledFields?.userPhoto} onToggle={() => toggleField('userPhoto')} isCircle />
                         <LogoUpload label="Corporate Logo" desc="Transparent PNG (High Quality)" value={localData.logo} onChange={(v) => updateField('logo', v)} enabled={localData.enabledFields?.logo} onToggle={() => toggleField('logo')} />
                      </div>
                    </div>
                  )}
               </div>

               {/* Drawer Footer */}
               <div className="px-10 py-8 border-t border-slate-100 flex items-center gap-6 bg-white shrink-0">
                  <button onClick={() => setIsEditing(false)} className="flex-1 h-14 bg-slate-50 text-slate-400 text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl border-none cursor-pointer hover:bg-slate-100 transition-all">Cancel</button>
                  <button onClick={() => setIsEditing(false)} className="flex-[2] h-14 bg-rose-600 text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-2xl border-none shadow-xl shadow-rose-600/20 active:scale-95 transition-all cursor-pointer">Confirm Changes</button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@400;700;900&family=Roboto:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Space+Grotesk:wght@400;700;900&family=Quicksand:wght@400;700&family=Poppins:wght@400;700;900&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

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

const InputFieldCompact = ({ label, value, onChange }) => (
  <div className="group">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block group-focus-within:text-rose-500 transition-colors">{label}</label>
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-focus-within:border-rose-500/40 group-focus-within:bg-white group-focus-within:shadow-[0_15px_30px_rgba(225,29,72,0.08)] transition-all">
      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label}...`}
        className="w-full border-none p-0 bg-transparent text-[13px] font-black text-slate-800 focus:outline-none placeholder:text-slate-300"
      />
    </div>
  </div>
);

const LogoUploadCompact = ({ label, value, onChange, isCircle = false }) => (
  <div className="group">
    <div className="flex items-center justify-between mb-3">
      <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</label>
      {value && <CheckCircle size={14} className="text-emerald-500" />}
    </div>
    <div className="flex items-center gap-5">
      <div className={`w-16 h-16 bg-slate-50 border-[3px] border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-rose-500/40 ${value ? 'border-solid border-rose-500 shadow-lg shadow-rose-500/10' : ''} ${isCircle ? 'rounded-full' : 'rounded-2xl'}`}>
        {value ? (
          <img src={value} className="w-full h-full object-cover" alt="" />
        ) : (
          <ImageIcon size={20} className="text-slate-200" />
        )}
      </div>
      <label className="flex-1">
        <div className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-center uppercase tracking-widest shadow-sm">
          {value ? 'Update' : 'Upload'}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => onChange(reader.result);
              reader.readAsDataURL(file);
            }
          }}
        />
      </label>
    </div>
  </div>
);

export default BusinessCardEditor;

<style dangerouslySetInnerHTML={{ __html: `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@400;700;900&family=Roboto:wght@400;700;900&family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Space+Grotesk:wght@400;700;900&family=Quicksand:wght@400;700&family=Poppins:wght@400;700;900&display=swap');
  
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

  .swiper-slide { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.3; filter: blur(2px); }
  .swiper-slide-active { opacity: 1; transform: scale(1.05); filter: blur(0px); }
`}} />
