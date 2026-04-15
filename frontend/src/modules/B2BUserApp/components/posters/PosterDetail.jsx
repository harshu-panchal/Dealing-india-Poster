import { ArrowLeft, Heart, Video, Download, MessageCircle, Share2, User, Phone, Globe, X, Star, Mail, MapPin, Hash, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import VideoEditor from '../editor/VideoEditor';
import { useState, useRef, useEffect } from 'react';

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
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const posterRef = useRef(null);

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
  const nameFontClass = hasFrameApplied ? 'text-[0.65rem] lg:text-[1rem]' : 'text-[0.75rem] lg:text-2xl';
  const detailFontClass = hasFrameApplied ? 'text-[0.45rem] lg:text-[0.7rem]' : 'text-[0.5rem] lg:text-base';
  
  // Poster-relative defaults (shifted lower)
  const nameDefaultY = hasFrameApplied ? '82%' : '80%';
  const phoneDefaultY = hasFrameApplied ? '86%' : '85%';
  const websiteDefaultY = hasFrameApplied ? '88%' : '88%';
  const emailDefaultY = hasFrameApplied ? '90%' : '91%';
  const addressDefaultY = hasFrameApplied ? '92%' : '94%';
  const gstDefaultY = hasFrameApplied ? '93%' : '96%';

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

  const effectiveNamePos = migratePos(userData.namePos, { x: '5%', y: nameDefaultY });
  const effectivePhonePos = migratePos(userData.phonePos, { x: '5%', y: phoneDefaultY });
  const effectiveWebsitePos = migratePos(userData.websitePos, { x: '5%', y: websiteDefaultY });
  const effectiveEmailPos = migratePos(userData.emailPos, { x: '5%', y: emailDefaultY });
  const effectiveAddressPos = migratePos(userData.addressPos, { x: '5%', y: addressDefaultY });
  const effectiveGstPos = migratePos(userData.gstPos, { x: '5%', y: gstDefaultY });

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
             {/* Captured Area */}
            <div ref={posterRef} className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl flex items-center justify-center border border-[#e2e8f0]" style={{ backgroundColor: '#ffffff' }}>
               {/* Poster Background */}
               <img 
                 src={currentTemplate.image} 
                 alt={currentTemplate.title} 
                 crossOrigin="anonymous"
                 className="w-full h-full object-cover relative z-[1]" 
               />
               
               {/* Frame Layer (Middle) */}
               {activeFrame && (
                 <img 
                   src={activeFrame} 
                   className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]" 
                   alt="Frame Overlay"
                   crossOrigin="anonymous"
                 />
               )}

               {/* Dedicated Content Layer (Top) */}
               <div className="text-layer absolute inset-0 z-[75] pointer-events-none">
                   {/* Branding items - relative to whole poster */}
                   {userData.enabledFields?.business_name !== false && (
                     <div 
                       className={`text-white ${nameFontClass} font-black leading-tight uppercase ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`} 
                       style={{ 
                         left: effectiveNamePos.x, 
                         top: effectiveNamePos.y, 
                         textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                         whiteSpace: 'nowrap'
                       }}
                     >
                         {userData.business_name || 'Your Business Name'}
                     </div>
                   )}
                   <div className="flex flex-col relative h-full">
                      {userData.enabledFields?.phone && (
                        <div 
                          className={`text-white ${detailFontClass} font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} uppercase absolute`} 
                          style={{ 
                            left: effectivePhonePos.x, 
                            top: effectivePhonePos.y, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {userData.phone_number || '9876543210'}
                        </div>
                      )}
                      {userData.enabledFields?.website && userData.website && (
                        <div 
                          className={`text-white ${detailFontClass} font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`} 
                          style={{ 
                            left: effectiveWebsitePos.x, 
                            top: effectiveWebsitePos.y, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {userData.website}
                        </div>
                      )}
                      {userData.enabledFields?.email && userData.email && (
                        <div 
                          className={`text-white ${detailFontClass} font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`} 
                          style={{ 
                            left: effectiveEmailPos.x, 
                            top: effectiveEmailPos.y, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {userData.email}
                        </div>
                      )}
                      {userData.enabledFields?.address && userData.address && (
                        <div 
                          className={`text-white ${detailFontClass} font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} absolute`} 
                          style={{ 
                            left: effectiveAddressPos.x, 
                            top: effectiveAddressPos.y, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {userData.address}
                        </div>
                      )}
                      {(userData.enabledFields?.gst || (userData.gst_number || '').trim()) && (
                        <div 
                          className={`text-white ${detailFontClass} font-bold ${hasFrameApplied ? 'tracking-wide' : 'tracking-widest'} uppercase absolute`} 
                          style={{ 
                            left: effectiveGstPos.x, 
                            top: effectiveGstPos.y, 
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {userData.gst_number}
                        </div>
                      )}
                   </div>

                   {/* Visual Reference Only branding bar */}
                   <div className="absolute bottom-0 left-0 right-0 h-[50px] lg:h-[100px] flex items-center px-4 lg:px-8 pointer-events-none">
                   </div>

                  {/* Extra Texts */}
                  {userData.extraTexts?.map(t => (
                    <div key={t.id} className="absolute font-black" style={{ left: t.x || '40%', top: t.y || '40%', color: t.color, fontSize: `${t.size}px`, textShadow: '0 2px 4px rgba(0,0,0,0.8)', zIndex: 90, whiteSpace: 'nowrap' }}>
                      {t.text}
                    </div>
                  ))}
               </div>

               {/* Stickers & Photos Layer */}
               <div className="absolute inset-0 z-[80] pointer-events-none">
                 {userData.enabledFields?.userPhoto && (
                   <div className="absolute" style={{ left: userData.userPhotoPos?.x || '70%', top: userData.userPhotoPos?.y || (hasFrameApplied ? '74%' : '70%'), width: hasFrameApplied ? '14%' : '18%', height: hasFrameApplied ? '14%' : '18%', zIndex: 85 }}>
                     <img 
                       src={userData.userPhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                       className="w-full h-full rounded-full border-2 border-white object-cover shadow-xl" 
                       crossOrigin="anonymous" 
                     />
                   </div>
                 )}
                 {userData.enabledFields?.logo && userData.logo && (
                   <div className="absolute" style={{ left: userData.logoPos?.x || '10%', top: userData.logoPos?.y || (hasFrameApplied ? '80%' : '75%'), width: hasFrameApplied ? '9%' : '12%', height: hasFrameApplied ? '9%' : '12%', zIndex: 85 }}>
                     <img src={userData.logo} className="w-full h-full object-contain bg-white rounded-lg p-1 shadow-lg" crossOrigin="anonymous" />
                   </div>
                 )}
                  {userData.extraPhotos?.map(p => (
                    <div key={p.id} className="absolute" style={{ left: p.x || '50%', top: p.y || '30%', width: p.size, height: p.size, zIndex: 82 }}>
                      <img src={p.url} className="w-full h-full object-cover rounded shadow-xl border-2 border-white" crossOrigin="anonymous" />
                    </div>
                  ))}
                  {userData.stickers?.map(s => (
                    <div key={s.id} className="absolute" style={{ left: s.x || '20%', top: s.y || '20%', width: s.size, height: s.size, zIndex: 80 }}>
                      <img src={s.url} className="w-full h-full object-contain" crossOrigin="anonymous" />
                    </div>
                  ))}
               </div>

               {/* Fallback Branding Bar (only if no frame) */}
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
