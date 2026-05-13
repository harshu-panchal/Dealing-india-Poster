import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  X, Check, Download, Share2, Type, ImageIcon, 
  Palette, MousePointer2, Pencil, ChevronLeft, 
  ChevronRight, Save, Layout, Loader2, Video, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useEditor } from '../context/EditorContext';

const BusinessCardEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData: contextUserData } = useEditor();
  
  const [template, setTemplate] = useState(null);
  const [allTemplates, setAllTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    name: contextUserData.name || '',
    designation: contextUserData.designation || 'Business Manager',
    phone: contextUserData.phone_number || '',
    email: contextUserData.email || '',
    address: contextUserData.address || '',
    website: contextUserData.website || '',
    business_name: contextUserData.business_name || '',
    logo: contextUserData.logo || ''
  });

  const [selectedField, setSelectedField] = useState(null);
  const [fieldStyles, setFieldStyles] = useState({});
  const canvasRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${API_URL}/user/templates?limit=100`);
        const bcTemplates = data.templates.filter(t => 
           t.categoryId?.name?.toLowerCase().includes('business') || 
           t.fields?.length > 0 ||
           t.name?.toLowerCase().includes('business card')
        );
        setAllTemplates(bcTemplates);
        
        const current = bcTemplates.find(t => t._id === templateId) || bcTemplates[0];
        setTemplate(current);
      } catch (err) {
        console.error('Failed to fetch business cards:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [templateId, API_URL]);

  const handleFieldClick = (key) => {
    setSelectedField(key);
  };

  const updateFieldStyle = (key, newStyle) => {
    setFieldStyles(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...newStyle
      }
    }));
  };

  const handleDownload = async () => {
    if (!window.html2canvas || !canvasRef.current) return;
    try {
      const canvas = await window.html2canvas(canvasRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `business-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[5000]">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  if (!template) return <div>Template not found</div>;

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[4000] flex flex-col overflow-hidden">
      {/* Header matching Screenshot 3 vibe */}
      <header className="h-14 bg-[#ef4444] flex items-center px-4 shrink-0 text-white shadow-md">
        <button onClick={() => navigate(-1)} className="p-2 mr-2 hover:bg-white/10 rounded-full border-none bg-transparent cursor-pointer text-white">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest leading-none">Business Cards (74)</h1>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Upgrade Banner matching Screenshot 3 */}
        <div className="bg-[#fe9e00]/10 border-b border-[#fe9e00]/20 p-2 text-center shrink-0">
           <p className="text-[10px] font-black text-[#8a5d00] uppercase tracking-wider">
             This category has premium posters. Upgrade
           </p>
        </div>

        {/* Form Controls (Desktop Slide-in or Tooltip?) - Let's keep it clean on mobile */}
        {/* Main Content Area - Three Column Studio Layout for Desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f1f5f9]">
          
          {/* COLUMN 1: Template Gallery (Left Sidebar) */}
          <div className="hidden lg:flex w-[280px] flex-col bg-white border-r border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Layout size={14} className="text-rose-500" />
                 Design Library
               </h3>
               <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-100">
                 {allTemplates.length}
               </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/20">
               {allTemplates.map(t => (
                 <div 
                   key={t._id}
                   onClick={() => { setTemplate(t); navigate(`/business-card/editor/${t._id}`); }}
                   className={`group relative aspect-[1.75/1] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-[3px] shadow-sm ${template?._id === t._id ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-transparent hover:border-slate-300 hover:shadow-md'}`}
                 >
                   <img src={t.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className={`absolute inset-0 transition-opacity duration-300 ${template?._id === t._id ? 'bg-rose-500/5 opacity-100' : 'bg-black/0 group-hover:bg-black/5'}`} />
                   {template?._id === t._id && (
                     <div className="absolute top-2 right-2">
                        <div className="bg-rose-500 text-white rounded-full p-1 shadow-lg">
                           <Check size={12} strokeWidth={4} />
                        </div>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>

          {/* COLUMN 2: Center Stage (Card Preview) */}
          <div className="flex-1 p-6 md:p-12 lg:p-20 flex flex-col items-center justify-center overflow-y-auto relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            <div className="w-full max-w-[700px] relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Workspace Active</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight hidden md:block">{template.name || 'Professional Business Card'}</h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Landscape • Standard 3.5 x 2</p>
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                   </div>
                </div>
              </div>

              {/* Card Preview Container */}
              <div className="relative group transition-all duration-500">
                <div 
                  ref={canvasRef}
                  className="w-full aspect-[1.75/1] bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] md:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border-[8px] md:border-[12px] border-white transition-all group-hover:scale-[1.02]"
                  style={{ 
                     backgroundImage: `url(${template.image})`, 
                     backgroundSize: '100% 100%',
                     backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Field Indicators/Pencils */}
                  {template.fields?.map(field => (
                    <div 
                      key={field.key}
                      onClick={() => handleFieldClick(field.key)}
                      className="absolute flex items-center gap-1 cursor-pointer group/field z-[100]"
                      style={{
                        top: field.position.y || '10%',
                        left: field.position.x || '10%',
                      }}
                    >
                      <div className="bg-[#3b82f6] text-white p-1.5 rounded-lg shadow-xl group-hover/field:scale-125 group-hover/field:rotate-12 transition-all">
                         <Pencil size={12} strokeWidth={3} />
                      </div>
                      <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-1 rounded-full shadow-2xl opacity-0 group-hover/field:opacity-100 transition-all -translate-x-2 group-hover/field:translate-x-0 whitespace-nowrap">
                        Edit {field.label}
                      </span>
                    </div>
                  ))}

                  {/* Actual dynamic content (Text & Images) */}
                  {template.fields?.map(field => {
                    if (field.type === 'image') {
                      const imgUrl = userData[field.key];
                      if (!imgUrl) return null;
                      return (
                        <div
                          key={`${field.key}-img`}
                          className="absolute overflow-hidden"
                          style={{
                            top: field.position.y || '10%',
                            left: field.position.x || '10%',
                            width: field.size?.width || '12%',
                            height: field.size?.height || 'auto',
                            aspectRatio: '1/1',
                            borderRadius: field.key === 'userPhoto' ? '50%' : '8px',
                            border: field.key === 'userPhoto' ? '2px solid white' : 'none',
                            boxShadow: field.key === 'userPhoto' ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                      );
                    }

                    if (field.type !== 'text') return null;
                    return (
                      <div
                        key={`${field.key}-text`}
                        className="absolute pointer-events-none whitespace-nowrap"
                        style={{
                          top: field.position.y || '10%',
                          left: field.position.x || '10%',
                          ...(field.style || {}),
                          ...(fieldStyles[field.key] || {})
                        }}
                      >
                        {userData[field.key] || field.label}
                      </div>
                    );
                  })}
                </div>
                
                {/* Floating tool hint */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Click fields on card to style</p>
                </div>
              </div>

              <div className="mt-16 flex flex-wrap justify-center gap-4">
                 <button className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:shadow-md active:scale-95 transition-all group">
                   <ImageIcon size={16} className="text-rose-500 transition-transform group-hover:rotate-12" /> 
                   Backgrounds
                 </button>
                 <button className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:shadow-md active:scale-95 transition-all group">
                   <Palette size={16} className="text-rose-500 transition-transform group-hover:scale-110" /> 
                   Theme Styles
                 </button>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Right Panel (Form Controls) */}
          <div className="w-full md:w-[360px] lg:w-[420px] flex flex-col bg-white border-l border-slate-200 shadow-[-10px_0_40px_rgba(0,0,0,0.03)] z-20 relative">
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                      <Save size={16} />
                   </div>
                   <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em]">Personalize Details</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Changes are updated in real-time on the card preview</p>
              </div>

              <div className="space-y-10">
                {/* Image Uploaders Section */}
                <div className="space-y-6">
                  {['logo', 'userPhoto'].map(key => (
                    <div key={key} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                          {key === 'logo' ? 'Business Logo' : 'Profile Photo'}
                        </label>
                        {userData[key] && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Applied</span>}
                      </div>
                      <div className="flex items-center gap-5">
                        <div className={`w-20 h-20 rounded-2xl bg-slate-50 border-[3px] border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-rose-500/40 ${userData[key] ? 'border-solid border-rose-500 shadow-lg shadow-rose-500/10' : ''}`}>
                          {userData[key] ? (
                            <img src={userData[key]} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <ImageIcon size={24} className="text-slate-200" />
                          )}
                        </div>
                        <label className="flex-1">
                          <div className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer text-center uppercase tracking-widest shadow-sm">
                            {userData[key] ? 'Update Image' : 'Pick Image'}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setUserData({...userData, [key]: reader.result});
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Text Fields Section */}
                <div className="space-y-5">
                  <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Information Fields</h4>
                  {['name', 'designation', 'phone', 'email', 'business_name', 'website', 'address'].map(key => (
                    <div key={key} className="group">
                      <div className="flex items-center justify-between mb-2.5">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-focus-within:text-rose-600 transition-colors">
                           {key.replace('_', ' ')}
                         </label>
                      </div>
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 group-focus-within:border-rose-500/40 group-focus-within:bg-white group-focus-within:shadow-[0_15px_30px_rgba(225,29,72,0.08)] transition-all duration-300">
                        <input 
                          type="text" 
                          value={userData[key]} 
                          onChange={(e) => setUserData({...userData, [key]: e.target.value})}
                          placeholder={`Enter your ${key.replace('_', ' ')}...`}
                          className="w-full border-none p-0 bg-transparent text-[13px] font-black text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-tight"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions - Premium Design */}
        <div className="bg-white border-t border-slate-200 px-6 lg:px-12 py-5 flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.04)] z-[30] shrink-0">
           <button className="h-12 px-8 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 border-none cursor-pointer">
             Design History
           </button>

           <div className="flex items-center gap-8 md:gap-10">
              <div onClick={handleDownload} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:scale-110 transition-all duration-300">
                    <Video size={22} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-800 transition-colors">Video</span>
              </div>
              <div onClick={handleDownload} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:scale-110 transition-all duration-300">
                    <Download size={22} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center group-hover:text-slate-800 transition-colors">Save</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300">
                    <MessageCircle size={22} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-800 transition-colors">Direct</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:scale-110 transition-all duration-300">
                    <Share2 size={22} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-slate-800 transition-colors">Share</span>
              </div>
           </div>
        </div>

        {/* Floating Editor Toolbar (for styling) */}
        <AnimatePresence>
            {selectedField && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-28 left-4 right-4 bg-slate-900/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 z-[4500] border border-white/10 md:left-1/2 md:right-auto md:-translate-x-1/2"
              >
                <div className="flex flex-col gap-1 pr-4 border-r border-white/10">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Font System</p>
                   <p className="text-xs font-black uppercase text-red-500">{selectedField}</p>
                </div>
                <div className="flex items-center gap-4 flex-1">
                   <div className="flex items-center gap-2">
                     <button onClick={() => updateFieldStyle(selectedField, { fontSize: Math.max(8, parseInt(fieldStyles[selectedField]?.fontSize || 12) - 1) + 'px' })} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border-none text-white cursor-pointer hover:bg-white/20">-</button>
                     <span className="text-[10px] font-black w-6 text-center">{parseInt(fieldStyles[selectedField]?.fontSize || 12)}</span>
                     <button onClick={() => updateFieldStyle(selectedField, { fontSize: Math.min(40, parseInt(fieldStyles[selectedField]?.fontSize || 12) + 1) + 'px' })} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border-none text-white cursor-pointer hover:bg-white/20">+</button>
                   </div>
                   <input type="color" value={fieldStyles[selectedField]?.color || '#000000'} onChange={(e) => updateFieldStyle(selectedField, { color: e.target.value })} className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent" />
                   <button onClick={() => setSelectedField(null)} className="ml-auto w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center border-none cursor-pointer shadow-lg">
                      <Check size={18} />
                   </button>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessCardEditor;
