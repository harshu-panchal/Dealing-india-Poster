import { ArrowLeft, Heart, Video, Download, MessageCircle, Share2, User, Phone, Globe, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import VideoEditor from '../editor/VideoEditor';
import { useState } from 'react';

const PosterDetail = ({ template, onEdit, onClose }) => {
  const { userData, frames, selectedFrame, setSelectedFrame } = useEditor();
  const [showVideoEditor, setShowVideoEditor] = useState(false);

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-[2000] flex flex-col"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
    >
      <div className="bg-[#b91c1c] px-4 flex items-center gap-4 text-white" style={{ paddingTop: 'calc(0.75rem + var(--safe-top))', paddingBottom: '0.75rem' }}>
        <button className="bg-transparent text-white p-0 flex items-center active:scale-95 transition-transform" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          <h3 className="text-[1.1rem] font-bold truncate">{template.category || 'Ramadan Mubarak Status'} 🌙</h3>
          <span className="text-[0.95rem] opacity-80">(21)</span>
        </div>
        <button className="bg-[#fde047] text-[#854d0e] px-3 py-1 rounded-sm text-[0.75rem] font-extrabold active:scale-95 transition-transform shadow-sm">
          UPGRADE
        </button>
      </div>

      <div className="bg-[#fff7ed] text-[#c2410c] p-2.5 px-4 text-center text-[0.85rem] font-semibold border-b border-[#ffedd5]">
         This category has premium posters. <strong className="cursor-pointer underline">Upgrade</strong>
      </div>

      <div className="flex-1 bg-[#f1f5f9] flex items-center justify-center p-3 animate-in fade-in duration-500">
        <div className="relative w-full max-w-[420px] aspect-square rounded-sm overflow-hidden shadow-2xl bg-white flex items-center justify-center">
          <img 
            src={template.image} 
            alt={template.title} 
            className="w-full h-full object-cover block" 
            onLoad={(e) => e.target.style.opacity = 1}
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
          />
          
          {/* Unified Branding Overlay (Dynamic based on selected frame) */}
          <div className="absolute bottom-0 left-0 right-0 z-[10] pointer-events-none w-full">
            <div className={`${selectedFrame?.id === 2 ? 'bg-orange-500/95' : 'bg-black/95'} flex h-[60px] lg:h-[80px] shadow-2xl overflow-visible border-t border-white/10`}>
                {/* Left Details */}
                <div className="flex-1 flex flex-col justify-center px-4 lg:px-8">
                  <div className="text-white text-sm lg:text-xl font-black leading-tight truncate uppercase tracking-wide">
                      {userData.business_name || 'SHEETAL'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-[18px] h-[18px] lg:w-6 lg:h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                        <MessageCircle size={10} className="text-white fill-white lg:w-4 lg:h-4" />
                      </div>
                      <span className="text-white text-[0.8rem] lg:text-base font-bold tracking-wider">{userData.phone_number || '6261265704'}</span>
                  </div>
                </div>

                {/* Floating Circular Profile Holder (Matches Feed) */}
                <div className="relative w-[110px] lg:w-[160px] flex-shrink-0 flex items-center justify-center">
                  <div className="absolute -top-4 lg:-top-6 right-2 w-[85px] h-[85px] lg:w-[130px] lg:h-[130px] z-30">
                      <div className="w-full h-full p-1.5 bg-white rounded-full shadow-xl border-4 border-white flex flex-col items-center justify-center overflow-hidden">
                          {userData.userPhoto ? (
                            <img src={userData.userPhoto} className="w-full h-full object-cover rounded-full" alt="u" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
                               <User size={30} className="text-gray-300 lg:w-20 lg:h-20" />
                               <div className="text-[0.4rem] lg:text-[0.65rem] font-black text-red-600 text-center leading-[0.85] uppercase mt-0.5">
                                 YOUR PHOTO<br/>HERE
                               </div>
                            </div>
                          )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[0.45rem] lg:text-[0.7rem] font-black tracking-tight whitespace-nowrap bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-transform" onClick={(e) => {
                        e.stopPropagation();
                        onEdit(template);
                      }}>
                          Edit Poster
                      </div>
                  </div>
                </div>
            </div>
          </div>          {/* Like Count (Matches Photo Pill) */}
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-[20] bg-[#64748b]/40 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center gap-2 text-[0.8rem] font-bold shadow-lg border border-white/10">
            <Heart size={14} className="text-white" fill="currentColor" />
            <span>1.1K</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
         <div className="flex items-center justify-between">
            <h4 className="text-[0.95rem] font-medium text-gray-500">Frames</h4>
         </div>
         
         <div className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
            {/* None Option (Matches Photo Circle) */}
            <div 
              className={`min-w-[75px] h-[75px] rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${!selectedFrame ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
              onClick={() => setSelectedFrame(null)}
            >
               <div className="w-8 h-8 rounded-full border-2 border-slate-400 flex items-center justify-center relative">
                  <div className="w-10 h-[2px] bg-slate-400 rotate-45 absolute" />
               </div>
            </div>
            
            {/* Map Adminized Frames (Square Thumbs) */}
            {frames.map(frame => (
               <div 
                 key={frame.id}
                 className={`min-w-[75px] h-[75px] rounded-xl overflow-hidden border-2 relative cursor-pointer transition-all ${selectedFrame?.id === frame.id ? 'border-blue-500 scale-95 shadow-md' : 'border-gray-200 opacity-80'}`}
                 onClick={() => setSelectedFrame(frame)}
               >
                  <img src={frame.preview} className="w-full h-full object-cover" />
                  {selectedFrame?.id === frame.id && (
                    <div className="absolute inset-0 bg-blue-500/10" />
                  )}
               </div>
            ))}
         </div>
      </div>

      <div className="p-4 px-5 space-y-6" style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}>
        <button 
          className="w-full bg-white border border-[#4338ca] text-[#4338ca] p-3 rounded-md text-[1rem] font-bold active:bg-slate-50 transition-colors shadow-sm" 
          onClick={() => onEdit(template)}
        >
          Edit Poster
        </button>
        
        <div className="flex justify-between items-center px-2">
          <div 
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            onClick={() => setShowVideoEditor(true)}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-rose-500"><Video size={24} /></div>
            <span className="text-[0.7rem] text-[#64748b] font-medium">Video</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-rose-400"><Download size={24} /></div>
            <span className="text-[0.7rem] text-[#64748b] font-medium">Download</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-green-500"><MessageCircle size={24} /></div>
            <span className="text-[0.7rem] text-[#64748b] font-medium">Whatsapp</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-orange-500"><Share2 size={24} /></div>
            <span className="text-[0.7rem] text-[#64748b] font-medium">Share</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showVideoEditor && (
          <VideoEditor 
            template={template} 
            userData={userData} 
            onClose={() => setShowVideoEditor(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PosterDetail;
