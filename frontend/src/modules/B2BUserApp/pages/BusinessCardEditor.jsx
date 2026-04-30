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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* COLUMN 1: Template Gallery (Left Sidebar) */}
          <div className="hidden md:flex w-64 flex-col bg-white border-r border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-50">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Layout size={12} className="text-red-500" />
                 Templates ({allTemplates.length})
               </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
               {allTemplates.map(t => (
                 <div 
                   key={t._id}
                   onClick={() => { setTemplate(t); navigate(`/business-card/editor/${t._id}`); }}
                   className={`group relative aspect-[1.75/1] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${template?._id === t._id ? 'border-red-500 shadow-lg' : 'border-transparent hover:border-slate-200'}`}
                 >
                   <img src={t.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                   {template?._id === t._id && (
                     <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[1px] flex items-center justify-center">
                        <Check size={20} className="text-red-500 bg-white rounded-full p-0.5 shadow-sm" />
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>

          {/* COLUMN 2: Center Stage (Card Preview) */}
          <div className="flex-1 p-4 lg:p-8 flex flex-col items-center justify-start overflow-y-auto bg-slate-50/30">
            <div className="w-full max-w-[650px] sticky top-0">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Live Editor</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Landscape • Standard Size</p>
              </div>

              {/* Card Preview Container */}
              <div 
                ref={canvasRef}
                className="w-full aspect-[1.75/1] bg-white shadow-[0_30px_70px_rgba(0,0,0,0.12)] relative overflow-hidden rounded-2xl border border-slate-200"
                style={{ 
                   backgroundImage: `url(${template.image})`, 
                   backgroundSize: 'cover'
                }}
              >
                {/* Field Indicators/Pencils */}
                {template.fields?.map(field => (
                  <div 
                    key={field.key}
                    onClick={() => handleFieldClick(field.key)}
                    className="absolute flex items-center gap-1 cursor-pointer group"
                    style={{
                      top: field.position.y || '10%',
                      left: field.position.x || '10%',
                      zIndex: 20
                    }}
                  >
                    <div className="bg-[#3b82f6] text-white p-1 rounded shadow-lg group-hover:scale-110 transition-transform">
                       <Pencil size={10} strokeWidth={3} />
                    </div>
                    <span className="text-[8px] font-black bg-white/80 backdrop-blur-sm px-1.5 rounded text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {userData[field.key] || field.label}
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
                           width: field.size?.width || '50px',
                           height: field.size?.height || '50px',
                           borderRadius: field.key === 'userPhoto' ? '50%' : '0'
                         }}
                       >
                         <img src={imgUrl} className="w-full h-full object-contain" alt="" />
                       </div>
                     );
                   }

                   if (field.type !== 'text') return null;
                   return (
                     <div
                       key={`${field.key}-text`}
                       className="absolute pointer-events-none"
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
              <div className="mt-6 flex justify-center gap-4">
                 <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors">
                   <ImageIcon size={14} className="text-red-500" /> Change Background
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors">
                   <Palette size={14} className="text-red-500" /> Global Styles
                 </button>
              </div>
            </div>
          </div>

          {/* COLUMN 3: Right Panel (Form Controls) */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white border-l border-slate-100 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="mb-8">
                <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em] mb-1">Editor Options</h3>
                <p className="text-[10px] font-bold text-slate-400">Fill your card details below</p>
              </div>

              <div className="space-y-6">
                {/* Image Uploaders */}
                {['logo', 'userPhoto'].map(key => (
                  <div key={key} className="group">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                      {key === 'logo' ? 'Company Logo' : 'Profile Image'}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-red-500/30 ${userData[key] ? 'border-solid border-red-500' : ''}`}>
                        {userData[key] ? (
                          <img src={userData[key]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-300" />
                        )}
                      </div>
                      <label className="flex-1">
                        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center uppercase tracking-widest">
                          {userData[key] ? 'Change Image' : 'Upload Image'}
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

                {/* Text Fields */}
                {['name', 'designation', 'phone', 'email', 'business_name', 'website', 'address'].map(key => (
                  <div key={key} className="group">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-red-500">
                         {key.replace('_', ' ')}
                       </label>
                       {userData[key] && <Check size={12} className="text-green-500" />}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-focus-within:border-red-500/30 group-focus-within:bg-white group-focus-within:shadow-lg transition-all duration-300">
                      <input 
                        type="text" 
                        value={userData[key]} 
                        onChange={(e) => setUserData({...userData, [key]: e.target.value})}
                        placeholder={`Your ${key}...`}
                        className="w-full border-none p-0 bg-transparent text-[13px] font-black text-slate-800 focus:outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions from Screenshot 3 */}
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)] safe-area-bottom">
           <button className="h-11 px-6 rounded-2xl border-2 border-[#ef4444] text-[#ef4444] text-[10px] font-black uppercase tracking-widest bg-transparent hover:bg-red-50 transition-colors cursor-pointer">
             Edit Poster
           </button>

           <div className="flex items-center gap-6">
              <div onClick={handleDownload} className="flex flex-col items-center gap-1 cursor-pointer group">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <Video size={18} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Video</span>
              </div>
              <div onClick={handleDownload} className="flex flex-col items-center gap-1 cursor-pointer group">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <Download size={18} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center">Download</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer group">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#25d366]/10 group-hover:text-[#25d366] transition-colors">
                    <Phone size={18} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Whatsapp</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer group">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                    <Share2 size={18} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Share</span>
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
