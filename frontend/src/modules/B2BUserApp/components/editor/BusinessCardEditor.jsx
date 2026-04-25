import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Video, Download, MessageCircle, Share2, 
  Crown, ChevronRight, X, Check, CheckCircle, Sparkles, Heart,
  Smartphone, MousePointer2, Wand2, User, Building2, Image as ImageIcon,
  Mail, Phone, Globe, MapPin, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { EffectCoverflow } from 'swiper/modules';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';

const BusinessCardEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, setUserData, frames, selectedFrame, setSelectedFrame } = useEditor();
  const { user } = useAuth();
  
  const [templates, setTemplates] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState('personal');
  
  const cardRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
  const [localData, setLocalData] = useState(userData);

  useEffect(() => { setLocalData(userData); }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: initialTplData } = await axios.get(`${API_URL}/user/templates?id=${id}`);
        const initialTpl = Array.isArray(initialTplData.templates) ? initialTplData.templates[0] : initialTplData.templates;
        const subId = initialTpl?.subcategoryId?._id || initialTpl?.subcategoryId;
        
        if (subId) {
          const { data: categoryData } = await axios.get(`${API_URL}/user/templates?subcategory=${subId}&limit=100`);
          const allTemplates = categoryData.templates || [];
          setTemplates(allTemplates);
          const startIdx = allTemplates.findIndex(t => t._id === id);
          setActiveIndex(startIdx >= 0 ? startIdx : 0);
        } else {
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
  }, []);

  const activeTemplate = useMemo(() => templates[activeIndex], [templates, activeIndex]);
  const subCategoryName = activeTemplate?.subcategoryId?.name || "Business Cards";

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

  const toggleField = (field) => {
    const newData = { ...localData, enabledFields: { ...localData.enabledFields, [field]: !localData.enabledFields?.[field] } };
    setLocalData(newData);
    setUserData(newData);
  };

  const renderFields = (template) => {
    if (!template?.fields) return null;
    return template.fields.map((field, idx) => {
      if (!localData.enabledFields?.[field.key] && localData.enabledFields?.[field.key] !== undefined) return null;
      const userValue = localData[field.key] || field.label;
      const style = {
        position: 'absolute',
        left: field.position?.x || '0%',
        top: field.position?.y || '0%',
        fontSize: field.style?.fontSize || '10px',
        color: field.style?.color || '#000',
        fontWeight: field.style?.fontWeight || 'bold',
        width: field.size?.width || 'auto',
        height: field.size?.height || 'auto',
        fontFamily: "'Inter', sans-serif",
      };
      if (field.type === 'image') {
        const imageUrl = localData[field.key] || (field.key === 'logo' ? localData.logo : null);
        return imageUrl ? (
          <img key={idx} src={imageUrl} style={{ ...style, objectFit: 'contain' }} alt={field.label} crossOrigin="anonymous" />
        ) : null;
      }
      return <div key={idx} style={{ ...style, whiteSpace: 'nowrap' }}>{userValue}</div>;
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
      
      {/* 💎 UNIFIED WHITE HEADER */}
      <div className="bg-white border-b border-slate-100 px-5 pt-10 pb-6 landscape:pt-10 landscape:w-[280px] landscape:h-full flex landscape:flex-col items-center portrait:justify-between landscape:justify-start gap-6 shadow-sm shrink-0 z-[100]">
        <div className="flex landscape:flex-col items-center gap-4 landscape:w-full">
          <div onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </div>
          <div className="flex flex-col landscape:items-center landscape:text-center">
            <h1 className="text-xl landscape:text-lg font-black text-slate-800 tracking-tight leading-none">{subCategoryName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1.5">{templates.length} Designs Available</p>
          </div>
        </div>
        <div className="bg-amber-400 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xl shadow-amber-500/10 landscape:mt-auto landscape:mb-10">
           <Crown size={16} fill="white" className="text-white" />
           <span className="text-[0.7rem] font-black text-white uppercase tracking-tighter">Upgrade</span>
        </div>
      </div>

      {/* 🕹️ MAIN STUDIO AREA */}
      <div className="flex-1 flex flex-col bg-[#fafafa] relative overflow-hidden">
        
        <div className="bg-white px-6 py-2.5 text-[0.7rem] font-bold border-b border-slate-50 flex items-center justify-center gap-2 shrink-0">
          <Sparkles size={12} className="text-red-500" />
          <span className="text-slate-400 uppercase tracking-widest">Swipe for more designs • {activeIndex + 1}/{templates.length}</span>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0 relative py-4 lg:py-12">
          <div className="w-full h-full max-w-[95%] lg:max-w-[80%] flex items-center justify-center">
            <Swiper
              modules={[EffectCoverflow]}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={activeIndex}
              coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: false }}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full h-full"
            >
              {templates.map((tpl, idx) => (
                <SwiperSlide key={tpl._id} className="flex items-center justify-center !w-[85%] landscape:!w-[65%] !h-fit self-center">
                  <div className="relative w-full aspect-[1.75/1] group">
                    <div ref={activeIndex === idx ? cardRef : null} className="relative w-full h-full bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden border-[4px] lg:border-[8px] border-white ring-1 ring-slate-100">
                      <img src={tpl.image} className="w-full h-full object-cover relative z-0" alt="card-bg" crossOrigin="anonymous" />
                      <div className="absolute inset-0 z-10 pointer-events-none">{renderFields(tpl)}</div>
                    </div>
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border border-slate-50">
                        <Heart size={20} className="text-red-500" fill="currentColor" />
                        <span className="text-[0.5rem] lg:text-[0.6rem] font-black text-slate-400 mt-0.5">5.3K</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 🚀 ACTION BAR (PRO UI) */}
        <div className="bg-white border-t landscape:border-t-0 landscape:border-l border-slate-50 px-6 pt-6 pb-10 landscape:pb-6 landscape:w-[130px] landscape:fixed landscape:right-0 landscape:top-0 landscape:bottom-0 landscape:flex-col flex items-center justify-between gap-4 shrink-0 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-[110]">
          <div className="flex landscape:flex-col gap-4 items-center">
            <button onClick={() => setIsEditing(true)} className="w-[85px] h-[110px] landscape:w-full landscape:h-auto landscape:aspect-square bg-[#121212] text-white rounded-[2.5rem] landscape:rounded-2xl flex flex-col items-center justify-center gap-2 border-none shadow-xl active:scale-95 transition-all">
              <Edit2 size={24} />
              <span className="text-[0.6rem] font-black uppercase tracking-tighter leading-none text-center px-2">Edit Poster</span>
            </button>
            <ActionIcon icon={Video} label="Video" color="text-rose-500" bg="bg-rose-50" />
          </div>
          <div className="flex landscape:flex-col gap-4 items-center">
            <ActionIcon icon={Download} label="Download" color="text-slate-600" bg="bg-slate-100" onClick={handleDownload} />
            <ActionIcon icon={MessageCircle} label="WhatsApp" color="text-white" bg="bg-[#25D366]" onClick={handleShare} isPrimary />
            <ActionIcon icon={Share2} label="Share" color="text-blue-500" bg="bg-blue-50" onClick={handleShare} className="landscape:flex portrait:hidden" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[210] flex flex-col max-h-[85vh] shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
               <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
               <div className="px-8 pt-4 pb-6 flex items-center justify-between border-b border-slate-50">
                  <div><h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Identity</h2><p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mt-1">Refining for premium standards</p></div>
                  <button onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border-none"><X size={24} /></button>
               </div>
               <div className="flex px-6 pt-4 border-b border-slate-50">
                  {[{ id: 'personal', icon: User, label: 'Personal' }, { id: 'business', icon: Building2, label: 'Business' }, { id: 'logo', icon: ImageIcon, label: 'Logo' }].map(tab => (
                    <button key={tab.id} onClick={() => setEditTab(tab.id)} className={`flex-1 py-4 flex flex-col items-center gap-2 border-none transition-all relative ${editTab === tab.id ? 'text-red-500' : 'text-slate-300'}`}>
                       <tab.icon size={22} strokeWidth={editTab === tab.id ? 3 : 2} /><span className="text-[0.7rem] font-black uppercase tracking-widest">{tab.label}</span>
                       {editTab === tab.id && <motion.div layoutId="tabUnderline" className="absolute bottom-0 w-12 h-1 bg-red-500 rounded-full" />}
                    </button>
                  ))}
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {editTab === 'personal' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
                       <InputField label="Full Name" icon={User} value={localData.name} onChange={(val) => updateField('name', val)} enabled={localData.enabledFields?.name} onToggle={() => toggleField('name')} />
                       <InputField label="Mobile Number" icon={Phone} value={localData.phone_number} onChange={(val) => updateField('phone_number', val)} enabled={localData.enabledFields?.phone} onToggle={() => toggleField('phone')} />
                       <InputField label="Email Address" icon={Mail} value={localData.email} onChange={(val) => updateField('email', val)} enabled={localData.enabledFields?.email} onToggle={() => toggleField('email')} />
                       <InputField label="Website" icon={Globe} value={localData.website} onChange={(val) => updateField('website', val)} enabled={localData.enabledFields?.website} onToggle={() => toggleField('website')} />
                    </motion.div>
                  )}
                  {editTab === 'business' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
                       <InputField label="Business Name" icon={Building2} value={localData.business_name} onChange={(val) => updateField('business_name', val)} enabled={localData.enabledFields?.business_name} onToggle={() => toggleField('business_name')} />
                       <InputField label="Address" icon={MapPin} value={localData.address} isTextArea onChange={(val) => updateField('address', val)} enabled={localData.enabledFields?.address} onToggle={() => toggleField('address')} />
                    </motion.div>
                  )}
                  {editTab === 'logo' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-10">
                        <LogoUpload label="Profile Photo" value={localData.userPhoto} onChange={(v) => updateField('userPhoto', v)} enabled={localData.enabledFields?.userPhoto} onToggle={() => toggleField('userPhoto')} isCircle />
                        <LogoUpload label="Business Logo" value={localData.logo} onChange={(v) => updateField('logo', v)} enabled={localData.enabledFields?.logo} onToggle={() => toggleField('logo')} />
                    </motion.div>
                  )}
               </div>
               <div className="px-8 pt-4 pb-10 border-t border-slate-50 flex gap-4">
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-red-500 text-white py-5 rounded-[2rem] text-[0.85rem] font-black uppercase tracking-widest border-none shadow-xl active:scale-95 transition-all">Apply & Save Design</button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        .swiper-slide { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0.3; filter: blur(2px); }
        .swiper-slide-active { opacity: 1; transform: scale(1.05); filter: blur(0px); }
      `}} />
    </div>
  );
};

const ActionIcon = ({ icon: Icon, label, color, bg, onClick, isPrimary = false, className = "" }) => (
  <button onClick={onClick} className={`w-[75px] h-[75px] landscape:w-16 landscape:h-16 ${bg} ${color} rounded-full flex flex-col items-center justify-center border-none shadow-sm transition-all active:scale-90 ${isPrimary ? 'shadow-lg shadow-green-500/20' : ''} ${className}`}>
    <Icon size={24} className="landscape:size-5" />
    <span className="text-[0.55rem] font-black uppercase mt-1 landscape:hidden tracking-tighter">{label}</span>
  </button>
);

const InputField = ({ label, icon: Icon, value, onChange, isTextArea = false, enabled = true, onToggle }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between px-1"><label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Icon size={14} /> {label}</label>{onToggle && (<button onClick={onToggle} className={`w-6 h-6 rounded-md flex items-center justify-center border-none transition-colors ${enabled !== false ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-300'}`}><Check size={14} strokeWidth={4} /></button>)}</div>
    {isTextArea ? <textarea rows={3} className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 outline-none text-[0.95rem] font-bold text-slate-700 resize-none focus:border-red-200 transition-colors" value={value || ''} onChange={(e) => onChange(e.target.value)} /> : <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 outline-none text-[0.95rem] font-bold text-slate-700 focus:border-red-200 transition-colors" value={value || ''} onChange={(e) => onChange(e.target.value)} />}
  </div>
);

const LogoUpload = ({ label, value, onChange, enabled, onToggle, isCircle = false }) => (
  <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center justify-between border border-slate-100">
    <div className="flex items-center gap-5">
      <div className={`w-20 h-20 bg-white p-1 shadow-inner border border-slate-200 overflow-hidden ${isCircle ? 'rounded-full' : 'rounded-2xl flex items-center justify-center'}`}>
        {value ? <img src={value} className={`w-full h-full object-cover ${isCircle ? 'rounded-full' : 'object-contain'}`} /> : <User className="w-full h-full text-slate-100 p-2" />}
      </div>
      <div><h4 className="text-[1rem] font-bold text-slate-800">{label}</h4><label className="mt-2 inline-block bg-white text-slate-600 px-4 py-1.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest cursor-pointer shadow-sm border border-slate-100">Change<input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = (ev) => onChange(ev.target.result); r.readAsDataURL(f); } }} /></label></div>
    </div>
    <button onClick={onToggle} className={`w-8 h-8 rounded-lg flex items-center justify-center border-none ${enabled ? 'bg-red-500 text-white' : 'bg-slate-200 text-white'}`}><Check size={18} strokeWidth={3} /></button>
  </div>
);

export default BusinessCardEditor;
