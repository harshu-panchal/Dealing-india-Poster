import React, { useState } from 'react';
import { ArrowLeft, Video, Download, MessageCircle, Share2, Play, Pause, Edit3, X, Sparkles, Layers, Sliders, Wand2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoEditor = ({ template, userData, onClose }) => {
  const [showEffects, setShowEffects] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);

  const audioOptions = [
    { id: 1, title: 'आपके सेवा में आपके मित्र', subtitle: 'My Message | 00:01', selected: true },
    { id: 2, title: 'Generic-1', subtitle: 'Background Music | 00:22', selected: true }
  ];

  const effects = [
    { id: 'none', title: 'None', icon: <X size={24} /> },
    { id: 'blur', title: 'Blur', icon: <Layers size={24} /> },
    { id: 'fade', title: 'Fade Out', icon: <Sliders size={24} /> },
    { id: 'tectonic', title: 'Tectonic', icon: <Zap size={24} /> },
    { id: 'arti', title: 'Arti', icon: <Sparkles size={24} /> },
    { id: 'color', title: 'Color', icon: <Wand2 size={24} /> }
  ];

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-[2500] flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Header */}
      <div className="bg-[#b91c1c] p-3 px-4 flex items-center gap-4 text-white">
        <button className="bg-transparent text-white p-0 flex items-center active:scale-95 transition-transform" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-[1.1rem] font-bold">Add Audio</h3>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {/* Poster Preview with Branding */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-square rounded-sm overflow-hidden shadow-2xl bg-white">
             <img src={template.image} alt="Preview" className="w-full h-full object-cover" />
             
             {/* Play/Pause Overlay */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <button 
                  className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 shadow-2xl active:scale-90 transition-transform"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} className="ml-1" fill="white" />}
                </button>
             </div>

             {/* Simple Branding Bar */}
             <div className="absolute bottom-0 left-0 right-0 bg-white p-2 px-3 flex items-center gap-2.5">
               <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100">
                  <img src={userData.logo} alt="logo" className="w-full h-full object-contain" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-[0.65rem] font-black text-gray-900 leading-tight truncate">{userData.business_name}</div>
                  <div className="text-[0.5rem] font-bold text-gray-500">{userData.phone_number}</div>
               </div>
             </div>
          </div>
        </div>

        {/* Audio Content */}
        <div className="flex-1 bg-white rounded-t-3xl p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
           <div className="text-[0.9rem] font-bold text-gray-400 mb-5 tracking-tight">Choose Audio & Music</div>
           
           <div className="space-y-4">
              {audioOptions.map(option => (
                <div key={option.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                   <div className="flex-1">
                      <h4 className="text-[1rem] font-bold text-gray-800 mb-0.5">{option.title}</h4>
                      <p className="text-[0.75rem] text-gray-500 font-medium">{option.subtitle}</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border-2 border-blue-600 text-blue-600 text-sm font-bold bg-white active:bg-blue-50 transition-colors">
                        <Edit3 size={14} /> Edit
                      </button>
                      <input type="checkbox" defaultChecked={option.selected} className="w-6 h-6 accent-blue-600 rounded-md" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 px-6 border-t border-gray-100 bg-white flex items-center justify-between gap-2 pb-8">
         <button 
           className="bg-white border-2 border-blue-700 text-blue-700 px-6 py-3.5 rounded-xl font-black text-[1rem] flex items-center gap-2.5 active:scale-95 transition-transform"
           onClick={() => setShowEffects(true)}
         >
           <Video size={20} /> Video Effects
         </button>

         <div className="flex-1 flex justify-around items-center">
            <div className="flex flex-col items-center gap-1 text-[0.65rem] text-gray-500 font-bold">
               <Download size={24} strokeWidth={2.5} className="text-red-500" />
               <span>Download</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[0.65rem] text-gray-500 font-bold">
               <MessageCircle size={24} strokeWidth={2.5} className="text-green-500" />
               <span>Whatsapp</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[0.65rem] text-gray-500 font-bold">
               <Share2 size={24} strokeWidth={2.5} className="text-blue-500" />
               <span>Share</span>
            </div>
         </div>
      </div>

      {/* Effects Modal */}
      <AnimatePresence>
        {showEffects && (
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[3000] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEffects(false)}
          >
            <motion.div 
              className="w-full bg-white rounded-t-[32px] p-6 pb-12 flex flex-col gap-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
            >
               <div className="flex items-center justify-center overflow-x-auto gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4">
                  {effects.map(fx => (
                    <div 
                      key={fx.id} 
                      className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                      onClick={() => setSelectedEffect(fx.id)}
                    >
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${selectedEffect === fx.id ? 'bg-gray-900 text-white scale-110 shadow-xl' : 'bg-gray-100 text-gray-800'}`}>
                          {fx.icon}
                       </div>
                       <span className={`text-[0.75rem] font-bold ${selectedEffect === fx.id ? 'text-gray-900' : 'text-gray-400'}`}>{fx.title}</span>
                       {selectedEffect === fx.id && <div className="h-0.5 w-8 bg-blue-500 rounded-full" />}
                    </div>
                  ))}
               </div>

               <button 
                 className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-200 active:scale-[0.98] transition-all border-none"
                 onClick={() => setShowEffects(false)}
               >
                 Apply Effect
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoEditor;
