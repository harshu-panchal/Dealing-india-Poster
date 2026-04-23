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
        <div className="flex-1 bg-slate-50 p-6 flex flex-col items-center overflow-y-auto">
          {/* Card Preview Container */}
          <div 
            ref={canvasRef}
            className="w-full max-w-[500px] aspect-[1.75/1] bg-white shadow-2xl relative overflow-hidden rounded-xl border border-slate-200"
            style={{ 
               backgroundImage: `url(${template.image})`, 
               backgroundSize: 'cover'
            }}
          >
            {/* Field Indicators/Pencils from Screenshot 3 */}
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

            {/* Actual dynamic text for the final look */}
            {template.fields?.map(field => {
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

          {/* Quick Input Fields - Inline scrolling matching mobile UX */}
          <div className="w-full max-w-[500px] mt-8 space-y-4">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Card Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {['name', 'designation', 'phone', 'email', 'business_name', 'website'].map(key => (
                 <div key={key} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">{key.replace('_', ' ')}</label>
                    <input 
                      type="text" 
                      value={userData[key]} 
                      onChange={(e) => setUserData({...userData, [key]: e.target.value})}
                      placeholder={`Enter ${key}...`}
                      className="w-full border-none p-0 text-xs font-bold text-slate-700 focus:outline-none"
                    />
                 </div>
               ))}
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
