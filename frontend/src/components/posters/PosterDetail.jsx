import { ArrowLeft, Heart, Video, Download, MessageCircle, Share2, User, Phone, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import VideoEditor from '../editor/VideoEditor';
import { useState } from 'react';

const PosterDetail = ({ template, onEdit, onClose }) => {
  const { userData } = useEditor();
  const [showVideoEditor, setShowVideoEditor] = useState(false);

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-[2000] flex flex-col"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
    >
      <div className="bg-[#b91c1c] p-3 px-4 flex items-center gap-4 text-white">
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
          
          {/* Unified Branding Overlay (Matches Feed Design) */}
          <div className="absolute bottom-0 left-0 right-0 z-[10] pointer-events-none w-full">
            <div className="bg-black/95 flex h-[60px] lg:h-[80px] shadow-2xl overflow-visible border-t border-white/10">
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

                {/* Right Cutout Area */}
                <div className="w-[110px] lg:w-[160px] bg-[#f8fafc] relative rounded-tl-[2rem] lg:rounded-tl-[3.5rem] flex flex-col items-center justify-center border-l border-white/10 overflow-visible pt-1">
                  <div className="absolute -top-7 lg:-top-11 w-20 lg:w-36 h-20 lg:h-36 flex flex-col items-center pointer-events-none z-30">
                      {userData.userPhoto ? (
                        <img src={userData.userPhoto} className="w-full h-full object-contain mb-0.5 drop-shadow-md" alt="u" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <User size={36} className="text-gray-300 lg:w-20 lg:h-20 opacity-60 drop-shadow-sm" />
                          <div className="text-[0.45rem] lg:text-[0.7rem] font-black text-red-600 text-center leading-[0.85] mb-1 -mt-2 drop-shadow-sm bg-white/40 px-1 rounded uppercase">
                            YOUR PHOTO<br/>HERE
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="mt-auto pb-1.5 lg:pb-3 text-[0.45rem] lg:text-xs font-black tracking-tight whitespace-nowrap px-2">
                      <span className="text-gray-800">Click on </span> 
                      <span className="text-blue-600">Edit Poster</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Like Count */}
          <div className="absolute top-4 left-4 z-[20] bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[0.75rem] font-bold shadow-lg border border-white/10">
            <Heart size={14} className="text-red-500" fill="currentColor" />
            <span>244</span>
          </div>
        </div>
      </div>

      <div className="p-6 px-4 pb-10 bg-white flex flex-col gap-5">
        <button className="w-full bg-white border-2 border-[#4f46e5] text-[#4f46e5] p-3.5 rounded-xl text-lg font-bold shadow-sm active:bg-[#4f46e5]/5 transition-colors" onClick={() => onEdit(template)}>
          Edit Poster
        </button>
        
        <div className="flex justify-around items-center">
          <div 
            className="flex flex-col items-center gap-1.5 text-[0.75rem] text-[#64748b] font-medium cursor-pointer active:scale-95 transition-transform"
            onClick={() => setShowVideoEditor(true)}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f1f5f9] text-[#ec4899]"><Video size={20} /></div>
            <span>Video</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-[0.75rem] text-[#64748b] font-medium cursor-pointer active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f1f5f9] text-[#64748b]"><Download size={20} /></div>
            <span>Download</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-[0.75rem] text-[#64748b] font-medium cursor-pointer active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f1f5f9] text-[#22c55e]"><MessageCircle size={20} /></div>
            <span>Whatsapp</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-[0.75rem] text-[#64748b] font-medium cursor-pointer active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#f1f5f9] text-[#3b82f6]"><Share2 size={20} /></div>
            <span>Share</span>
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
