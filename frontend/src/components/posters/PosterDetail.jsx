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
          
          {/* Dynamic Branding Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-[10] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm p-2 px-3.5 flex items-center gap-3 border-t border-gray-100/50">
              <div className="w-10 h-10 bg-gray-50 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center shadow-inner">
                <img src={userData.logo} alt="logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.8rem] font-black text-gray-900 leading-tight truncate px-0.5">{userData.business_name}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6rem] font-bold text-gray-500 mt-0.5">
                  {(userData.enabledFields?.phone && userData.phone_number) && (
                    <span className="flex items-center gap-1 shrink-0"><Phone size={9} className="text-red-500" fill="currentColor" /> {userData.phone_number}</span>
                  )}
                  {(userData.enabledFields?.website && userData.website) && (
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <Globe size={9} className="text-red-500" /> {userData.website}
                    </span>
                  )}
                  {(!userData.enabledFields?.website && userData.enabledFields?.email && userData.email) && (
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <Globe size={9} className="text-red-500" /> {userData.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Photo Overlay (Matching Ref Image 3) */}
          <div 
            className="absolute bottom-16 right-4 z-[20] flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            onClick={() => onEdit(template)}
          >
            <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow-xl border border-white/50 overflow-hidden relative group">
              {userData.userPhoto ? (
                <img src={userData.userPhoto} alt="User" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-full flex flex-col items-center justify-center text-gray-400">
                  <User size={24} />
                  <span className="absolute bottom-1.5 text-[5px] font-black bg-white/80 px-1 py-0.5 rounded-full shadow-sm">YOUR PHOTO HERE</span>
                </div>
              )}
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
